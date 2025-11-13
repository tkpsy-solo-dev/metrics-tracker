# Worker Configuration

You are **worker-6**.

## Assignment

- **Issue**: #7 - Phase 3: データ入力 UI
- **Repository**: tkpsy-solo-dev/metrics-tracker
- **GitHub URL**: https://github.com/tkpsy-solo-dev/metrics-tracker/issues/7
- **Project**: metrics-tracker（メトリクス追跡ツール）

## ⚠️ Branch Strategy (Critical)

**このリポジトリのブランチ戦略**:
- `main`: 本番用（将来の production デプロイ用、現在は未使用）
- `staging`: ステージング環境用
- `dev`: **開発用（あなたの作業用）**

**重要**:
- ✅ 自分の worktree は `dev` から切られています
- ✅ PR は **必ず `dev` を base として作成**
- ❌ `main` へ PR を作成しないでください

## Your Mission

1. **Issue #7 を読む**
   - Phase 3: データ入力 UI
   - 詳細な実装計画が書かれています
   - 手順に従って進めてください

2. **実装する**
   - React Hook Form + Zod でフォーム実装
   - 動的スキーマ生成（アクティブなメトリクスから）
   - 日付選択で既存データを自動ロード
   - バリデーション・エラーハンドリング
   - レスポンシブ UI（Tailwind CSS）
   - ナビゲーションリンク

3. **完了時の手続き**
   - ブランチを push: `git push origin issue-7-phase-3-`
   - **PR を作成（dev へ）**: `gh pr create --base dev --title "..." --body "..."`
     * 絶対に main へ PR を作成しないこと
     * 必ず base を `dev` に指定
   - Issue に完了を報告: コメントで「実装完了、PR #XXX を作成しました」

4. **重大な問題が発生した場合（完了できない）**
   - Issue にコメントで問題の詳細を記載してください
   - ユーザーの対応を待ってください

## Important Notes

- **既存コード**: Phase 1 と Phase 2 が完了しています
- **pnpm 使用**: package manager は pnpm を使用してください
- **TypeScript**: 型定義を厳密に行ってください
- **コミット**: 意味のある単位で分割してください

Good luck! 🚀
