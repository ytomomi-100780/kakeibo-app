# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

家計簿（Kakeibo）アプリ — 収入・支出の記録と管理を行う家計管理アプリケーション。

## Git 運用ルール

**コードを変更するたびに必ず GitHub にプッシュすること。**

具体的な手順:

```bash
git add <変更ファイル>
git commit -m "変更内容の説明"
git push origin <ブランチ名>
```

- コミットメッセージは変更内容を簡潔に日本語で記述する
- 機能追加・バグ修正・リファクタリングなど変更の種別がわかるようにする
- `main` ブランチへの直接プッシュは避け、feature ブランチを使用する
- プッシュ前に差分を確認し、不要なファイルが含まれていないことを確認する

## ブランチ戦略

- `main` — 本番用の安定ブランチ
- `feature/<機能名>` — 新機能開発用ブランチ
- `fix/<バグ名>` — バグ修正用ブランチ
