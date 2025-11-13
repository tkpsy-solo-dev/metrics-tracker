'use client';

import { useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Metric } from '@/types/metric';

interface ChartDataPoint {
  date: string;
  displayDate: string;
  value: number;
}

interface GraphModalProps {
  metric: Metric;
  chartData: ChartDataPoint[];
  onClose: () => void;
}

export function GraphModal({ metric, chartData, onClose }: GraphModalProps) {
  // ESCキーで閉じる
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // 背景クリックで閉じる
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {metric.name}
              {metric.unit && <span className="text-lg text-gray-500 ml-2">({metric.unit})</span>}
            </h2>
            {metric.description && (
              <p className="text-sm text-gray-600 mt-1">{metric.description}</p>
            )}
          </div>

          {/* クローズボタン */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="閉じる"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* グラフエリア */}
        <div className="p-6">
          {chartData.length === 0 ? (
            <div className="h-[500px] flex items-center justify-center text-gray-500">
              データがありません
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={500}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="displayDate"
                  tick={{ fill: '#6b7280', fontSize: 14 }}
                  tickLine={{ stroke: '#9ca3af' }}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 14 }}
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
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontSize: '14px',
                  }}
                  labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: '4px' }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '1.5rem', fontSize: '14px' }}
                  iconType="line"
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={metric.color}
                  strokeWidth={3}
                  name={metric.name}
                  dot={{ fill: metric.color, r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* フッター（統計情報など - オプション） */}
        {chartData.length > 0 && (
          <div className="px-6 pb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500">データポイント数</p>
                <p className="text-lg font-semibold text-gray-800">{chartData.length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">最新値</p>
                <p className="text-lg font-semibold text-gray-800">
                  {chartData[chartData.length - 1].value.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">最小値</p>
                <p className="text-lg font-semibold text-gray-800">
                  {Math.min(...chartData.map(d => d.value)).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">最大値</p>
                <p className="text-lg font-semibold text-gray-800">
                  {Math.max(...chartData.map(d => d.value)).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
