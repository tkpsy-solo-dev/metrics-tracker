'use client';

import { useState } from 'react';
import { importFromJSON, importFromCSV, readFileAsText } from '@/lib/import';

export default function ConfigPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  /**
   * ファイルアップロードハンドラー
   */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setMessage('');

    try {
      const content = await readFileAsText(file);

      if (file.name.endsWith('.json')) {
        await importFromJSON(content);
        setMessage('✅ JSON インポート完了');
      } else if (file.name.endsWith('.csv')) {
        await importFromCSV(content);
        setMessage('✅ CSV インポート完了');
      } else {
        setMessage('❌ サポートされていないファイル形式です (.json または .csv のみ)');
      }

      // 成功時は3秒後にメッセージをクリア
      if (!message.startsWith('❌')) {
        setTimeout(() => setMessage(''), 3000);
      }

      // ファイル入力をリセット（同じファイルを再度選択できるように）
      e.target.value = '';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      setMessage(`❌ インポートエラー: ${errorMessage}`);
      console.error('インポートエラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
        メトリクス設定
      </h2>

      {/* データインポートセクション */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          データインポート
        </h3>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="file-upload"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              ファイルを選択
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".json,.csv"
              onChange={handleFileUpload}
              disabled={isLoading}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-sm text-gray-600 mt-2">
              JSON または CSV ファイルを選択してください
            </p>
          </div>

          {/* ローディング状態 */}
          {isLoading && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-sm">インポート中...</span>
            </div>
          )}

          {/* メッセージ表示 */}
          {message && (
            <div
              className={`p-3 rounded-md text-sm ${
                message.startsWith('✅')
                  ? 'bg-green-50 text-green-900'
                  : 'bg-red-50 text-red-900'
              }`}
            >
              {message}
            </div>
          )}

          {/* 使い方説明 */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">
              インポート形式について
            </h4>
            <div className="text-sm text-gray-600 space-y-2">
              <div>
                <strong>JSON形式:</strong>
                <ul className="list-disc list-inside ml-2 mt-1">
                  <li>メトリクス定義とデータポイントを含む完全なエクスポート</li>
                  <li>既存データは更新、新規データは追加されます</li>
                </ul>
              </div>
              <div>
                <strong>CSV形式:</strong>
                <ul className="list-disc list-inside ml-2 mt-1">
                  <li>最初の列は "date"（YYYY-MM-DD形式）</li>
                  <li>2列目以降はメトリクス名</li>
                  <li>既存メトリクスと名前が一致するもののみインポートされます</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 将来の設定項目用のプレースホルダー */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          その他の設定
        </h3>
        <p className="text-gray-600 text-sm">
          今後のフェーズで設定項目が追加される予定です
        </p>
      </div>
    </div>
  );
}
