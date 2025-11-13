'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getAllMetrics } from '@/lib/metrics';
import { getAllDataPoints } from '@/lib/data';
import { Metric } from '@/types/metric';
import { DataPoint } from '@/types/data';
import { GraphModal } from '@/components/GraphModal';

interface ChartDataPoint {
  date: string;
  displayDate: string;
  value: number;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<{ metric: Metric; data: ChartDataPoint[] } | null>(null);

  // データ読み込み
  useEffect(() => {
    async function loadData() {
      try {
        const [metricsData, dataPointsData] = await Promise.all([
          getAllMetrics(),
          getAllDataPoints()
        ]);

        // アクティブなメトリクスのみをorderでソート
        setMetrics(metricsData.filter(m => m.active).sort((a, b) => a.order - b.order));
        setDataPoints(dataPointsData);
      } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // 日付フォーマット: YYYY-MM-DD → MM/DD
  const formatDate = (dateString: string): string => {
    const [, month, day] = dateString.split('-');
    return `${month}/${day}`;
  };

  // メトリクスごとのグラフデータを生成
  const getChartData = (metricId: string): ChartDataPoint[] => {
    const metricData = dataPoints
      .filter(dp => dp.metricId === metricId)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(dp => ({
        date: dp.date,
        displayDate: formatDate(dp.date),
        value: dp.value
      }));

    return metricData;
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (metrics.length === 0) {
    return (
      <div className="p-4 md:p-8">
        <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>
        <p className="text-gray-600">
          メトリクスがありません。設定ページからメトリクスを有効化してください。
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">ダッシュボード</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {metrics.map(metric => {
          const chartData = getChartData(metric.id);

          return (
            <div
              key={metric.id}
              className="bg-white p-4 md:p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedMetric({ metric, data: chartData })}
            >
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  {metric.name}
                  {metric.unit && <span className="text-sm text-gray-500 ml-2">({metric.unit})</span>}
                </h2>
                {metric.description && (
                  <p className="text-sm text-gray-600 mt-1">{metric.description}</p>
                )}
              </div>

              {chartData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  データがありません
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="displayDate"
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickLine={{ stroke: '#9ca3af' }}
                    />
                    <YAxis
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickLine={{ stroke: '#9ca3af' }}
                      domain={[
                        metric.min !== undefined ? metric.min : 'auto',
                        metric.max !== undefined ? metric.max : 'auto'
                      ]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.375rem',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                      }}
                      labelStyle={{ color: '#374151', fontWeight: 600 }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '1rem' }}
                      iconType="line"
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={metric.color}
                      strokeWidth={2}
                      name={metric.name}
                      dot={{ fill: metric.color, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          );
        })}
      </div>

      {/* モーダル */}
      {selectedMetric && (
        <GraphModal
          metric={selectedMetric.metric}
          chartData={selectedMetric.data}
          onClose={() => setSelectedMetric(null)}
        />
      )}
    </div>
  );
}
