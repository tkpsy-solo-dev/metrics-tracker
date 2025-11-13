'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { getAllMetrics, addMetric, updateMetric, deleteMetric } from '@/lib/metrics';
import { Metric, MetricType } from '@/types/metric';
import { exportToJSON, exportToCSV, downloadFile } from '@/lib/export';
import { importFromJSON, importFromCSV, readFileAsText } from '@/lib/import';

const metricSchema = z.object({
  name: z.string().min(1, 'メトリクス名を入力してください'),
  description: z.string().optional(),
  unit: z.string().optional(),
  type: z.enum(['number', 'percentage', 'count'] as const),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, '有効な色コードを入力してください'),
  min: z.number().optional(),
  max: z.number().optional(),
});

type MetricFormData = z.infer<typeof metricSchema>;

export default function ConfigPage() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string>('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MetricFormData>({
    resolver: zodResolver(metricSchema),
    defaultValues: {
      type: 'number',
      color: '#3b82f6',
    },
  });

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const data = await getAllMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('メトリクスの読み込みに失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: MetricFormData) => {
    try {
      if (editingId) {
        // 更新
        await updateMetric(editingId, data);
      } else {
        // 新規追加
        const newMetric: Metric = {
          ...data,
          id: uuidv4(),
          order: metrics.length,
          active: true,
        };
        await addMetric(newMetric);
      }
      reset({
        name: '',
        description: '',
        unit: '',
        type: 'number',
        color: '#3b82f6',
        min: undefined,
        max: undefined,
      });
      setEditingId(null);
      await loadMetrics();
    } catch (error) {
      console.error('メトリクスの保存に失敗しました:', error);
      alert('メトリクスの保存に失敗しました');
    }
  };

  const handleEdit = (metric: Metric) => {
    setEditingId(metric.id);
    reset({
      name: metric.name,
      description: metric.description || '',
      unit: metric.unit || '',
      type: metric.type,
      color: metric.color,
      min: metric.min,
      max: metric.max,
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('このメトリクスを削除してもよろしいですか？')) {
      return;
    }
    try {
      await deleteMetric(id);
      await loadMetrics();
    } catch (error) {
      console.error('メトリクスの削除に失敗しました:', error);
      alert('メトリクスの削除に失敗しました');
    }
  };

  const handleToggleActive = async (metric: Metric) => {
    try {
      await updateMetric(metric.id, { active: !metric.active });
      await loadMetrics();
    } catch (error) {
      console.error('メトリクスの状態変更に失敗しました:', error);
      alert('メトリクスの状態変更に失敗しました');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    reset({
      name: '',
      description: '',
      unit: '',
      type: 'number',
      color: '#3b82f6',
      min: undefined,
      max: undefined,
    });
  };

  const handleExportJSON = async () => {
    try {
      setIsExporting(true);
      const content = await exportToJSON();
      const filename = `metrics-export-${new Date().toISOString().split('T')[0]}.json`;
      downloadFile(content, filename, 'application/json');
    } catch (error) {
      console.error('JSON エクスポートエラー:', error);
      alert('JSON エクスポート中にエラーが発生しました');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const content = await exportToCSV();
      const filename = `metrics-export-${new Date().toISOString().split('T')[0]}.csv`;
      downloadFile(content, filename, 'text/csv');
    } catch (error) {
      console.error('CSV エクスポートエラー:', error);
      alert('CSV エクスポート中にエラーが発生しました');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportMessage('');

    try {
      const content = await readFileAsText(file);

      if (file.name.endsWith('.json')) {
        await importFromJSON(content);
        setImportMessage('✅ JSON インポート完了');
      } else if (file.name.endsWith('.csv')) {
        await importFromCSV(content);
        setImportMessage('✅ CSV インポート完了');
      } else {
        setImportMessage('❌ サポートされていないファイル形式です (.json または .csv のみ)');
      }

      // 成功時は3秒後にメッセージをクリア
      if (importMessage.startsWith('✅')) {
        setTimeout(() => setImportMessage(''), 3000);
      }

      // データ再読み込み
      await loadMetrics();

      // ファイル入力をリセット
      e.target.value = '';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      setImportMessage(`❌ インポートエラー: ${errorMessage}`);
      console.error('インポートエラー:', error);
    } finally {
      setIsImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">メトリクス設定</h1>

      {/* 追加・編集フォーム */}
      <form onSubmit={handleSubmit(onSubmit)} className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {editingId ? 'メトリクスを編集' : '新規メトリクスを追加'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* メトリクス名 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メトリクス名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 作業時間"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* 説明 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
            <textarea
              {...register('description')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="メトリクスの説明を入力してください"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* 単位 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">単位</label>
            <input
              type="text"
              {...register('unit')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 時間、人、%"
            />
            {errors.unit && (
              <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
            )}
          </div>

          {/* タイプ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              タイプ <span className="text-red-500">*</span>
            </label>
            <select
              {...register('type')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="number">数値</option>
              <option value="percentage">パーセンテージ</option>
              <option value="count">カウント</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          {/* カラー */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              カラー <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                {...register('color')}
                className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                {...register('color')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#3b82f6"
              />
            </div>
            {errors.color && (
              <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>
            )}
          </div>

          {/* 最小値 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">最小値</label>
            <input
              type="number"
              step="any"
              {...register('min', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="任意"
            />
            {errors.min && (
              <p className="mt-1 text-sm text-red-600">{errors.min.message}</p>
            )}
          </div>

          {/* 最大値 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">最大値</label>
            <input
              type="number"
              step="any"
              {...register('max', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="任意"
            />
            {errors.max && (
              <p className="mt-1 text-sm text-red-600">{errors.max.message}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {editingId ? '更新' : '追加'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              キャンセル
            </button>
          )}
        </div>
      </form>

      {/* データエクスポートセクション */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">データエクスポート</h2>
        <p className="text-gray-600 mb-4">
          メトリクスデータを JSON または CSV 形式でエクスポートできます。
        </p>
        <div className="flex gap-4">
          <button
            onClick={handleExportJSON}
            disabled={isExporting}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isExporting ? 'エクスポート中...' : 'JSON でエクスポート'}
          </button>
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isExporting ? 'エクスポート中...' : 'CSV でエクスポート'}
          </button>
        </div>
      </div>

      {/* データインポートセクション */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">データインポート</h2>
        <p className="text-gray-600 mb-4">
          JSON または CSV 形式のファイルからメトリクスデータをインポートできます。
        </p>
        <div>
          <input
            type="file"
            accept=".json,.csv"
            onChange={handleFileUpload}
            disabled={isImporting}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {importMessage && (
            <p className={`mt-2 text-sm ${importMessage.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
              {importMessage}
            </p>
          )}
          {isImporting && (
            <p className="mt-2 text-sm text-gray-600">インポート中...</p>
          )}
        </div>
      </div>

      {/* メトリクス一覧 */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">登録済みメトリクス</h2>
        {metrics.length === 0 ? (
          <p className="text-gray-600">メトリクスが登録されていません。</p>
        ) : (
          <div className="space-y-4">
            {metrics.map((metric) => (
              <div
                key={metric.id}
                className={`bg-white p-4 rounded-lg shadow flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  !metric.active ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-6 h-6 rounded flex-shrink-0 mt-1"
                    style={{ backgroundColor: metric.color }}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      {metric.name}
                      {!metric.active && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                          無効
                        </span>
                      )}
                    </h3>
                    {metric.description && (
                      <p className="text-sm text-gray-600 mt-1">{metric.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-500">
                      <span>タイプ: {metric.type}</span>
                      {metric.unit && <span>単位: {metric.unit}</span>}
                      {metric.min !== undefined && <span>最小: {metric.min}</span>}
                      {metric.max !== undefined && <span>最大: {metric.max}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(metric)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleToggleActive(metric)}
                    className={`px-3 py-1 text-sm rounded focus:outline-none focus:ring-2 ${
                      metric.active
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 focus:ring-yellow-500'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500'
                    }`}
                  >
                    {metric.active ? '無効化' : '有効化'}
                  </button>
                  <button
                    onClick={() => handleDelete(metric.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
