import { NextResponse } from 'next/server';
import { addMetric } from '@/lib/server/metrics-db';
import { addDataPoint } from '@/lib/server/datapoints-db';
import { Metric } from '@/types/metric';
import { DataPoint } from '@/types/data';

export async function POST(request: Request) {
  try {
    const { metrics, dataPoints } = await request.json();

    let migratedMetrics = 0;
    let migratedDataPoints = 0;
    let skippedMetrics = 0;
    let skippedDataPoints = 0;

    // Metrics を移行
    for (const metric of metrics as Metric[]) {
      try {
        addMetric(metric);
        migratedMetrics++;
      } catch (error) {
        console.warn(`Skipping duplicate metric: ${metric.id}`);
        skippedMetrics++;
      }
    }

    // DataPoints を移行
    for (const dataPoint of dataPoints as DataPoint[]) {
      try {
        addDataPoint(dataPoint);
        migratedDataPoints++;
      } catch (error) {
        console.warn(`Skipping duplicate data point: ${dataPoint.id}`);
        skippedDataPoints++;
      }
    }

    return NextResponse.json({
      success: true,
      migratedMetrics,
      migratedDataPoints,
      skippedMetrics,
      skippedDataPoints,
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}
