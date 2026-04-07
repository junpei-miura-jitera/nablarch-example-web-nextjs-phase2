---
name: conventions
description: 開発コンベンション。apps/content でコードを書く時、ファイル配置に迷った時、フォームフローや API パターンを確認したい時、新しいルートや共通部品を追加する時に使う。utils と route co-location を前提にした技術スタック、ディレクトリマップ、パターンの包括的リファレンス。
---

# Conventions

Nablarch Example Web（Java/JSP）を Next.js + React へ移行するプロジェクトの開発リファレンス。

## 設計哲学

> 「汎用は utils、ドメイン固有は route に近く置く、story/test も隣に置く、名前は略さず責務が分かる語を使う」

この repo の `apps/content` では `src/shared` と `src/features` を使わない。
ファイルは、使う route に最も近い `app/(page)/...` 配下へ co-location する。認証など複数ドメインで本当に共有されるものだけ `src/utils/*` に置く。

## 技術スタック

### アプリ

| ライブラリ | 用途 |
|---|---|
| Next.js 16 | App Router, SSR, routing |
| React 19 | UI |
| TypeScript 5.9 | 型安全 |
| Bootstrap 5 | 既存 JSP の見た目を踏襲 |

### フォーム / 状態管理

| ライブラリ | 用途 |
|---|---|
| react-hook-form | フォーム管理（register ベース、uncontrolled） |
| zod | バリデーション |
| @tanstack/react-query | サーバ状態管理 |
| Zustand | 軽量クライアント状態管理 |

### テスト / 開発

| ライブラリ | 用途 |
|---|---|
| msw 2 + @mswjs/http-middleware | mock server（ポート 9090） |
| Vitest 4 | 単体テスト |
| Playwright | E2E / visual comparison |
| ESLint 9 | lint |
| Storybook | UI 確認（apps/content/.storybook に統合） |

### 使わないもの

- Server Actions（`"use server"`）
- Tailwind CSS / shadcn
- Auth ライブラリ
- ORM / Database（MSW mock のみ）

## ディレクトリマップ

```text
apps/content/src/
├── app/
│   ├── layout.tsx                  # html/body + Providers のみ
│   ├── _fragments/                 # providers.tsx, query-provider.tsx
│   │   └── storybook/              # app 共通の Storybook frame
│   ├── (api)/api/                  # API routes (auth, form-cookie)
│   ├── (page)/
│   │   ├── layout.tsx              # (page) グループ共通 layout
│   │   ├── page.tsx                # ルートリダイレクト
│   │   ├── _styles/                # CSS
│   │   ├── (auth)/login/           # ログイン
│   │   ├── (error)/error/          # エラー
│   │   └── projects/               # メイン業務
│   │       ├── page.tsx            # 一覧（fetch + searchParams → API query）
│   │       ├── layout.tsx          # projects 共通 layout
│   │       ├── _fragments/         # route に近い薄い Client Component
│   │       │   ├── back-button.tsx
│   │       │   ├── complete-page.tsx
│   │       │   ├── confirm-button.tsx
│   │       │   ├── download-button.tsx
│   │       │   ├── pagination.tsx
│   │       │   ├── save-list-url.tsx
│   │       │   ├── sort-select.tsx
│   │       │   └── project-search-side-menu/   # folder 化された fragment
│   │       │       ├── index.tsx
│   │       │       ├── project-class-filter.tsx
│   │       │       ├── project-client-filter.tsx
│   │       │       ├── project-name-filter.tsx
│   │       │       ├── project-period-links.tsx
│   │       │       └── search-hidden-fields.tsx
│   │       │   └── storybook/      # project 専用の Storybook fixture
│   │       │       └── project-fixtures.ts
│   │       ├── _components/
│   │       │   ├── client-search-modal.tsx + .stories.tsx
│   │       │   ├── complete-page.tsx + .stories.tsx
│   │       │   ├── date-picker-input.tsx
│   │       │   ├── pagination.tsx + .stories.tsx
│   │       │   ├── project-form-fields.tsx + .stories.tsx
│   │       │   └── layouts/
│   │       │       ├── layout-header.tsx
│   │       │       ├── layout-side-menu.tsx
│   │       │       ├── layout-footer.tsx
│   │       │       └── logout-button.tsx
│   │       ├── _utils/
│   │       │   ├── api/
│   │       │   │   ├── client.ts
│   │       │   │   ├── project.ts
│   │       │   │   └── project-bulk.ts
│   │       │   ├── list-url.ts
│   │       │   ├── search-params-helpers.ts
│   │       │   ├── cookie-helpers.ts / .server.ts
│   │       │   ├── route-params.ts
│   │       │   ├── project-class.ts
│   │       │   ├── project-sort-key.ts
│   │       │   ├── project-type.ts
│   │       │   ├── sort-order.ts
│   │       │   ├── format-date.ts
│   │       │   ├── project-form-helpers.ts
│   │       │   ├── project-form-values.ts
│   │       │   ├── project-profit.ts
│   │       │   ├── project-types.ts
│   │       │   ├── escape-csv-field.ts
│   │       │   └── parse-csv-line.ts
│   │       ├── [id]/               # 詳細・編集
│   │       │   ├── page.tsx
│   │       │   └── edit/
│   │       │       ├── page.tsx
│   │       │       ├── edit-project-form.tsx
│   │       │       ├── confirm/page.tsx + confirm-update-button.tsx
│   │       │       └── complete/page.tsx
│   │       ├── new/                # 新規登録
│   │       │   ├── page.tsx
│   │       │   ├── create-project-form.tsx
│   │       │   ├── confirm/page.tsx + confirm-create-button.tsx
│   │       │   └── complete/page.tsx
│   │       ├── bulk/               # 一括更新
│   │       │   ├── page.tsx
│   │       │   ├── bulk-edit-form.tsx
│   │       │   ├── confirm/page.tsx + confirm-bulk-button.tsx
│   │       │   └── complete/page.tsx
│   │       ├── upload/             # CSV アップロード
│   │       │   ├── page.tsx
│   │       │   └── upload-form.tsx
│   │       └── delete-complete/page.tsx
│   └── api/[...path]/              # catch-all API proxy
├── utils/
│   └── api/
│       ├── action-result.ts
│       └── authentication.ts
├── mocks/                          # MSW mock server
│   ├── mock-handlers.ts
│   ├── mock-browser.ts / mock-node.ts / mock-http-server.ts
│   └── handlers/                   # API endpoint ごとの handler
│       ├── _services/              # mock ランタイム（state, query, command）
│       ├── project/                # /api/project/*
│       ├── projectbulk/            # /api/projectbulk/*
│       ├── projectupload/          # /api/projectupload/*
│       ├── authentication/         # /api/authentication/*
│       ├── client/                 # /api/client/*
│       └── industry/               # /api/industry/*
├── bases/                          # env.server.ts, env.ts
├── tests/                          # E2E, setup
├── styles/                         # グローバル CSS
├── types/                          # 型宣言
└── utils/                          # 汎用ユーティリティ
```

