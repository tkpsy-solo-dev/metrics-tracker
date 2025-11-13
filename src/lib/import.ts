import { addMetric, updateMetric, getAllMetrics } from './metrics';
import { addDataPoint, getDataPoint, updateDataPoint } from './data';
import { Metric } from '@/types/metric';
import { DataPoint } from '@/types/data';
import { db } from './db';

interface ImportData {
  version: string;
  exportedAt: string;
  metrics: Metric[];
  dataPoints: DataPoint[];
}

/**
 * JSON文字列からデータをインポート
 * @param jsonString - インポートするJSON文字列
 * @throws バージョン不一致やパースエラーの場合
 */
export async function importFromJSON(jsonString: string): Promise<void> {
  let data: ImportData;

  try {
    data = JSON.parse(jsonString);
  } catch (error) {
    throw new Error('JSON パースエラー: 不正な JSON 形式です');
  }

  // バージョンチェック
  if (!data.version || data.version !== '1.0') {
    throw new Error(`サポートされていないバージョン: ${data.version || '不明'}`);
  }

  // 必須フィールドのチェック
  if (!data.metrics || !Array.isArray(data.metrics)) {
    throw new Error('不正なデータ: metrics フィールドが必要です');
  }

  if (!data.dataPoints || !Array.isArray(data.dataPoints)) {
    throw new Error('不正なデータ: dataPoints フィールドが必要です');
  }

  // トランザクション内でインポート実行
  await db.transaction('rw', [db.metrics, db.dataPoints], async () => {
    // メトリクスをインポート（既存IDは更新、新規は追加）
    for (const metric of data.metrics) {
      // メトリクスのバリデーション
      if (!metric.id || !metric.name || !metric.type) {
        console.warn('不正なメトリクスをスキップ:', metric);
        continue;
      }

      const existingMetric = await db.metrics.get(metric.id);

      if (existingMetric) {
        // 既存メトリクスを更新
        await updateMetric(metric.id, metric);
      } else {
        // 新規メトリクスを追加
        await addMetric(metric);
      }
    }

    // データポイントをインポート（upsert）
    for (const dp of data.dataPoints) {
      // データポイントのバリデーション
      if (!dp.metricId || !dp.date || dp.value === undefined) {
        console.warn('不正なデータポイントをスキップ:', dp);
        continue;
      }

      const existing = await getDataPoint(dp.metricId, dp.date);

      if (existing) {
        // 既存データポイントを更新
        await updateDataPoint(existing.id, {
          value: dp.value,
          note: dp.note,
        });
      } else {
        // 新規データポイントを追加
        await addDataPoint(dp.metricId, dp.date, dp.value, dp.note);
      }
    }
  });
}

/**
 * CSV文字列からデータをインポート
 * 簡易実装: メトリクス名から既存メトリクスを検索してマッピング
 * @param csvString - インポートするCSV文字列
 * @throws CSV形式エラーの場合
 */
export async function importFromCSV(csvString: string): Promise<void> {
  const lines = csvString.trim().split('\n');

  if (lines.length < 2) {
    throw new Error('CSV データが不正です: 最低2行（ヘッダー + データ）が必要です');
  }

  // ヘッダー解析
  const headers = lines[0].split(',').map(h => h.trim());

  if (headers.length < 2 || headers[0].toLowerCase() !== 'date') {
    throw new Error('CSV 形式エラー: 最初の列は "date" である必要があります');
  }

  const metricNames = headers.slice(1); // 日付以外

  // メトリクス名から ID へのマッピングを作成
  const allMetrics = await getAllMetrics();
  const nameToIdMap = new Map<string, string>();

  for (const metricName of metricNames) {
    const metric = allMetrics.find(m => m.name === metricName);
    if (metric) {
      nameToIdMap.set(metricName, metric.id);
    } else {
      console.warn(`警告: メトリクス "${metricName}" が見つかりません。スキップします。`);
    }
  }

  if (nameToIdMap.size === 0) {
    throw new Error('インポート可能なメトリクスが見つかりません');
  }

  // データ行解析
  let importedCount = 0;

  await db.transaction('rw', db.dataPoints, async () => {
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());

      if (values.length < 2) {
        console.warn(`行 ${i + 1} をスキップ: データが不足しています`);
        continue;
      }

      const date = values[0];

      // 日付の簡易バリデーション (YYYY-MM-DD形式)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        console.warn(`行 ${i + 1} をスキップ: 不正な日付形式 "${date}"`);
        continue;
      }

      for (let j = 0; j < metricNames.length; j++) {
        const metricName = metricNames[j];
        const metricId = nameToIdMap.get(metricName);

        if (!metricId) continue; // マッピングが見つからない場合はスキップ

        const valueStr = values[j + 1];

        if (!valueStr || valueStr === '') continue; // 空の値はスキップ

        const value = parseFloat(valueStr);

        if (isNaN(value)) {
          console.warn(`行 ${i + 1}, 列 "${metricName}": 数値ではない値 "${valueStr}" をスキップ`);
          continue;
        }

        // データポイントを追加/更新
        const existing = await getDataPoint(metricId, date);

        if (existing) {
          await updateDataPoint(existing.id, { value });
        } else {
          await addDataPoint(metricId, date, value);
        }

        importedCount++;
      }
    }
  });

  console.log(`CSV インポート完了: ${importedCount} 件のデータポイントをインポートしました`);
}

/**
 * ファイルをテキストとして読み込む
 * @param file - 読み込むファイル
 * @returns ファイルの内容（文字列）
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('ファイルの読み込みに失敗しました'));
      }
    };

    reader.onerror = () => {
      reject(new Error('ファイルの読み込み中にエラーが発生しました'));
    };

    reader.readAsText(file);
  });
}
