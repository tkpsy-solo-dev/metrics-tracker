import Dexie, { Table } from 'dexie';
import { Metric } from '../types/metric';
import { DataPoint } from '../types/data';

export class MetricsDB extends Dexie {
  metrics!: Table<Metric, string>;
  dataPoints!: Table<DataPoint, string>;

  constructor() {
    super('MetricsTrackerDB');

    this.version(1).stores({
      metrics: 'id, order, active',
      dataPoints: 'id, metricId, date, [metricId+date]'
    });
  }
}

export const db = new MetricsDB();
