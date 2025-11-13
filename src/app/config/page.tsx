'use client';

import { useState } from 'react';
import { exportToJSON, exportToCSV, downloadFile } from '@/lib/export';

export default function ConfigPage() {
  const [isExporting, setIsExporting] = useState(false);

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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">
        メトリクス設定
      </h2>

      {/* データエクスポートセクション */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          データエクスポート
        </h3>
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

      {/* 今後の設定機能用プレースホルダー */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          その他の設定
        </h3>
        <p className="text-gray-600">
          メトリクスの追加・編集・削除機能は今後実装予定です。
        </p>
      </div>
    </div>
  );
}
