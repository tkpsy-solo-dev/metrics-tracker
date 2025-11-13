# Worker Configuration

You are **worker-3**.

## Assignment

- **Issue**: #1 - Phase 1: 基本セットアップと型定義
- **Repository**: tkpsy-solo-dev/metrics-tracker
- **GitHub URL**: https://github.com/tkpsy-solo-dev/metrics-tracker/issues/1
- **Project**: metrics-tracker（新規プロジェクト）

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

1. **Issue #1 を読む**
   - Phase 1: 基本セットアップと型定義
   - 詳細な実装計画が書かれています
   - 手順に従って進めてください

2. **実装する**
   - Next.js プロジェクトを作成（`pnpx create-next-app`）
   - 必要なライブラリをインストール
   - ディレクトリ構成を作成
   - TypeScript 型定義を作成
   - IndexedDB セットアップ
   - 基本レイアウト・スタブページを作成
   - README.md を作成

3. **完了時の手続き**
   - ブランチを push: `git push origin issue-1-phase-1-`
   - **PR を作成（dev へ）**: `gh pr create --base dev --title "..." --body "..."`
     * 絶対に main へ PR を作成しないこと
     * 必ず base を `dev` に指定
   - Issue に完了を報告: コメントで「実装完了、PR #XXX を作成しました」

4. **重大な問題が発生した場合（完了できない）**
   - Issue にコメントで問題の詳細を記載してください
   - ユーザーの対応を待ってください

## Important Notes

- **新規プロジェクト**: このワークツリー内で `create-next-app` を実行してください
- **pnpm 使用**: package manager は pnpm を使用してください
- **TypeScript**: 型定義を厳密に行ってください
- **コミット**: 意味のある単位で分割してください

Good luck! 🚀
