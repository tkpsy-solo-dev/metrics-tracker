import { getAllMetrics } from './metrics';
import { getAllDataPoints } from './data';

/**
 * メトリクスとデータポイントを JSON 形式でエクスポート
 */
export async function exportToJSON(): Promise<string> {
  const [metrics, dataPoints] = await Promise.all([
    getAllMetrics(),
    getAllDataPoints()
  ]);

  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    metrics,
    dataPoints
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * メトリクスとデータポイントを CSV 形式でエクスポート
 * 日付 × メトリクスのマトリクス形式
 */
export async function exportToCSV(): Promise<string> {
  const [metrics, dataPoints] = await Promise.all([
    getAllMetrics(),
    getAllDataPoints()
  ]);

  // CSV ヘッダー
  const metricNames = metrics.map(m => m.name);
  const header = ['日付', ...metricNames].join(',');

  // 日付ごとにデータをグループ化
  const dateMap = new Map<string, Map<string, number>>();

  dataPoints.forEach(dp => {
    if (!dateMap.has(dp.date)) {
      dateMap.set(dp.date, new Map());
    }
    dateMap.get(dp.date)!.set(dp.metricId, dp.value);
  });

  // CSV 行を生成
  const rows = Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => {
      const row = [date];
      metrics.forEach(metric => {
        row.push(String(values.get(metric.id) ?? ''));
      });
      return row.join(',');
    });

  return [header, ...rows].join('\n');
}

/**
 * ファイルをブラウザでダウンロード
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
