import { test, expect } from "@playwright/test";

/**
 * 移行前（Nablarch JSP）と移行後（Next.js）の UI 比較用スナップショットテスト。
 *
 * 使い方:
 *   1. ベースライン作成:  pnpm e2e --update-snapshots
 *   2. 比較テスト実行:    pnpm e2e
 *   3. 外部サーバー比較:  BASE_URL=http://localhost:7080 pnpm e2e --update-snapshots
 *                         BASE_URL=http://localhost:3000 pnpm e2e
 */

/**
 * MSW のモックデータは faker.seed(1) で固定だが、リクエストの到着順序により
 * テーブル行のテキストが毎回微妙に変わるため、動的データを含むページは
 * しきい値を緩める。静的なページ（ログイン・エラー系）は厳密に比較する。
 */
const pages = [
  { name: "login", path: "/login" },
  { name: "project-list", path: "/projects", dynamic: true },
  { name: "project-new", path: "/projects/new", dynamic: true },
  { name: "project-detail", path: "/projects/1", dynamic: true },
  { name: "project-edit", path: "/projects/1/edit", dynamic: true },
  { name: "project-bulk", path: "/projects/bulk", dynamic: true },
  { name: "project-upload", path: "/projects/upload", dynamic: true },
  // Error pages
  { name: "error-system", path: "/error" },
  { name: "error-double-submission", path: "/error?type=doubleSubmission" },
  { name: "error-optimistic-lock", path: "/error?type=optimisticLock" },
  { name: "error-not-found", path: "/error?type=notFound" },
  { name: "error-permission", path: "/error?type=permission" },
  { name: "error-too-large", path: "/error?type=tooLarge" },
  { name: "error-unavailable", path: "/error?type=unavailable" },
  { name: "error-tampering", path: "/error?type=tampering" },
  { name: "error-user", path: "/error?type=user" },
] as const;

for (const entry of pages) {
  test(`${entry.name} (${entry.path})`, async ({ page }) => {
    await page.goto(entry.path);
    await page.waitForLoadState("networkidle");

    if ("dynamic" in entry) {
      // 動的データページ: MSW のモックデータでテーブル行数が毎回変わるため
      // fullPage スナップショット比較はサイズ不一致で不安定になる。
      // viewport 固定サイズのスクショで構造（ヘッダー・サイドメニュー・フォーム枠）を比較する。
      await expect(page).toHaveScreenshot(`${entry.name}.png`, {
        fullPage: false,
        maxDiffPixelRatio: 0.25,
      });
    } else {
      // 静的ページ: ピクセル単位で厳密に比較する。
      await expect(page).toHaveScreenshot(`${entry.name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
      });
    }
  });
}
