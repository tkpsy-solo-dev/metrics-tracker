import { NextRequest, NextResponse } from 'next/server';
import {
  getAllDataPoints,
  getDataPointsByMetric,
  addDataPoint,
  updateDataPoint,
  deleteDataPoint,
  upsertDataPoints,
} from '@/lib/server/datapoints-db';
import { DataPoint } from '@/types/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const metricId = searchParams.get('metricId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (metricId) {
      const dataPoints = getDataPointsByMetric(metricId, startDate || undefined, endDate || undefined);
      return NextResponse.json(dataPoints);
    }

    const dataPoints = getAllDataPoints();
    return NextResponse.json(dataPoints);
  } catch (error) {
    console.error('DataPoints GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch data points' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Bulk upsert
    if (body.date && body.data) {
      upsertDataPoints(body.date, body.data);
      return NextResponse.json({ success: true }, { status: 201 });
    }

    // Single add
    const dataPoint: DataPoint = body;
    const created = addDataPoint(dataPoint);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('DataPoints POST error:', error);
    return NextResponse.json({ error: 'Failed to create data point' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...changes } = await request.json();
    const updated = updateDataPoint(id, changes);
    if (!updated) {
      return NextResponse.json({ error: 'Data point not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error('DataPoints PUT error:', error);
    return NextResponse.json({ error: 'Failed to update data point' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    const success = deleteDataPoint(id);
    if (!success) {
      return NextResponse.json({ error: 'Data point not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DataPoints DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete data point' }, { status: 500 });
  }
}
