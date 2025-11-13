'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getActiveMetrics } from '../../lib/metrics';
import { getDataPointsByDate, upsertDataPoints } from '../../lib/data';
import { getToday } from '../../lib/utils';
import { Metric } from '../../types/metric';

/**
 * メトリクスから動的に Zod スキーマを生成
 */
const createFormSchema = (metrics: Metric[]) => {
  const schemaFields: Record<string, z.ZodNumber> = {};

  metrics.forEach(metric => {
    let fieldSchema = z.number({
      message: '数値を入力してください',
    });

    // min/max の制約を追加
    if (metric.min !== undefined) {
      fieldSchema = fieldSchema.min(metric.min, {
        message: `${metric.min}以上の値を入力してください`,
      });
    }
    if (metric.max !== undefined) {
      fieldSchema = fieldSchema.max(metric.max, {
        message: `${metric.max}以下の値を入力してください`,
      });
    }

    schemaFields[metric.id] = fieldSchema;
  });

  return z.object(schemaFields);
};

export default function InputPage() {
  const [selectedDate, setSelectedDate] = useState<string>(getToday());
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  // メトリクスを読み込み
  useEffect(() => {
    loadMetrics();
  }, []);

  // フォームスキーマを動的生成
  const FormSchema = useMemo(() => createFormSchema(metrics), [metrics]);
  type FormData = z.infer<typeof FormSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  });

  // 選択された日付のデータを読み込み
  useEffect(() => {
    if (metrics.length > 0) {
      loadDataForDate(selectedDate);
    }
  }, [selectedDate, metrics]);

  /**
   * メトリクス読み込み
   */
  const loadMetrics = async () => {
    try {
      const data = await getActiveMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('メトリクス読み込みエラー:', error);
      setMessage('❌ メトリクスの読み込みに失敗しました');
    }
  };

  /**
   * 選択された日付のデータを読み込み
   */
  const loadDataForDate = async (date: string) => {
    try {
      const dataPoints = await getDataPointsByDate(date);

      // フォームに既存データを設定
      metrics.forEach(metric => {
        const dataPoint = dataPoints.find(dp => dp.metricId === metric.id);
        if (dataPoint) {
          setValue(metric.id, dataPoint.value);
        } else {
          setValue(metric.id, 0); // デフォルト値
        }
      });
    } catch (error) {
      console.error('データ読み込みエラー:', error);
      // エラーが発生してもフォームは表示する（新規入力として）
    }
  };

  /**
   * フォーム送信ハンドラー
   */
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setMessage('');

    try {
      // upsertDataPoints を使用して一括保存
      await upsertDataPoints(selectedDate, data);

      setMessage('✅ データを保存しました');

      // 3秒後にメッセージをクリア
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('保存エラー:', error);
      setMessage('❌ 保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * リセットハンドラー
   */
  const handleReset = () => {
    reset();
    // デフォルト値（0）に戻す
    metrics.forEach(metric => {
      setValue(metric.id, 0);
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
        データ入力
      </h2>

      {/* 日付選択 */}
      <div className="mb-6">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
          日付を選択
        </label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={getToday()}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* ローディング状態 */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* メトリクスが登録されていない場合 */}
      {!isLoading && metrics.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          メトリクスが登録されていません
        </div>
      )}

      {/* フォーム */}
      {!isLoading && metrics.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {metrics.map(metric => (
              <div key={metric.id} className="flex flex-col">
                <label htmlFor={metric.id} className="text-sm font-medium text-gray-700 mb-1">
                  {metric.name}
                  {metric.unit && <span className="text-gray-500 ml-1">({metric.unit})</span>}
                </label>
                <input
                  type="number"
                  id={metric.id}
                  step="any"
                  {...register(metric.id, { valueAsNumber: true })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`${metric.name}を入力`}
                />
                {errors[metric.id] && (
                  <span className="text-sm text-red-600 mt-1">
                    {errors[metric.id]?.message}
                  </span>
                )}
              </div>
            ))}

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {isSubmitting ? '保存中...' : '保存'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
              >
                リセット
              </button>
            </div>
          </form>
        </div>
      )}

      {/* メッセージ表示 */}
      {message && (
        <div className={`mt-4 p-3 rounded-md text-sm ${
          message.startsWith('✅')
            ? 'bg-green-50 text-green-900'
            : 'bg-red-50 text-red-900'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
