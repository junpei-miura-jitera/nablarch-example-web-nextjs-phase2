# apps/content Structure Rule

`apps/content/src` では、次の配置ルールを必須とする。

## 1. 禁止

以下のディレクトリは新規作成・再導入しない。

1. `src/shared`
2. `src/features`

特に `src/shared/api` や `src/features/projects` のような中間集約レイヤーは禁止。

## 2. 基本方針

1. 汎用で複数ドメインから使うものは `src/utils/*`
2. 特定ルートや特定ドメインに強く結びつくものは、最も近い `app/(page)/...` 配下へ co-location
3. `layout.tsx` は「その配下で常に共通な外枠」だけに使う
4. 画面ごとに付いたり消えたりするレイアウト要素は `_components/layouts` で page 側から明示利用する

## 3. apps/content での正解配置

### 汎用

`src/utils/api`

置いてよいもの:

1. 認証系 schema / DTO
2. 複数ルート・複数ドメインで共有する API 型
3. 特定の route group に閉じない汎用 schema

### project ドメイン専用

`src/app/(page)/projects/_utils`
`src/app/(page)/projects/_utils/api`
`src/app/(page)/projects/_components`
`src/app/(page)/projects/_fragments`

置くもの:

1. project 専用 constants
2. formatter / validator / 計算ロジック
3. project 専用 schema / DTO
4. project 専用 UI component
5. project page 群で共有する route-near helper

## 4. 判断ルール

### `utils` に置く

1. project 以外でも使う
2. route segment に閉じない
3. 汎用概念として説明できる

### `projects` 配下に置く

1. project の業務知識を含む
2. project 画面でしか使わない
3. project JSP/Java の移行ロジックを含む
4. project 専用の validator / DTO / formatter / modal / pagination である

## 5. Story / Test

1. story は component の隣
2. test は対象ファイルの隣
3. `projects` 専用の story/test も `projects` 配下に置く

## 6. import の原則

1. `app/(page)/projects` のコードは `:/app/(page)/projects/...` または近い相対 import を使う
2. project 専用コードから `src/utils/api` を参照するのは、汎用 auth など本当に共通なものだけ
3. 新たに `:/shared/...` や `:/features/...` を作らない

## 7. 今回の合意

このプロジェクトでは、昔の

1. `shared = 共通 DTO`
2. `features = 業務機能`

という分け方は採用しない。

代わりに、

1. 汎用は `utils`
2. ドメイン固有は route に近い場所へ co-location

を正式ルールとする。

## 8. inline style の扱い

1. 元 JSP に inline style がある場合は、その再現として inline style を使ってよい
2. popup / overlay / absolute positioning など、実装上必要な style も許容
3. ただし Java 実画面との strict pixel compare を通すためだけの数 px 調整は hack とみなす
4. hack を入れる場合は、対象コードに `NOTE:` コメントで理由を残す
