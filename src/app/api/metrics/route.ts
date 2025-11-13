import { NextRequest, NextResponse } from 'next/server';
import { getAllMetrics, addMetric, updateMetric, deleteMetric } from '@/lib/server/metrics-db';
import { Metric } from '@/types/metric';

export async function GET() {
  try {
    const metrics = getAllMetrics();
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Metrics GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const metric: Metric = await request.json();
    const created = addMetric(metric);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Metrics POST error:', error);
    return NextResponse.json({ error: 'Failed to create metric' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...changes } = await request.json();
    const updated = updateMetric(id, changes);
    if (!updated) {
      return NextResponse.json({ error: 'Metric not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Metrics PUT error:', error);
    return NextResponse.json({ error: 'Failed to update metric' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    const success = deleteMetric(id);
    if (!success) {
      return NextResponse.json({ error: 'Metric not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Metrics DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete metric' }, { status: 500 });
  }
}
