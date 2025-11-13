export interface DataPoint {
  id: string;
  metricId: string;
  date: string; // ISO 8601 (YYYY-MM-DD)
  value: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}