## パス alias

`:` = `./src/`, `:/*` = `./src/*`

```typescript
// 良い
import { ProjectFormFields } from ":/app/(page)/projects/_components/project-form-fields";
import { formatDate } from ":/app/(page)/projects/_utils/format-date";

// 避ける（深い相対パス）
import { ProjectFormFields } from "../../../../_components/project-form-fields";
```

## API パターン

### Server Component から

```typescript
const res = await fetch(`${API_BASE_URL}/api/project/list?${query}`);
```

`API_BASE_URL` は `bases/env.server.ts` で Zod バリデーション済み。デフォルト `http://localhost:9090`。

### Client Component から

```typescript
const res = await fetch("/api/project/download");
```

ブラウザの `/api/*` は `next.config.ts` の rewrite で mock server（`localhost:9090`）に転送される。

## フォームフロー（PRG + Cookie）

```text
Input → Cookie 保存 → router.push("/confirm")
  → Server Component が Cookie 読み取り → 確認画面表示
  → fetch("/api/.../create") → Cookie クリア → router.push("/complete")
```

- `react-hook-form` の `register()` ベース（uncontrolled）
- 型変換は submit 時に `Number()` 等
- Cookie 操作: Client は `document.cookie`、Server は `next/headers` の `cookies()`
- 「戻る」対応: `useEffect` で Cookie からフォーム値を復元

## mock handler の構造

各 API endpoint は `mocks/handlers/[domain]/[action]/[method].ts` に配置。スキーマ付きの場合は `.schema.ts` を隣接。

```text
handlers/project/list/get.ts        # GET /api/project/list
handlers/project/list/get.schema.ts  # レスポンス型定義
handlers/project/create/post.ts      # POST /api/project/create
```

`_services/` 配下に mock ランタイム（state 管理、query 処理、command 処理）を集約。

## テスト配置

- Unit test: 対象ファイルの隣に `.test.ts`
  - `app/(page)/projects/_utils/format-date.test.ts`
  - `app/(page)/projects/_utils/route-params.test.ts`
- E2E: `tests/e2e/`
- Storybook story: component の隣に `.stories.tsx`
- Storybook 専用 fixture / frame は `_fragments/storybook/` を first choice にして、最も近い route / app 階層へ co-location する

## 環境変数

server-only。`bases/env.server.ts` で Zod バリデーション。

| 変数 | 用途 |
|---|---|
| `API_BASE_URL` | mock server URL（デフォルト: `http://localhost:9090`） |

## 追加ルール

1. `src/shared` を新規作成しない
2. `src/features` を新規作成しない
3. project 固有の schema / DTO / constants / formatter / validator / component は `app/(page)/projects` 配下へ置く
4. 認証など本当に汎用なものだけ `src/utils/api` に置く
5. `layout.tsx` は常に共通な外枠だけに使い、ページごとに揺れるレイアウトは `_components/layouts` を page から明示利用する
6. 元 JSP 由来の inline style 再現は許容する
7. strict pixel compare を通すためだけの微調整は hack 扱いにして、`NOTE:` コメントを必ず残す

## Monorepo 構成

```text
nablarch-example-web-nextjs/
├── apps/content/       # @app/content — Next.js + mock server + Storybook
├── apps-legacy/        # Nablarch 移行元アプリ
├── _references/        # 元の Java ソース（read-only）
└── package.json        # pnpm workspace root
```
