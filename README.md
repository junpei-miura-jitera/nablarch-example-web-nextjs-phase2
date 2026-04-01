# nablarch-example-web-nextjs-phase1

Nablarch Example Web（Java/JSP）を Next.js + React に変換するプロジェクト。

Java ソースから API 定義を抽出し、TypeScript 型定義・MSW ハンドラ・OpenAPI YAML を自動生成する。

## 構成

```
apps/
  web/              Next.js 16 (App Router) + Bootstrap + MSW
  storybook/        Storybook 8

libs/
  java-to-ts/       Java → TS 型 + MSW ハンドラ + OpenAPI YAML 生成ツール

_references/
  nablarch-example-web/   元の Java ソース（参照用）
```

## 技術スタック

Phase 1 は「CSS: そのまま / JavaScript: 変換 / Action: そのまま」の構成（[library-list.md](../library-list.md) #2 相当）。

### ベース

| ライブラリ | 用途 |
|-----------|------|
| Next.js 16 (App Router) | フレームワーク、SSR、ルーティング |
| React 19 | UI レンダリング基盤 |
| TypeScript 5.9 | 型安全 |
| pnpm 10 (workspaces) | パッケージ管理 |

### CSS（そのまま）

| ライブラリ | 用途 |
|-----------|------|
| Bootstrap 5 | 元の JSP から CSS をそのまま移植 |

### JavaScript（変換）

| ライブラリ | 用途 |
|-----------|------|
| react-hook-form | 非制御フォーム管理 |
| TanStack Query (@tanstack/react-query) | サーバ状態のキャッシュ・再検証 |
| Zustand | 軽量クライアント状態管理 |
| valibot | スキーマバリデーション |

### Action（そのまま）

| ライブラリ | 用途 |
|-----------|------|
| MSW 2 | API モック（既存 Java API の代替） |

### 開発ツール

| ライブラリ | 用途 |
|-----------|------|
| Vitest 4 | テストランナー |
| ESLint 9 + eslint-config-next | リンター |
| Storybook 8 | コンポーネントドキュメント・UI 検証 |

## セットアップ

```bash
pnpm install
```

## コマンド

| コマンド | 説明 |
|---------|------|
| `pnpm dev` | Next.js 開発サーバー起動 |
| `pnpm build` | Next.js プロダクションビルド |
| `pnpm test` | 全パッケージのテスト実行 |
| `pnpm typecheck` | 全パッケージの TypeScript 型チェック |
| `pnpm lint` | ESLint 実行 |
| `pnpm generate` | Java ソースから型定義・MSW ハンドラ・OpenAPI YAML を生成 |
| `pnpm storybook` | Storybook 起動 |

## java-to-ts ジェネレーター

`_references/nablarch-example-web/` の Java ソースを解析し、以下を生成する。

### 生成物

| ファイル | 説明 |
|---------|------|
| `apps/web/src/types/api.ts` | DTO/Form から変換した TypeScript interface |
| `apps/web/src/types/routes.ts` | Action から抽出した API ルート定義 |
| `apps/web/src/mocks/java/handlers.ts` | MSW ハンドラ（ダミーデータ付き） |
| `apps/web/src/mocks/java/openapi.yaml` | OpenAPI 3.0 定義 |

### CLI オプション

```bash
tsx src/index.ts --input <java-src-dir> --output <app-src-dir> [options]

Options:
  --msw-dir <dir>    MSW ハンドラの出力先 (default: <output>/mocks/java)
  --specs-dir <dir>  OpenAPI YAML の出力先 (default: msw-dir と同じ)
  --no-msw           MSW ハンドラ生成を無効化
  --no-openapi       OpenAPI YAML 生成を無効化
```

### 解析対象

| Java クラス | 解析内容 |
|------------|---------|
| `dto/*.java` | フィールド名・型 → TypeScript interface |
| `form/*.java` | フィールド名・型・`@Required`/`@Domain` → TypeScript interface |
| `action/*.java` | メソッド名・`@InjectForm`・`@OnDoubleSubmission`・レスポンス → ルート定義 |

## ディレクトリ規約

- `:` パスエイリアス（`:/` = `./src/`）
- kebab-case ファイル命名
- `_` プレフィックスディレクトリ（`_services`, `_fragments`, `_layouts`, `_utils`）
- ルートグループ（`(page)`, `(auth)`, `(error)`, `(with-sidemenu)`）
- 表示系 JSX で `?? ""` は使わない（`<input value>` のみ）
- トップレベル export には JSDoc 必須

詳細は `.claude/skills/nablarch-nextjs-conventions.md` を参照。
