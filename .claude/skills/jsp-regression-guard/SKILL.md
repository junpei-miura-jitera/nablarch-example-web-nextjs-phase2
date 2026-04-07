---
name: jsp-regression-guard
description: >
  nablarch-example-web-nextjs-phase2 向けの JSP 忠実度回帰ガード。
  追加レビューで見つかった見落としパターンを、テスト観点と実装チェックリストとして固定化する。
  「回帰ガード」「review guard」「JSP regression」「再発防止」「忠実度テスト追加」などで使う。
---

# JSP Regression Guard

Nablarch JSP -> Next.js 変換で、見落としやすい差分を先回りして検出するためのプロジェクト固有スキル。

## 目的

以下のような「画像だけでは気づきにくい差分」を、レビューとテストで確実に拾う。

1. ボタン wrapper や `id` の欠落
2. 完了画面の遷移先違い
3. Domain validation の未移植
4. jQuery widget の見た目だけ移植して挙動がないケース
5. 0件時ページネーションのような状態依存 UI 差分
6. mock の並び順やバリデーションが JSP/Java と一致していないケース

## 必ず確認する元ソース

レビュー時は Next.js 側だけを見ない。必ず次を参照する。

1. `src/main/webapp/WEB-INF/view/**/*.jsp`
2. `src/main/webapp/javascripts/*.js`
3. `src/main/java/**/form/*.java`
4. `src/main/java/**/action/*.java`
5. `src/main/resources/**/*.sql`
6. `src/main/resources/messages.properties`

## 重点チェック

### 1. レイアウト差分

`layout.tsx` だけでなく、ボタン wrapper まで一致を確認する。

必須観点:

1. `.button-block.real-button-block`
2. `.button-block.link-button-block`
3. `topBackLink`, `bottomBackLink`, `topReturnList`, `bottomReturnList`
4. 画面ごとの sidemenu 有無
5. フッターや header 内リンクの位置

### 2. 完了画面の次へ遷移

画面ごとに遷移先を固定で確認する。

1. `project/completeOfCreate.jsp` -> 新規登録画面
2. `project/completeOfUpdate.jsp` -> 一覧復帰
3. `project/completeOfDelete.jsp` -> 一覧復帰
4. `projectBulk/completeOfUpdate.jsp` -> 一覧復帰

`getSavedListUrl('/projects')` のような共通化が、create 完了にも誤適用されていないか確認する。

### 3. Domain validation の移植

`ExampleDomainType.java` を正本として使う。

最低限見るドメイン:

1. `projectName`
2. `clientName`
3. `userName`
4. `id`
5. `industryCode`
6. `amountOfMoney`
7. `date`

確認内容:

1. Required 時の文言が `入力してください。` になっているか
2. 半角/全角制約があるか
3. 長さ上限があるか
4. 不正入力時に次画面へ遷移しないか
5. mock / API / client-side validation の全層で挙動が一致しているか

### 4. jQuery widget の挙動

CSS class を付けただけでは移植完了ではない。

対象:

1. `.datepicker`
2. client modal open/close
3. side menu checkbox auto-submit
4. sort select submit

特に `.datepicker` は「input が text か」だけでなく、popup が出るかまで確認する。

### 5. client modal の DOM 忠実度

以下は細かいが差分になりやすい。

1. 上部 close button の有無
2. `#message-area` の DOM 常設
3. 初期 option が空文字か、`すべて` 文言が入っていないか
4. 顧客IDセルが `a + hidden span.id + hidden span.name` か
5. `#search-result` の `id`

### 6. 一覧 0件時の表示

検索結果 0件時は以下を確認する。

1. `search-result-count` は `0`
2. ページネーションは非表示
3. ソートや検索条件変更で一覧が復帰する
4. 期間リンク後の side menu submit で date 条件を誤って保持していない

### 7. 一覧ソートの tie-break

SQL の `$sort(sortId)` を正本にする。

例:

1. `nameAsc` -> `PROJECT_NAME, PROJECT_ID`
2. `nameDesc` -> `PROJECT_NAME DESC, PROJECT_ID DESC`
3. `endDateDesc` -> `PROJECT_END_DATE DESC, PROJECT_ID DESC`

mock でも二次ソートまで実装し、同値時の順序を固定する。

### 8. 余計な文言・要素の追加

JSP にないものを React に足していないか確認する。

1. `ダウンロード` テキスト
2. `すべて` option
3. close button
4. 余計な badge/button テキスト

## テスト化の優先順位

レビューで差分を見つけたら、実装修正より先に次を追加する。

1. `java-display-parity.test.ts`
2. `visual-snapshot.test.ts`
3. `visual-comparison.test.ts`

使い分け:

1. 文言・DOM・遷移・状態差分 -> `java-display-parity`
2. 見た目差分 -> `visual-snapshot`
3. Java 実機との画像+DOM比較 -> `visual-comparison`

## 実務ルール

1. mock がランダム値を返していないことを確認する
2. Java の SQL / Form / messages を見ずにフロント制約を決めない
3. `layout.tsx` の責務と任意レイアウト部品を混ぜない
4. 差分を見つけたら、同系列の画面にも同じ観点で横展開する
5. ファイル配置は `.claude/rules/structure.md` に従い、`src/shared` と `src/features` を再導入しない

## 追加レビューで実際に効いた観点

1. create 完了の `次へ` 遷移先
2. create の `button-block` wrapper
3. create/list の全角 validation
4. list 0件時 pagination 非表示
5. list side menu の hidden param 名
6. client modal の close button / blank option / 顧客IDセル DOM
7. list の sort tie-break
8. download の余計な文言
9. logout の element type / 位置
10. `.datepicker` popup の有無
11. native select / file input / material-icons の strict pixel residual は NOTE コメントで管理する
12. 元 JSP の inline style 再現は許容し、pixel residual を減らすためだけの数 px 調整とは区別する
