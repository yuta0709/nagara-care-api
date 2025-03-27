# ながらかいごバックエンドAPI

## 開発環境のセットアップ

1. リポジトリのclone

```bash
git clone https://github.com/yuta0709/nagara-care-api.git
```

2. 依存関係のインストール

```bash
npm install
```

3. Pineconeのアカウントを作ってプロジェクトを作っておく。`text-embedding-3-large`を使う。
4. 環境変数の設定
   PineconeのAPIキーなどを適切に設定する。

```bash

cp .env.example .env
cp postgres/.env.example postgres/.env
```

5. DBの起動

```bash
docker compose up -d
```

6. マイグレーション

```bash
npx prisma migrate dev
```

7. APIサーバの起動

```bash
npm run start
```
