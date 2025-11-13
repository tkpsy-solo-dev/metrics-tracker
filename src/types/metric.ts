export type MetricType = 'number' | 'percentage' | 'count';

export interface Metric {
  id: string;
  name: string;
  description?: string;
  unit?: string;
  type: MetricType;
  color: string;
  min?: number;
  max?: number;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
