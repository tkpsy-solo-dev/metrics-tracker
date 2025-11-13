import { Metric } from '@/types/metric';
import { DataPoint } from '@/types/data';

// Metrics API
export async function getAllMetrics(): Promise<Metric[]> {
  const res = await fetch('/api/metrics');
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
}

export async function getActiveMetrics(): Promise<Metric[]> {
  const metrics = await getAllMetrics();
  return metrics.filter(m => m.active).sort((a, b) => a.order - b.order);
}

export async function addMetric(metric: Metric): Promise<Metric> {
  const res = await fetch('/api/metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metric),
  });
  if (!res.ok) throw new Error('Failed to add metric');
  return res.json();
}

export async function updateMetric(id: string, changes: Partial<Metric>): Promise<Metric> {
  const res = await fetch('/api/metrics', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...changes }),
  });
  if (!res.ok) throw new Error('Failed to update metric');
  return res.json();
}

export async function deleteMetric(id: string): Promise<void> {
  const res = await fetch(`/api/metrics?id=${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete metric');
}

// DataPoints API
export async function getAllDataPoints(): Promise<DataPoint[]> {
  const res = await fetch('/api/datapoints');
  if (!res.ok) throw new Error('Failed to fetch data points');
  return res.json();
}

export async function getDataPointsByDate(date: string): Promise<DataPoint[]> {
  const allDataPoints = await getAllDataPoints();
  return allDataPoints.filter(dp => dp.date === date);
}

export async function getDataPointsByMetric(
  metricId: string,
  startDate?: string,
  endDate?: string
): Promise<DataPoint[]> {
  const params = new URLSearchParams({ metricId });
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const res = await fetch(`/api/datapoints?${params}`);
  if (!res.ok) throw new Error('Failed to fetch data points');
  return res.json();
}

export async function addDataPoint(dataPoint: DataPoint): Promise<DataPoint> {
  const res = await fetch('/api/datapoints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dataPoint),
  });
  if (!res.ok) throw new Error('Failed to add data point');
  return res.json();
}

export async function upsertDataPoints(date: string, data: Record<string, number>): Promise<void> {
  const res = await fetch('/api/datapoints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, data }),
  });
  if (!res.ok) throw new Error('Failed to upsert data points');
}

export async function updateDataPoint(id: string, changes: Partial<DataPoint>): Promise<DataPoint> {
  const res = await fetch('/api/datapoints', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...changes }),
  });
  if (!res.ok) throw new Error('Failed to update data point');
  return res.json();
}

export async function deleteDataPoint(id: string): Promise<void> {
  const res = await fetch(`/api/datapoints?id=${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete data point');
}
