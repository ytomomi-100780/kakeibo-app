# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

レシート読み込み家計簿Webアプリ。レシート画像をアップロードするとClaude AIが自動で内容を読み取り、カテゴリ別に分類・集計する。

## Architecture

フロントエンド（React/Vite）とバックエンド（Node.js/Express）の2層構成。

```
Kakeibo-app/
├── frontend/   # React + Vite（ポート5173）
└── backend/    # Express + Claude API（ポート3001）
```

**データフロー:** フロントがレシート画像 → バックエンド `/api/analyze-receipt` → Claude API（vision）→ JSON → フロントのlocalStorageに保存

**APIキー管理:** `backend/.env` にのみ保持（ブラウザからClaude APIを直接呼ばない）

## Development Commands

**バックエンド起動（先に起動すること）:**
```bash
cd backend
node server.js          # 本番起動
npm run dev             # nodemonで自動リロード
```

**フロントエンド起動:**
```bash
cd frontend
npm run dev             # http://localhost:5173
```

**初回セットアップ:**
```bash
cd backend && npm install
cd ../frontend && npm install
cp backend/.env.example backend/.env
# backend/.env に ANTHROPIC_API_KEY を記入
```

## Claude API

- モデル: `claude-haiku-4-5-20251001`
- 呼び出し箇所: [backend/server.js](backend/server.js) の `/api/analyze-receipt`
- レシート画像をBase64エンコードしてvisionで送信、JSON形式で商品名・金額・カテゴリを返させる

## Key Implementation Details

- **Viteプロキシ:** `frontend/vite.config.js` で `/api/*` をポート3001に転送（CORS対策）
- **localStorageキー:** `kakeibo_expenses`（App.jsxで管理）
- **カテゴリ一覧:** 食費・外食・日用品・衣類・交通費・医療費・娯楽・その他
- **Chart.js登録:** `Charts.jsx` 冒頭で必要なコンポーネントを `ChartJS.register()` で明示登録が必要

## Git 運用ルール

**コードを変更するたびに必ず GitHub にプッシュすること。**

```bash
git add <変更ファイル>
git commit -m "変更内容の説明（日本語可）"
git push origin main
```

- `backend/.env` は `.gitignore` に含まれているのでコミットしない
- `node_modules/` もコミットしない
- コミットメッセージは変更の種別（feat/fix/refactor/chore）がわかるように書く
