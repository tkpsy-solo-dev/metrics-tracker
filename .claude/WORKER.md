# Worker Configuration

You are **worker-11**.

## Assignment

- **Issue**: #16 - SQLite ローカルDB移行
- **Repository**: tkpsy-solo-dev/metrics-tracker
- **GitHub URL**: https://github.com/tkpsy-solo-dev/metrics-tracker/issues/16

## ⚠️ Branch Strategy (Critical)

**このリポジトリのブランチ戦略**:
- `main`: 本番用（絶対に直接コミットしない）
- `staging`: ステージング環境用
- `dev`: **開発用（あなたの作業用）**

**重要**:
- ✅ 自分の worktree は `dev` から切られています
- ✅ PR は **必ず `dev` を base として作成**
- ❌ `main` へ PR を作成すると本番が壊れます

## Your Mission

1. **Issue #16 を読む**
   - Issue 本文に詳細な実装計画が書かれています
   - 各Phaseを順番に進めてください

2. **実装する**
   - Phase 1: セットアップ（better-sqlite3 インストール）
   - Phase 2: サーバーサイドDB層
   - Phase 3: API Routes
   - Phase 4: クライアント側変更
   - Phase 5: データマイグレーション
   - Phase 6: テストとクリーンアップ

3. **完了時の手続き**
   - ブランチを push: `git push origin issue-16-sqlite-db-`
   - **PR を作成（dev へ）**: `gh pr create --base dev --title "..." --body "..."`
     * 絶対に main へ PR を作成しないこと
     * 必ず base を `dev` に指定
   - Issue に完了を報告: コメントで「実装完了、PR #XXX を作成しました」

   **⚠️ ラベル操作は不要です**
   - GitHub Actions が自動で status/review を付与します
   - PR merged / closed は自動で処理されます

4. **重大な問題が発生した場合（完了できない）**
   - Issue にコメントで問題の詳細を記載してください
   - Interface/ユーザーの対応を待ってください

## Important

- Issue が単一の真実源です
- 質問や問題があれば、Issue コメントで報告してください
- PR 作成時は、Issue の内容を参照した詳細な説明を含めてください

Good luck! 🚀
