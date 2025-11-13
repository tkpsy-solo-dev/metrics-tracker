'use client';

import { useState } from 'react';
import { db } from '@/lib/db'; // 旧 Dexie.js

export default function MigratePage() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMigrate = async () => {
    setLoading(true);
    setStatus('IndexedDB からデータを読み込み中...');

    try {
      // 旧データを取得
      const metrics = await db.metrics.toArray();
      const dataPoints = await db.dataPoints.toArray();

      setStatus(`取得完了: Metrics ${metrics.length}件、DataPoints ${dataPoints.length}件`);

      // SQLite へ移行
      setStatus('SQLite へ移行中...');
      const res = await fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics, dataPoints }),
      });

      if (!res.ok) throw new Error('Migration failed');

      const result = await res.json();
      setStatus(
        `✅ 移行完了!\n` +
        `Metrics: ${result.migratedMetrics}件 (スキップ: ${result.skippedMetrics}件)\n` +
        `DataPoints: ${result.migratedDataPoints}件 (スキップ: ${result.skippedDataPoints}件)`
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      setStatus(`❌ エラー: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">データ移行</h1>
      <p className="mb-4">IndexedDB から SQLite へデータを移行します。</p>
      <button
        onClick={handleMigrate}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {loading ? '移行中...' : '移行開始'}
      </button>
      {status && (
        <pre className="mt-4 p-4 bg-gray-100 rounded whitespace-pre-wrap">{status}</pre>
      )}
    </div>
  );
}
