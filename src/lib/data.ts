import { db } from './db';
import { DataPoint } from '../types/data';
import { v4 as uuidv4 } from 'uuid';

/**
 * データポイントを追加
 */
export async function addDataPoint(
  metricId: string,
  date: string,
  value: number,
  note?: string
): Promise<string> {
  const now = new Date().toISOString();

  const dataPoint: DataPoint = {
    id: uuidv4(),
    metricId,
    date,
    value,
    note,
    createdAt: now,
    updatedAt: now,
  };

  return await db.dataPoints.add(dataPoint);
}

/**
 * データポイントを更新
 */
export async function updateDataPoint(
  id: string,
  changes: Partial<Omit<DataPoint, 'id' | 'metricId' | 'createdAt'>>
): Promise<number> {
  const now = new Date().toISOString();
  return await db.dataPoints.update(id, {
    ...changes,
    updatedAt: now,
  });
}

/**
 * データポイントを削除
 */
export async function deleteDataPoint(id: string): Promise<void> {
  await db.dataPoints.delete(id);
}

/**
 * 特定のメトリクスのデータポイントを取得（日付範囲指定）
 */
export async function getDataPointsByMetric(
  metricId: string,
  startDate?: string,
  endDate?: string
): Promise<DataPoint[]> {
  let query = db.dataPoints.where({ metricId });

  if (startDate && endDate) {
    query = query.and(dp => dp.date >= startDate && dp.date <= endDate);
  } else if (startDate) {
    query = query.and(dp => dp.date >= startDate);
  } else if (endDate) {
    query = query.and(dp => dp.date <= endDate);
  }

  return await query.sortBy('date');
}

/**
 * 特定の日付のデータポイントを取得
 */
export async function getDataPointsByDate(date: string): Promise<DataPoint[]> {
  return await db.dataPoints.where({ date }).toArray();
}

/**
 * 特定のメトリクス + 日付のデータポイントを取得
 */
export async function getDataPoint(
  metricId: string,
  date: string
): Promise<DataPoint | undefined> {
  return await db.dataPoints
    .where('[metricId+date]')
    .equals([metricId, date])
    .first();
}

/**
 * 複数のデータポイントを一括追加/更新
 */
export async function upsertDataPoints(
  date: string,
  data: Record<string, number>
): Promise<void> {
  const now = new Date().toISOString();

  await db.transaction('rw', db.dataPoints, async () => {
    for (const [metricId, value] of Object.entries(data)) {
      const existing = await getDataPoint(metricId, date);

      if (existing) {
        await updateDataPoint(existing.id, { value, updatedAt: now });
      } else {
        await addDataPoint(metricId, date, value);
      }
    }
  });
}

/**
 * 過去 N 日間のデータポイントを取得
 */
export async function getRecentDataPoints(
  metricId: string,
  days: number
): Promise<DataPoint[]> {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  return await getDataPointsByMetric(metricId, startDate, endDate);
}

/**
 * すべてのデータポイントを削除（テスト用）
 */
export async function clearAllDataPoints(): Promise<void> {
  await db.dataPoints.clear();
  console.log('すべてのデータポイントを削除しました');
}
