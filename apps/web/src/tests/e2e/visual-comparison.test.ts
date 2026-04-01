import { test } from "@playwright/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Java (Nablarch) vs Next.js 移行前後の視覚比較テスト。
 *
 * 両アプリのスクリーンショットを撮影し、HTMLレポートで並べて比較する。
 *
 * 前提:
 *   - Java版:   http://localhost:8080 で起動済み
 *   - Next.js版: http://localhost:3000 で起動済み（pnpm dev）
 *
 * 実行:
 *   pnpm exec playwright test visual-comparison
 *
 * Java版のポートを変更する場合:
 *   JAVA_BASE_URL=http://localhost:7080 pnpm exec playwright test visual-comparison
 */

const JAVA_BASE = process.env.JAVA_BASE_URL ?? "http://localhost:8080";
const NEXT_BASE = process.env.NEXT_BASE_URL ?? "http://localhost:3000";
const OUTPUT_DIR = join(import.meta.dirname, "__comparison__");

const JAVA_LOGIN = { id: "10000001", password: "pass123-" };

/**
 * 移行前後のページマッピング。
 */
const PAGE_MAP = [
  {
    name: "login",
    java: "/action/login",
    next: "/login",
    skipAuth: true,
  },
  {
    name: "project-list",
    java: "/action/project/index",
    next: "/projects",
  },
  {
    name: "project-new",
    java: "/action/project",
    next: "/projects/new",
  },
  {
    name: "project-detail",
    java: "/action/project/show/1",
    next: "/projects/1",
  },
  {
    name: "project-edit",
    java: "/action/project/edit/1",
    next: "/projects/1/edit",
  },
  {
    name: "project-upload",
    java: "/action/projectUpload/index",
    next: "/projects/upload",
  },
] as const;

type Screenshot = {
  name: string;
  javaPath: string;
  nextPath: string;
};

const screenshots: Screenshot[] = [];

/**
 * Java ページの読み込み待ち（CDN が CORS ブロックされるため networkidle は使えない）。
 */
async function waitForJavaPage(page: import("@playwright/test").Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(1000);
}

/**
 * Java アプリにログインし、セッション付きの Page を返す。
 */
async function loginToJava(page: import("@playwright/test").Page) {
  await page.goto(`${JAVA_BASE}/action/login`);
  await waitForJavaPage(page);
  await page.fill('input[name="loginId"]', JAVA_LOGIN.id);
  await page.fill('input[name="userPassword"]', JAVA_LOGIN.password);
  await page.getByRole("button", { name: "ログイン" }).click();
  await page.waitForURL("**/action/project/**", { timeout: 10000 });
  await waitForJavaPage(page);
}

test.describe.configure({ mode: "serial" });

test.describe("Java vs Next.js 視覚比較", () => {
  test.setTimeout(60_000);

  test.beforeAll(() => {
    mkdirSync(join(OUTPUT_DIR, "java"), { recursive: true });
    mkdirSync(join(OUTPUT_DIR, "next"), { recursive: true });
  });

  for (const entry of PAGE_MAP) {
    test(`${entry.name}`, async ({ browser }) => {
      const javaCtx = await browser.newContext({
        viewport: { width: 1280, height: 900 },
      });
      const nextCtx = await browser.newContext({
        viewport: { width: 1280, height: 900 },
      });

      const javaPage = await javaCtx.newPage();
      const nextPage = await nextCtx.newPage();

      try {
        // --- Java 側 ---
        if (!("skipAuth" in entry && entry.skipAuth)) {
          await loginToJava(javaPage);
        }
        await javaPage.goto(`${JAVA_BASE}${entry.java}`);
        await waitForJavaPage(javaPage);

        const javaFile = `java/${entry.name}.png`;
        await javaPage.screenshot({
          path: join(OUTPUT_DIR, javaFile),
          fullPage: true,
        });

        // --- Next.js 側 ---
        await nextPage.goto(`${NEXT_BASE}${entry.next}`);
        await nextPage.waitForLoadState("networkidle");
        await nextPage.waitForTimeout(500);

        const nextFile = `next/${entry.name}.png`;
        await nextPage.screenshot({
          path: join(OUTPUT_DIR, nextFile),
          fullPage: true,
        });

        screenshots.push({
          name: entry.name,
          javaPath: javaFile,
          nextPath: nextFile,
        });
      } finally {
        await javaCtx.close();
        await nextCtx.close();
      }
    });
  }

  test.afterAll(() => {
    generateReport(screenshots);
  });
});

/**
 * 比較結果のスクリーンショット一覧から HTML レポートを書き出す。
 */
function generateReport(items: Screenshot[]) {
  const rows = items
    .map(
      (s) => `
    <div class="comparison">
      <h2>${s.name}</h2>
      <div class="images">
        <div class="side">
          <h3>Java (Nablarch)</h3>
          <img src="${s.javaPath}" alt="${s.name} - Java" />
        </div>
        <div class="side">
          <h3>Next.js</h3>
          <img src="${s.nextPath}" alt="${s.name} - Next.js" />
        </div>
      </div>
    </div>`
    )
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <title>移行前後 視覚比較レポート</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: #f5f5f5; padding: 24px; }
    h1 { text-align: center; margin-bottom: 32px; color: #333; }
    .comparison { background: #fff; border-radius: 8px; padding: 24px; margin-bottom: 32px; box-shadow: 0 1px 4px rgba(0,0,0,.1); }
    .comparison h2 { margin-bottom: 16px; color: #555; border-bottom: 1px solid #eee; padding-bottom: 8px; }
    .images { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .side h3 { text-align: center; margin-bottom: 8px; color: #777; }
    .side img { width: 100%; border: 1px solid #ddd; border-radius: 4px; }
    .meta { text-align: center; color: #999; font-size: 12px; margin-top: 16px; }
  </style>
</head>
<body>
  <h1>Nablarch → Next.js 移行 視覚比較レポート</h1>
  ${rows}
  <p class="meta">生成日時: ${new Date().toLocaleString("ja-JP")}</p>
</body>
</html>`;

  writeFileSync(join(OUTPUT_DIR, "report.html"), html, "utf-8");
  console.log(`\n📊 比較レポート: ${join(OUTPUT_DIR, "report.html")}\n`);
}
