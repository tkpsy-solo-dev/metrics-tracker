import db from './db-sqlite';
import { Metric } from '@/types/metric';

export function getAllMetrics(): Metric[] {
  const rows = db.prepare('SELECT * FROM metrics ORDER BY "order" ASC').all() as any[];
  return rows.map(row => ({
    ...row,
    active: Boolean(row.active),
  })) as Metric[];
}

export function getActiveMetrics(): Metric[] {
  const rows = db.prepare('SELECT * FROM metrics WHERE active = 1 ORDER BY "order" ASC').all() as any[];
  return rows.map(row => ({
    ...row,
    active: Boolean(row.active),
  })) as Metric[];
}

export function getMetricById(id: string): Metric | null {
  const row = db.prepare('SELECT * FROM metrics WHERE id = ?').get(id) as any;
  if (!row) return null;
  return {
    ...row,
    active: Boolean(row.active),
  } as Metric;
}

export function addMetric(metric: Metric): Metric {
  const stmt = db.prepare(`
    INSERT INTO metrics (id, name, description, unit, type, color, min, max, active, "order", created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    metric.id,
    metric.name,
    metric.description || null,
    metric.unit || null,
    metric.type,
    metric.color,
    metric.min ?? null,
    metric.max ?? null,
    metric.active ? 1 : 0,
    metric.order,
    metric.createdAt,
    metric.updatedAt
  );

  return metric;
}

export function updateMetric(id: string, changes: Partial<Metric>): Metric | null {
  const existing = getMetricById(id);
  if (!existing) return null;

  const updated = { ...existing, ...changes, updatedAt: new Date().toISOString() };

  const stmt = db.prepare(`
    UPDATE metrics
    SET name = ?, description = ?, unit = ?, type = ?, color = ?, min = ?, max = ?, active = ?, "order" = ?, updated_at = ?
    WHERE id = ?
  `);

  stmt.run(
    updated.name,
    updated.description || null,
    updated.unit || null,
    updated.type,
    updated.color,
    updated.min ?? null,
    updated.max ?? null,
    updated.active ? 1 : 0,
    updated.order,
    updated.updatedAt,
    id
  );

  return updated;
}

export function deleteMetric(id: string): boolean {
  const stmt = db.prepare('DELETE FROM metrics WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}
