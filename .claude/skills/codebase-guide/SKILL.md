---
name: codebase-guide
description: コードベースの設計哲学と判断基準。ファイルの配置先に迷った時、命名を決める時、コンポーネントを分割すべきか判断する時、リファクタの必要性を見極める時に使う。utils と route co-location の責務分離、命名規約、Server/Client 分離、Storybook 方針、リファクタシグナルを網羅。
---

# Codebase Guide

## 設計哲学

このコードベースの `apps/content` では、`src/shared` と `src/features` を使わない。

基本は次の 2 つだけ。

1. **汎用は `src/utils`**
2. **ドメイン固有は route に最も近い場所へ co-location**

つまり「Next.js に近いものは app、project 固有の UI/型/定数/整形/計算も app/(page)/projects の近くに置く」が基本。

要約すると:
- **Next.js 依存は app に閉じ込める**
- **project 固有のものも `projects` 配下に寄せる**
- **本当に汎用なものだけ utils に置く**
- **story は近くに置く**
- **名前は略さず、責務が分かる語を使う**

---

## ディレクトリ責務と依存方向

| ディレクトリ | 置くもの |
|---|---|
| `app/(page)/projects` | route, page, layout, navigation, searchParams → API query 変換, cookie/sessionStorage 操作 |
| `app/(page)/projects/_fragments` | route に近い薄い Client Component |
| `app/(page)/projects/_components` | project 固有の UI + story co-location |
| `app/(page)/projects/_components/layouts` | page から任意利用する layout 部品 |
| `app/(page)/projects/_utils` | project 固有の定数、整形、計算、validator、route 近傍 helper |
| `app/(page)/projects/_utils/api` | project 固有 schema / DTO |
| `utils/api` | 認証など本当に汎用な schema / DTO |

```text
app/(page) → app/(page)/projects/_components
app/(page) → app/(page)/projects/_utils
app/(page) → utils
utils -X→ app/(page)
```

`shared` や `features` のような中間集約レイヤーは作らない。深い相対 import より `:/` alias を優先する。

### 判断: utils に置くか projects 配下に置くか

- route 依存（`searchParams`, `router.push`, `cookies()`, `sessionStorage`）→ **app**
- project 固有の pure UI、表示定数、formatter、validator → **`app/(page)/projects` 配下**
- 同じ constant/formatter/validator を複数 page が使う → **`projects/_utils` へ移動**
- project 以外からも使う schema / DTO → **`src/utils/api`**
- 同じ searchParams 組み立てが散る → `_utils` に helper を切る

---

## コンポーネント配置

### Server / Client 分離

- `page.tsx` で fetch、`searchParams` → API query 変換、requestUrl 組み立て
- interaction が必要な時だけ `"use client"`
- `router.push`, `sessionStorage`, `document.cookie`, `fetch('/api/...')` は Client Component に閉じ込める
- 1 ファイルで state / URL / markup が膨れたら、route 依存と pure UI に分割

### _fragments

route に近い薄い Client Component だけを置く。大きい fragment はそのまま平置きせず、folder 化して `index.tsx` を入口にし、内部部品を近くに寄せる。`project-search-side-menu` がまさにその例。

Storybook の都合で本番 component の責務を濁さない。

### _components

project 固有の純粋 UI を置く。`*.stories.tsx` を同階層に co-location。Next.js 依存（router, cookies, searchParams）を持ち込まない。

### Storybook

`apps/content/.storybook` に統合済み。別 app を立てて集約するより、apps/content に統合して story は component の近くに co-location する方針。`app/` の page 全体より `projects/_components` と薄い `_fragments` を story 化する。Next.js 依存 component は `.storybook` の mock + `nextNavigation` parameter で対応。

---

## 命名

### ファイル名

すべて kebab-case。

| 種別 | パターン | 例 |
|---|---|---|
| Client Component | `[noun].tsx` | `sort-select.tsx` |
| folder 化 fragment | `[name]/index.tsx` | `project-search-side-menu/index.tsx` |
| story | `*.stories.tsx` | `pagination.stories.tsx` |
| test | `*.test.ts` | `format-date.test.ts` |
| server 専用 | `*.server.ts` | `cookie-helpers.server.ts` |
| 定数 | `[feature]-[domain].ts` | `project-type.ts` |

### コンポーネント・Props

- Props: `XxxProps`
- 表示専用: `XxxView`
- route 依存 wrapper: `ProjectPagination`, `ProjectCompletePage`

### 変数名

命名は全体としてかなり素直。Props、View、handleXxx、buildXxxUrl、isXxx、hasXxx のような prefix / suffix はそのまま使ってよく、この repo と相性がいい。

避けたいのは短すぎる略称。この規模だと読みやすさを落とす。

| 避ける | 使う |
|---|---|
| `qs` | `queryParams` |
| `sp` | `searchParams` |
| `p` | `project` |
| `n` | `parsedId` |
| `v` | `projectClassValue` |

`res`, `raw`, `id` は文脈が明確なら許容。

### prefix の傾向

「ドメインを明示する prefix」は歓迎。`PROJECT_TYPE`, `PROJECT_CLASS`, `PROJECT_SORT_KEY` のような名前はむしろ正しい。逆に、曖昧な prefix や何を束ねているか分からない `common` 的な名前は避ける。`project-*`、`list-url`、`search-params-*` みたいに責務がすぐ分かる粒度にする。

### コメント

- Java/JSP 由来の挙動を再現している箇所には参照元を短く残す
- コメントは WHY を優先、WHAT は書かない
- Nablarch タグ・JSP 対応関係は OK
- 自明な 1 行説明コメントは増やさない

---

## リファクタシグナル

以下に該当したら分割・移動を検討する:

- **Storybook に載せにくい** → 責務分離を検討
- **route 依存と pure UI が混ざる** → 分ける
- **同じ formatter / validator / search param 組み立てが散る** → helper に寄せる
- **sessionStorage や cookie の扱いが複数箇所に分かれる** → 共通化

listUrl、search params、project-search-side-menu はまさにこのシグナルで片付けた実例。
