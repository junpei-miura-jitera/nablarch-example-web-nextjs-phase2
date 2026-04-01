---
name: nablarch-nextjs-conventions
description: Nablarch Example Web Next.js Phase1 プロジェクトのコーディング規約とアーキテクチャパターン。ファイル作成・編集・リファクタリング・新ページ追加・コンポーネント実装時に必ず参照。
type: reference
trigger: always
---

# Nablarch Example Web Next.js Phase1 コーディング規約

Nablarch（Java）Web アプリを Next.js App Router + React に移植するプロジェクトの規約。
Java ソースを参照元として TypeScript 型・MSW モック・OpenAPI を自動生成し、
Bootstrap CSS で元のUIを再現する。

---

## 1. パスエイリアス

```json
// tsconfig.json
{
  "paths": {
    ":": ["./src"],
    ":/*": ["./src/*"]
  }
}
```

- `:` = `src/` ルート
- 常に `:` エイリアスを使う。相対パスで 2 階層以上遡らない
- `vitest.config.ts` にも同じエイリアスを設定済み

```typescript
// OK
import { API_BASE_URL } from ":/bases/env.server";

// NG
import { API_BASE_URL } from "../../../../bases/env.server";
```

---

## 2. ファイル命名

**全て kebab-case。**

| 種類 | パターン | 例 |
|------|----------|-----|
| Client Fragment | `[noun].tsx` | `sort-select.tsx` |
| ユーティリティ | `[noun].ts` | `project-profit.ts` |
| サーバー専用ユーティリティ | `[noun].server.ts` | `cookie-helpers.server.ts` |
| ユーティリティテスト | `[noun].test.ts` | `project-profit.test.ts` |
| レイアウト | `[noun]-layout.tsx` | `project-sidemenu-layout.tsx` |
| 定数 | `[feature]-constants.ts` | `project-constants.ts` |
| Provider | `[name]-provider.tsx` | `msw-provider.tsx` |

---

## 3. ディレクトリ構成

### `_` プレフィックス（ルート対象外）

| ディレクトリ | 用途 |
|-------------|------|
| `_fragments/` | Client Components（interactive / presentational） |
| `_layouts/` | 再利用可能なレイアウトコンポーネント |
| `_utils/` | ユーティリティ・定数・ヘルパー |
| `_styles/` | 共有 CSS |
| `_providers/` | Provider コンポーネント（`app/` 直下） |

> `_services/` は使用しない。このプロジェクトでは Server Actions を使わず、fetch + MSW で API を呼ぶ。

### ルートグループ（URL に影響しない）

| グループ | 用途 |
|---------|------|
| `(page)` | メイン UI ページ |
| `(auth)` | 認証関連ページ |
| `(error)` | エラーハンドリング |

### 機能ディレクトリ構成例

```
projects/
├── page.tsx              # Server Component（データ取得）
├── layout.tsx            # レイアウト合成
├── [id]/
│   └── page.tsx          # 詳細ページ
├── new/                  # 新規登録フロー
│   ├── page.tsx          # 入力画面
│   ├── confirm/page.tsx  # 確認画面
│   └── complete/page.tsx # 完了画面
├── bulk/                 # 一括操作
├── upload/               # CSV アップロード
├── _fragments/           # Components
│   ├── project-list.tsx          # Server Component
│   ├── sort-select.tsx           # Client Component
│   ├── download-button.tsx       # Client Component
│   └── client-search-modal.tsx
├── _layouts/
│   ├── project-header-layout.tsx
│   └── project-sidemenu-layout.tsx
├── _utils/
│   ├── project-constants.ts
│   ├── project-profit.ts
│   ├── cookie-helpers.ts         # Client 用
│   ├── cookie-helpers.server.ts  # Server 用
│   └── __tests__/
│       └── project-profit.test.ts
└── _styles/
```

---

## 4. import 順序

1. **外部パッケージ** (react, next, ライブラリ)
2. **`:` エイリアス** (内部モジュール)
3. **相対 import** (`./`, `../`)
4. **CSS import**

