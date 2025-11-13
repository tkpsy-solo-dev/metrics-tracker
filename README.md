# Metrics Tracker

汎用メトリクス追跡・可視化ツール

## 概要

- メトリクス定義は JSON/YAML で設定ベース管理
- 日次手動入力 UI
- タイムシリーズデータを分析可能な形式で保存
- 複数メトリクスを折れ線グラフ表示
- クリックで全画面表示

## 技術スタック

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts
- Dexie.js (IndexedDB)
- React Hook Form + Zod

## セットアップ

```bash
pnpm install
pnpm dev
```

## 実装フェーズ

- [x] Phase 1: 基本セットアップと型定義
- [ ] Phase 2: データ管理
- [ ] Phase 3: データ入力 UI
- [ ] Phase 4: ダッシュボード
- [ ] Phase 5: 全画面グラフ
- [ ] Phase 6: メトリクス設定
- [ ] Phase 7: エクスポート機能
- [ ] Phase 8: 仕上げ
