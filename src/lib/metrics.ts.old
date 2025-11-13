import { db } from './db';
import { Metric } from '../types/metric';
import defaultMetrics from '../config/default-metrics.json';

/**
 * デフォルトメトリクスを初期化
 * 初回起動時のみ実行
 */
export async function initializeDefaultMetrics(): Promise<void> {
  const count = await db.metrics.count();

  if (count === 0) {
    await db.metrics.bulkAdd(defaultMetrics as Metric[]);
    console.log('デフォルトメトリクスを初期化しました');
  }
}

/**
 * すべてのメトリクスを取得（order でソート）
 */
export async function getAllMetrics(): Promise<Metric[]> {
  return await db.metrics.orderBy('order').toArray();
}

/**
 * アクティブなメトリクスのみ取得
 */
export async function getActiveMetrics(): Promise<Metric[]> {
  return await db.metrics
    .filter(metric => metric.active)
    .sortBy('order');
}

/**
 * ID でメトリクスを取得
 */
export async function getMetricById(id: string): Promise<Metric | undefined> {
  return await db.metrics.get(id);
}

/**
 * メトリクスを追加
 */
export async function addMetric(metric: Metric): Promise<string> {
  return await db.metrics.add(metric);
}

/**
 * メトリクスを更新
 */
export async function updateMetric(id: string, changes: Partial<Metric>): Promise<number> {
  return await db.metrics.update(id, changes);
}

/**
 * メトリクスを削除
 */
export async function deleteMetric(id: string): Promise<void> {
  await db.metrics.delete(id);
}

/**
 * メトリクスの表示順を更新
 */
export async function updateMetricsOrder(metrics: Metric[]): Promise<void> {
  await db.transaction('rw', db.metrics, async () => {
    for (const metric of metrics) {
      await db.metrics.update(metric.id, { order: metric.order });
    }
  });
}