```typescript
// 1. 外部パッケージ
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

// 2. : エイリアス
import { API_BASE_URL } from ":/bases/env.server";
import type { ProjectDto } from ":/types/api";

// 3. 相対 import
import { ProjectList } from "./_fragments/project-list";

// 4. CSS
import ":/styles/common.css";
import ":/styles/project.css";
```

### CSS 資産インベントリ

`app/(page)/layout.tsx` で読み込む CSS ファイル一覧:

| File | Source | Purpose |
|------|--------|---------|
| `common.css` | Nablarch `/stylesheets/common.css` | 共通スタイル（ヘッダー、フッター、レイアウト） |
| `project.css` | Nablarch `/stylesheets/project.css` | プロジェクト機能のスタイル |

jQuery UI は完全に削除済み。

---

## 5. Server / Client コンポーネント分離

### Server Component（デフォルト）

- `"use client"` なし
- `page.tsx` でデータ取得（`searchParams` → API クエリパラメータ）
- ソート・ページングはサーバーサイドで処理（元の Java 版と同じ）
- `useState`, `useEffect`, イベントハンドラ使用不可

```typescript
// projects/page.tsx — Server Component
import { api } from ":/bases/api-client.server";
import { ProjectList } from "./_fragments/project-list";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const { data, error } = await api.GET("/api/project/list", {
    params: { query: { pageNumber: params.pageNumber ?? "1", sortKey: params.sortKey, sortDir: params.sortDir } },
    cache: "no-store",
  });
  if (error) throw new Error("Failed to fetch projects");
  return <ProjectList projects={data ?? []} sortKey={params.sortKey ?? "projectId"} sortDir={params.sortDir ?? "asc"} searchParams={params} />;
}
```

### Client Component

- `"use client"` 宣言
- `_fragments/` に配置
- **最小限のインタラクション**のみ担当（select 変更 → URL 遷移、ファイルダウンロードなど）

```typescript
// _fragments/sort-select.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function SortSelect({ sortKey, sortDir }: { sortKey: string; sortDir: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  function handleChange(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`/projects?${params.toString()}`);
  }
  // ...
}
```

---

## 6. API 呼び出しパターン

### Server-side fetch（Server Component）

```typescript
const res = await fetch(`${API_BASE_URL}/api/project/list`, {
  cache: "no-store",
});
```

- `API_BASE_URL` はサーバー専用（`bases/env.server.ts`）
- Valibot でバリデーション済み環境変数

### Client-side fetch（Client Component）

```typescript
const res = await fetch("/api/project/download", { method: "POST" });
```

- クライアントからの fetch はパスのみ（MSW がインターセプト）
- `API_BASE_URL` は不要

### Server Actions は使わない

- このプロジェクトでは `"use server"` を使用しない
- 既存 Java API のエンドポイントを fetch で直接叩く
- MSW がリクエストをインターセプトしてモックレスポンスを返す

---

## 7. フォームフロー（PRG パターン + Cookie）

Nablarch の session scope を Cookie で代替する。

```
入力画面 → Cookie保存 → 確認画面（Server で読込）→ fetch 実行 → 完了画面
```

### Cookie ヘルパー: Client / Server 分離

**Client 用** (`cookie-helpers.ts`) — `document.cookie` を直接操作:

```typescript
export function saveProjectFormToCookie(data: Record<string, unknown>) {
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(data))}; max-age=600; path=/`;
}
```

**Server 用** (`cookie-helpers.server.ts`) — `next/headers` の `cookies()` を使用:

```typescript
import { cookies } from "next/headers";

export async function loadProjectFormFromCookieServer() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  // ...
}
```

### フロー詳細

1. **入力画面**: `react-hook-form` → `saveProjectFormToCookie()` → `router.push("/confirm")`
2. **確認画面**: Server Component で `loadProjectFormFromCookieServer()` → 読み取り専用表示
3. **確認ボタン**: Client Fragment で `fetch()` 実行 → `clearProjectFormCookie()` → `router.push("/complete")`
4. **完了画面**: 完了メッセージ表示

---

## 8. フォームパターン（react-hook-form）

```typescript
"use client";

