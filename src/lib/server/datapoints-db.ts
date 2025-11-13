import db from './db-sqlite';
import { DataPoint } from '@/types/data';
import { v4 as uuidv4 } from 'uuid';

export function getAllDataPoints(): DataPoint[] {
  return db.prepare('SELECT * FROM data_points ORDER BY date ASC').all() as DataPoint[];
}

export function getDataPointsByMetric(metricId: string, startDate?: string, endDate?: string): DataPoint[] {
  let query = 'SELECT * FROM data_points WHERE metric_id = ?';
  const params: any[] = [metricId];

  if (startDate && endDate) {
    query += ' AND date BETWEEN ? AND ?';
    params.push(startDate, endDate);
  } else if (startDate) {
    query += ' AND date >= ?';
    params.push(startDate);
  } else if (endDate) {
    query += ' AND date <= ?';
    params.push(endDate);
  }

  query += ' ORDER BY date ASC';

  return db.prepare(query).all(...params) as DataPoint[];
}

export function getDataPoint(metricId: string, date: string): DataPoint | null {
  const row = db.prepare('SELECT * FROM data_points WHERE metric_id = ? AND date = ?').get(metricId, date);
  return row ? (row as DataPoint) : null;
}

export function addDataPoint(dataPoint: DataPoint): DataPoint {
  const stmt = db.prepare(`
    INSERT INTO data_points (id, metric_id, date, value, note, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    dataPoint.id,
    dataPoint.metricId,
    dataPoint.date,
    dataPoint.value,
    dataPoint.note || null,
    dataPoint.createdAt,
    dataPoint.updatedAt
  );

  return dataPoint;
}

export function updateDataPoint(id: string, changes: Partial<DataPoint>): DataPoint | null {
  const existing = db.prepare('SELECT * FROM data_points WHERE id = ?').get(id) as DataPoint | undefined;
  if (!existing) return null;

  const updated = { ...existing, ...changes, updatedAt: new Date().toISOString() };

  const stmt = db.prepare(`
    UPDATE data_points
    SET value = ?, note = ?, updated_at = ?
    WHERE id = ?
  `);

  stmt.run(updated.value, updated.note || null, updated.updatedAt, id);

  return updated;
}

export function deleteDataPoint(id: string): boolean {
  const stmt = db.prepare('DELETE FROM data_points WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

export function upsertDataPoints(date: string, data: Record<string, number>): void {
  const now = new Date().toISOString();

  const transaction = db.transaction(() => {
    for (const [metricId, value] of Object.entries(data)) {
      const existing = getDataPoint(metricId, date);

      if (existing) {
        updateDataPoint(existing.id, { value });
      } else {
        addDataPoint({
          id: uuidv4(),
          metricId,
          date,
          value,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  });

  transaction();
}
