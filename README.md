# nablarch-example-web-nextjs

Nablarch Example Web（Java/JSP）を Next.js + React へ移行するプロジェクト。

`apps/content` は Next.js アプリ本体で、開発時は同一 workspace 内の mock server も同時に起動する。Next.js 側で業務 API を持たず、ブラウザの `/api/*` リクエストは mock server に転送して扱う。

## 構成

```text
apps/
  content/               Next.js 16 + React 19 + mock server + Storybook

apps-legacy/
  nablarch-example-web/  Nablarch 移行元アプリ（比較起動用）

_references/
  nablarch-example-web/  元の Java ソース（read-only）
```

`apps/content/src/features/*/components` に Storybook 対象の表示コンポーネントを置き、`*.stories.tsx` を同階層に co-location する。`app/` 配下は route / data fetch / navigation に寄せ、UI の見た目確認は `apps/content/.storybook` から扱う。

## 技術スタック

### アプリ

| ライブラリ     | 用途                     |
| -------------- | ------------------------ |
| Next.js 16     | App Router, SSR, routing |
| React 19       | UI                       |
| TypeScript 5.9 | 型安全                   |
| Bootstrap 5    | 既存 JSP の見た目を踏襲  |

### フォーム / 状態管理

| ライブラリ            | 用途                     |
| --------------------- | ------------------------ |
| react-hook-form       | フォーム管理             |
| zod                   | バリデーション           |
| @tanstack/react-query | サーバ状態管理           |
| Zustand               | 軽量クライアント状態管理 |

### テスト / 開発

| ライブラリ                     | 用途                    |
| ------------------------------ | ----------------------- |
| msw 2 + @mswjs/http-middleware | mock server             |
| Vitest 4                       | 単体テスト              |
| Playwright                     | E2E / visual comparison |
| ESLint 9                       | lint                    |
| Storybook                      | UI 確認                 |

## セットアップ

```bash
pnpm install
```

## コマンド

| コマンド               | 説明                                        |
| ---------------------- | ------------------------------------------- |
| `pnpm dev`             | `apps/content` と legacy を同時起動         |
| `pnpm dev:content`     | `apps/content` を起動                       |
| `pnpm dev:storybook`   | Storybook を起動                            |
| `pnpm dev:legacy`      | Nablarch 移行元アプリを起動                 |
| `pnpm legacy:setup`    | 移行元アプリの DB 初期化とコード生成        |
| `pnpm legacy:compile`  | 移行元アプリをコンパイル                    |
| `pnpm build`           | Next.js ビルド                              |
| `pnpm test`            | ワークスペース全体のテスト                  |
| `pnpm typecheck`       | ワークスペース全体の型チェック              |
| `pnpm lint`            | lint                                        |
| `pnpm storybook`       | Storybook 起動                              |
| `pnpm storybook:build` | Storybook を静的ビルド                      |
| `pnpm e2e`             | E2E テスト                                  |
| `pnpm e2e:comparison`  | Java 版と Next.js 版の visual comparison    |
| `pnpm e2e:update`      | E2E スナップショット更新                    |
| `pnpm format`          | Prettier でフォーマット                     |
| `pnpm format:check`    | フォーマットチェック                        |

### `apps/content` の補足

- `pnpm dev:content` は Next.js と mock server を同時起動する
- mock server のデフォルトポートは `9090`
- Next.js 開発サーバーはデフォルトで `3000`
- ブラウザの `/api/*` は `next.config.ts` の rewrite で `http://localhost:9090/api/*` に転送される
- Server Component 側は `API_BASE_URL` 環境変数、未指定時は `http://localhost:9090` を使う

## テスト

```bash
pnpm test
pnpm typecheck
pnpm e2e
pnpm e2e:update
```

Java 版と Next.js 版の比較は、Java 側を `8080`、Next.js 側を `3000` で起動した状態で `pnpm e2e:comparison` を使う。

`apps/content` では、業務ロジックの `.ts` に対して sibling の `.test.ts` を原則 colocate する。現在は `src/app/(page)/projects/_utils`、`src/utils/api`、`src/utils/zod.ts`、`src/bases` を `pnpm --filter @app/content test:presence` で検査している。

## 方針

- Next.js 側に業務 API / 認証 API を持たない
- 認証状態は mock server の `/api/authentication/*` を基準に扱う
- フロントの見た目は Java/JSP を基準に合わせる
- `apps-legacy` は参照用ではなく、比較起動できる移行元アプリとして置く