import { useForm } from "react-hook-form";

type ProjectFormValues = { projectName: string; projectType: string; /* ... */ };

export function CreateProjectForm() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProjectFormValues>();

  // Cookie から復元（「戻る」操作対応）
  useEffect(() => {
    const data = loadProjectFormFromCookie();
    if (data) {
      for (const key of Object.keys(data)) {
        if (data[key] != null) setValue(key as keyof ProjectFormValues, String(data[key]));
      }
    }
  }, [setValue]);

  function onSubmit(data: ProjectFormValues) {
    saveProjectFormToCookie({ ...data, clientId: Number(data.clientId) || 0 });
    router.push("/projects/new/confirm");
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(onSubmit)(); }}>
      <input className="form-control" {...register("projectName", { required: "必須です" })} />
      {errors.projectName && <span className="message-error">{errors.projectName.message}</span>}
    </form>
  );
}
```

- `register()` ベース（uncontrolled）
- Submit 時に型変換（`Number()` 等）
- エラーは `formState.errors` から表示

---

## 9. レイアウトパターン

レイアウトは `_layouts/` に配置し、`layout.tsx` で合成する。

```typescript
// projects/layout.tsx — レイアウト合成
import { ProjectHeaderLayout } from "./_layouts/project-header-layout";
import { ProjectSidemenuLayout } from "./_layouts/project-sidemenu-layout";

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProjectHeaderLayout>
      <ProjectSidemenuLayout>{children}</ProjectSidemenuLayout>
    </ProjectHeaderLayout>
  );
}
```

- `ProjectHeaderLayout` — ナビゲーションバー
- `ProjectSidemenuLayout` — サイドメニュー（検索フォーム）+ メインコンテンツ（Bootstrap grid）
- サイドメニューは `"use client"` で状態管理

---

## 10. Provider 構成

`app/_providers/` にグローバル Provider を配置。Root layout でラップ。

```
_providers/
├── providers.tsx       # 合成コンポーネント（"use client"）
├── msw-provider.tsx    # MSW 初期化（ブラウザのみ）
└── query-provider.tsx  # TanStack Query クライアント
```

**ラップ順序**: MSWProvider → QueryProvider（MSW が先に起動していないと fetch が通らない）

```typescript
// providers.tsx
"use client";
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <MSWProvider>
      <QueryProvider>{children}</QueryProvider>
    </MSWProvider>
  );
}
```

---

## 11. テストパターン

### Vitest 設定

- `vitest.config.ts` で `:` エイリアスと `setupFiles` を設定
- `src/tests/setup/index.ts` で `next/headers`, `next/cache` をグローバルモック

### テスト配置

ユーティリティのテストは `_utils/__tests__/` に配置:

```
_utils/
├── project-profit.ts
├── cookie-helpers.ts
└── __tests__/
    └── project-profit.test.ts
```

### テストスタイル

```typescript
import { describe, it, expect } from "vitest";
import { calculateProjectProfit, formatMoney } from "../project-profit";

describe("calculateProjectProfit", () => {
  it("sales が null なら全て null を返す", () => {
    const result = calculateProjectProfit({ sales: null, costOfGoodsSold: 100, sga: 50, allocationOfCorpExpenses: 30 });
    expect(result.grossProfit).toBeNull();
  });

  it("全値が揃えば利益を計算する", () => {
    const result = calculateProjectProfit({ sales: 1000, costOfGoodsSold: 600, sga: 100, allocationOfCorpExpenses: 50 });
    expect(result.grossProfit).toBe(400);
  });
});
```

---

## 12. null 安全と表示ルール

### 表示系 JSX では `?? ""` を使わない

React は `null` / `undefined` を空として描画する。

```typescript
// OK — React が自動で空文字描画
<td>{project.projectLeader}</td>

// NG — 不要
<td>{project.projectLeader ?? ""}</td>
```

### `<input value>` には `?? ""` が必要

```typescript
// OK — controlled input には必要
<input value={project.projectName ?? ""} onChange={...} />
```

### フォールバック表示は OK

```typescript
// OK — マッピング失敗時に元の値に戻す
<td>{PROJECT_TYPES[row.projectType] ?? row.projectType}</td>
```

---

## 13. コメント（JSDoc / `//`）

