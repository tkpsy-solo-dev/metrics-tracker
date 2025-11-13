'use client';

import { useEffect } from 'react';
import { initializeDefaultMetrics } from '../lib/metrics';

/**
 * クライアント側で実行される初期化コンポーネント
 * デフォルトメトリクスの初期化を行う
 */
export function ClientInit() {
  useEffect(() => {
    // アプリケーション起動時にデフォルトメトリクスを初期化
    initializeDefaultMetrics().catch(console.error);
  }, []);

  return null;
}
