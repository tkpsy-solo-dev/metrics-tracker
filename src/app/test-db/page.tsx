'use client';

import { useEffect, useState } from 'react';
import { getAllMetrics, addMetric } from '../../lib/metrics';
import { addDataPoint, getDataPointsByMetric } from '../../lib/data';
import { getToday } from '../../lib/utils';
import { Metric } from '../../types/metric';
import { DataPoint } from '../../types/data';

export default function TestDBPage() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    loadMetrics();
  }, []);

  async function loadMetrics() {
    try {
      const data = await getAllMetrics();
      setMetrics(data);
      setStatus(`メトリクスを ${data.length} 件読み込みました`);
    } catch (error) {
      setStatus(`エラー: ${error}`);
    }
  }

  async function loadDataPoints(metricId: string) {
    try {
      const data = await getDataPointsByMetric(metricId);
      setDataPoints(data);
      setStatus(`データポイントを ${data.length} 件読み込みました`);
    } catch (error) {
      setStatus(`エラー: ${error}`);
    }
  }

  async function addTestDataPoint() {
    try {
      if (metrics.length === 0) {
        setStatus('メトリクスがありません');
        return;
      }

      const metricId = metrics[0].id;
      const date = getToday();
      const value = Math.random() * 100;

      await addDataPoint(metricId, date, value, 'テストデータ');
      setStatus(`データポイントを追加しました: ${value.toFixed(2)}`);

      await loadDataPoints(metricId);
    } catch (error) {
      setStatus(`エラー: ${error}`);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          データベーステスト
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Status: {status}
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">メトリクス一覧</h3>
        <ul className="space-y-2">
          {metrics.map(metric => (
            <li
              key={metric.id}
              className="p-2 border rounded hover:bg-gray-50 cursor-pointer"
              onClick={() => loadDataPoints(metric.id)}
            >
              {metric.name} ({metric.unit})
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">データポイント</h3>
        <button
          onClick={addTestDataPoint}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          テストデータを追加
        </button>
        <ul className="space-y-1 text-sm">
          {dataPoints.map(dp => (
            <li key={dp.id} className="p-1 border-b">
              {dp.date}: {dp.value} ({dp.note})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