### ブロックコメント（`/** */`）

| ルール | 内容 |
|--------|------|
| 形式 | **常に複数行**（`/**` 単独行、`* ` 本文、`*/` 単独行）。**1 行にまとめた `/** ... */` は書かない**。 |
| 文末 | 日本語の説明は**句読点で終える**（例: `。`）。 |

### 行コメント（`//`）

- **句読点はなるべく付けない**（短いメモ・ラベル向け）。

### JSDoc の付け方

- トップレベルの export（関数・型・定数）には必ず JSDoc を書く
- 説明は**簡潔に**（1 段落程度）
- 内部の private 関数は任意

```typescript
/**
 * Java の型名を TypeScript の型名にマッピングする。
 */
export function mapJavaTypeToTs(javaType: string): string {

/**
 * Java フィールドの解析結果。
 */
export type JavaField = {
```

### 生成ファイルにはセクション13のルールを適用しない

次のような**自動生成・ツール出力**には、複数行 JSDoc・句読点ルールを**課さない**。手でコメント整形や JSDoc を足さない（再生成で失われるため）。

| 種類 | 例 | 備考 |
|------|-----|------|
| OpenAPI 型定義 | `apps/web/src/libs/java/server/api/index.d.ts` | `openapi-typescript`（単行 `/** @description */` 等はそのまま） |
| MSW モック | `apps/web/src/mocks/handlers.ts` | `msw-auto-mock` |
| Enum 定数 | `apps/web/src/libs/java/server/enums/*.ts`（`@generated` 付き） | `generate:enum`（体裁は `enums/generate.ts` のテンプレート側で管理） |

---

## 14. 自動生成パイプライン（apps/web）

| コマンド | 出力の例 |
|----------|-----------|
| `pnpm generate:types` | `libs/java/server/api/index.d.ts` |
| `pnpm generate:mocks` | `mocks/handlers.ts` |
| `pnpm generate:enum` | `libs/java/server/enums/*.ts` |

### 注意事項

- 上記の生成物は**手編集しない**（再生成で上書きされる）。仕様変更は OpenAPI や生成スクリプト側で行う。
- 生成型のフィールドは仕様により optional（`?`）になることがある。

---

## 15. モノレポ構成

### pnpm workspace

```
nablarch-example-web-nextjs-phase1/
├── apps/
│   └── web/           # @app/web — Next.js アプリ
├── libs/
│   └── java-to-ts/    # @lib/java-to-ts — Java→TS 変換ツール
├── _references/
│   └── nablarch-example-web/  # 元の Java ソース（参照専用）
├── package.json       # ルート（pnpm workspace）
└── pnpm-lock.yaml
```

### 技術スタック

| ライブラリ | バージョン | 用途 |
|-----------|-----------|------|
| Next.js | 16 | フレームワーク（App Router） |
| React | 19 | UI |
| TypeScript | 5.9 | 型安全 |
| Bootstrap | 5.3 | スタイリング（JSP から移植） |
| react-hook-form | 7 | フォーム管理 |
| @tanstack/react-query | 5 | サーバー状態キャッシュ |
| Zustand | 5 | クライアント状態（最小限） |
| Valibot | 1.3 | スキーマバリデーション |
| MSW | 2 | API モック |
| Vitest | 4 | テスト |

### このプロジェクトで使わないもの

- **Server Actions** (`"use server"`) — fetch + MSW を使用
- **Tailwind CSS / shadcn** — Bootstrap を使用
- **認証ライブラリ** (better-auth 等) — 不要
- **ORM** (Drizzle, Prisma 等) — 不要
- **データベース** — MSW モックのみ

### 環境変数

サーバー専用環境変数は `bases/env.server.ts` で Valibot バリデーション:

```typescript
import { optional, parse, string } from "valibot";

export const API_BASE_URL = parse(
  optional(string(), "http://localhost:3000"),
  process.env.API_BASE_URL,
);
```
