import { expect, test } from '@playwright/test'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'

/**
 * Java (Nablarch) vs Next.js 移行前後の視覚比較テスト。
 *
 * 両アプリのスクリーンショットを撮影し、HTMLレポートで並べて比較する。
 *
 * 前提:
 *
 * - Java版: http://localhost:8080 で起動済み
 * - Next.js版: http://localhost:3000 で起動済み（pnpm dev）
 *
 * 実行: pnpm exec playwright test visual-comparison
 *
 * Java版のポートを変更する場合: JAVA_BASE_URL=http://localhost:7080 pnpm exec playwright test visual-comparison
 *
 * NOTE:
 * `PERFECT_PIXEL_COMPARE=1` は 1px でも差があれば fail する。現状は native select / file input /
 * material-icons badge / server-rendered whitespace の差で residual diff が残るため、通常運用はレポート生成モード
 * (`pnpm e2e:comparison`) を使う。
 * JSP 由来の inline style 再現は許容するが、Java 実測値に寄せるだけの数 px 調整は hack とみなし、対象コードへ NOTE を残す。
 */

const JAVA_BASE = process.env.JAVA_BASE_URL ?? 'http://localhost:8080'
const NEXT_BASE = process.env.NEXT_BASE_URL ?? 'http://localhost:3000'
const OUTPUT_DIR = join(import.meta.dirname, '__comparison__')
const PERFECT_PIXEL_COMPARE = process.env.PERFECT_PIXEL_COMPARE === '1'

const JAVA_LOGIN = { id: '10000001', password: 'pass123-' }

type DomCheck =
  | { kind: 'count'; selector: string }
  | { kind: 'text'; selector: string }

type PageMapEntry = {
  name: string
  java: string
  next: string
  skipAuth?: boolean
  pageNumber?: string
  domChecks?: DomCheck[]
}

/**
 * 移行前後のページマッピング。
 */
const PAGE_MAP: PageMapEntry[] = [
  {
    name: 'login',
    java: '/action/login',
    next: '/login',
    skipAuth: true,
    domChecks: [
      { kind: 'text', selector: '.title-nav span' },
      { kind: 'count', selector: 'input[name="loginId"]' },
      { kind: 'count', selector: 'input[name="userPassword"]' },
      { kind: 'text', selector: '.headerRightPane .headerElement' },
    ],
  },
  {
    name: 'project-list',
    java: '/action/project/index',
    next: '/projects',
    domChecks: [
      { kind: 'count', selector: 'nav.menu' },
      { kind: 'count', selector: '#search' },
      { kind: 'count', selector: '#startThisYear' },
      { kind: 'count', selector: '.headerRightPane a' },
    ],
  },
  {
    name: 'project-list-page-7',
    java: '/action/project/index',
    next: '/projects',
    pageNumber: '7',
  },
  {
    name: 'project-new',
    java: '/action/project',
    next: '/projects/new',
    domChecks: [
      { kind: 'count', selector: 'nav.menu' },
      { kind: 'count', selector: '.button-block.real-button-block' },
      { kind: 'count', selector: '.button-block.link-button-block' },
      { kind: 'count', selector: '#topBackLink' },
      { kind: 'count', selector: '#bottomBackLink' },
    ],
  },
  {
    name: 'project-detail',
    java: '/action/project/show/1',
    next: '/projects/1',
    domChecks: [
      { kind: 'count', selector: 'nav.menu' },
      { kind: 'text', selector: '#topReturnList' },
      { kind: 'text', selector: '#bottomReturnList' },
    ],
  },
  {
    name: 'project-edit',
    java: '/action/project/edit/1',
    next: '/projects/1/edit',
    domChecks: [{ kind: 'count', selector: 'nav.menu' }],
  },
  {
    name: 'project-bulk',
    java: '/action/projectBulk/index',
    next: '/projects/bulk',
    domChecks: [
      { kind: 'count', selector: 'nav.menu' },
      { kind: 'count', selector: '#search' },
      { kind: 'count', selector: '#startThisYear' },
    ],
  },
  {
    name: 'project-new-complete',
    java: '/action/project/completeOfCreate',
    next: '/projects/new/complete',
    domChecks: [
      { kind: 'count', selector: 'nav.menu' },
      { kind: 'text', selector: '.message-area' },
    ],
  },
  {
    name: 'project-edit-complete',
    java: '/action/project/completeOfUpdate',
    next: '/projects/1/edit/complete',
    domChecks: [
      { kind: 'count', selector: 'nav.menu' },
      { kind: 'text', selector: '.message-area' },
      { kind: 'text', selector: '#topReturnList' },
      { kind: 'text', selector: '#bottomReturnList' },
    ],
  },
  {
    name: 'project-delete-complete',
    java: '/action/project/completeOfDelete',
    next: '/projects/delete-complete',
    domChecks: [
      { kind: 'count', selector: 'nav.menu' },
      { kind: 'text', selector: '.message-area' },
      { kind: 'text', selector: '#topReturnList' },
      { kind: 'text', selector: '#bottomReturnList' },
    ],
  },
  {
    name: 'project-bulk-complete',
    java: '/action/projectBulk/completeOfUpdate',
    next: '/projects/bulk/complete',
    domChecks: [
      { kind: 'count', selector: 'nav.menu' },
      { kind: 'text', selector: '.message-area' },
      { kind: 'text', selector: '#topReturnList' },
      { kind: 'text', selector: '#bottomReturnList' },
    ],
  },
  {
    name: 'project-upload',
    java: '/action/projectUpload/index',
    next: '/projects/upload',
  },
] as const

type Screenshot = {
  name: string
  javaPath: string
  nextPath: string
  diffPath?: string
  diffPixels?: number
}

const screenshots: Screenshot[] = []

function compareScreenshotBuffers(name: string, javaBuffer: Buffer, nextBuffer: Buffer) {
  const javaPng = PNG.sync.read(javaBuffer)
  const nextPng = PNG.sync.read(nextBuffer)

  const sameSize = javaPng.width === nextPng.width && javaPng.height === nextPng.height
  const diffFile = `diff/${name}.png`

  if (!sameSize) {
    const mismatchImage = new PNG({ width: Math.max(javaPng.width, nextPng.width), height: Math.max(javaPng.height, nextPng.height) })
    writeFileSync(join(OUTPUT_DIR, diffFile), PNG.sync.write(mismatchImage))
    return {
      diffFile,
      diffPixels: Number.POSITIVE_INFINITY,
      sameSize,
      javaSize: { width: javaPng.width, height: javaPng.height },
      nextSize: { width: nextPng.width, height: nextPng.height },
    }
  }

  const diffPng = new PNG({ width: javaPng.width, height: javaPng.height })
  const diffPixels = pixelmatch(
    javaPng.data,
    nextPng.data,
    diffPng.data,
    javaPng.width,
    javaPng.height,
    {
      threshold: 0,
      includeAA: true,
    },
  )

  writeFileSync(join(OUTPUT_DIR, diffFile), PNG.sync.write(diffPng))

  return {
    diffFile,
    diffPixels,
    sameSize,
    javaSize: { width: javaPng.width, height: javaPng.height },
    nextSize: { width: nextPng.width, height: nextPng.height },
  }
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

async function compareDomChecks(
  javaPage: import('@playwright/test').Page,
  nextPage: import('@playwright/test').Page,
  checks: DomCheck[],
) {
  for (const check of checks) {
    if (check.kind === 'count') {
      await expect(nextPage.locator(check.selector)).toHaveCount(await javaPage.locator(check.selector).count())
      continue
    }

    const javaTexts = (await javaPage.locator(check.selector).allTextContents()).map(normalizeText)
    const nextTexts = (await nextPage.locator(check.selector).allTextContents()).map(normalizeText)
    expect(nextTexts).toEqual(javaTexts)
  }
}

/**
 * Java ページの読み込み待ち（CDN が CORS ブロックされるため networkidle は使えない）。
 */
async function waitForJavaPage(page: import('@playwright/test').Page) {
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(1000)
}

/**
 * Java アプリにログインし、セッション付きの Page を返す。
 */
async function loginToJava(page: import('@playwright/test').Page) {
  await page.goto(`${JAVA_BASE}/action/login`)
  await waitForJavaPage(page)
  await page.fill('input[name="loginId"]', JAVA_LOGIN.id)
  await page.fill('input[name="userPassword"]', JAVA_LOGIN.password)
  await page.getByRole('button', { name: 'ログイン' }).click()
  await page.waitForURL('**/action/project/**', { timeout: 10000 })
  await waitForJavaPage(page)
}

async function loginToNext(page: import('@playwright/test').Page) {
  await page.goto(`${NEXT_BASE}/login`)
  await page.waitForLoadState('networkidle')
  await page.fill('input[name="loginId"]', JAVA_LOGIN.id)
  await page.fill('input[name="userPassword"]', JAVA_LOGIN.password)
  await page.getByRole('button', { name: 'ログイン' }).click()
  await page.waitForURL('**/projects', { timeout: 10000 })
  await page.waitForLoadState('networkidle')
}

async function moveToPageNumber(
  page: import('@playwright/test').Page,
  pageNumber: string,
  wait: 'java' | 'next',
) {
  await page
    .locator('a.page-link', { hasText: new RegExp(`^${pageNumber}$`) })
    .first()
    .click()
  if (wait === 'java') {
    await waitForJavaPage(page)
    return
  }
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(300)
}

test.describe('Java vs Next.js 視覚比較', () => {
  test.setTimeout(60_000)

  test.beforeAll(() => {
    mkdirSync(join(OUTPUT_DIR, 'java'), { recursive: true })
    mkdirSync(join(OUTPUT_DIR, 'next'), { recursive: true })
    mkdirSync(join(OUTPUT_DIR, 'diff'), { recursive: true })
  })

  for (const entry of PAGE_MAP) {
    test(`${entry.name}`, async ({ browser }) => {
      const javaCtx = await browser.newContext({
        viewport: { width: 1280, height: 900 },
      })
      const nextCtx = await browser.newContext({
        viewport: { width: 1280, height: 900 },
      })

      const javaPage = await javaCtx.newPage()
      const nextPage = await nextCtx.newPage()

      try {
        // --- Java 側 ---
        if (!('skipAuth' in entry && entry.skipAuth)) {
          await loginToJava(javaPage)
        }
        await javaPage.goto(`${JAVA_BASE}${entry.java}`)
        await waitForJavaPage(javaPage)
        if (entry.pageNumber !== undefined) {
          await moveToPageNumber(javaPage, entry.pageNumber, 'java')
        }

        const javaFile = `java/${entry.name}.png`
        const javaScreenshot = await javaPage.screenshot({
          path: join(OUTPUT_DIR, javaFile),
          fullPage: true,
        })

        // --- Next.js 側 ---
        if (!('skipAuth' in entry && entry.skipAuth)) {
          await loginToNext(nextPage)
        }
        await nextPage.goto(`${NEXT_BASE}${entry.next}`)
        await nextPage.waitForLoadState('networkidle')
        await nextPage.waitForTimeout(500)
        if (entry.pageNumber !== undefined) {
          await moveToPageNumber(nextPage, entry.pageNumber, 'next')
        }

        if (entry.domChecks) {
          await compareDomChecks(javaPage, nextPage, entry.domChecks)
        }

        const nextFile = `next/${entry.name}.png`
        const nextScreenshot = await nextPage.screenshot({
          path: join(OUTPUT_DIR, nextFile),
          fullPage: true,
        })

        const comparison = compareScreenshotBuffers(entry.name, javaScreenshot, nextScreenshot)

        screenshots.push({
          name: entry.name,
          javaPath: javaFile,
          nextPath: nextFile,
          diffPath: comparison.diffFile,
          diffPixels: comparison.diffPixels,
        })

        if (PERFECT_PIXEL_COMPARE) {
          expect(
            { width: comparison.nextSize.width, height: comparison.nextSize.height },
            `${entry.name}: screenshot size differs between Java and Next.js`,
          ).toEqual({ width: comparison.javaSize.width, height: comparison.javaSize.height })
          expect(comparison.diffPixels, `${entry.name}: pixel difference detected`).toBe(0)
        }
      } finally {
        await javaCtx.close()
        await nextCtx.close()
      }
    })
  }

  test.afterAll(() => {
    generateReport(screenshots)
  })
})

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
        <div class="side">
          <h3>Diff (${s.diffPixels ?? 0} px)</h3>
          <img src="${s.diffPath ?? ''}" alt="${s.name} - Diff" />
        </div>
      </div>
    </div>`,
    )
    .join('\n')

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
    .images { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    .side h3 { text-align: center; margin-bottom: 8px; color: #777; }
    .side img { width: 100%; border: 1px solid #ddd; border-radius: 4px; }
    .meta { text-align: center; color: #999; font-size: 12px; margin-top: 16px; }
  </style>
</head>
<body>
  <h1>Nablarch → Next.js 移行 視覚比較レポート</h1>
  ${rows}
  <p class="meta">生成日時: ${new Date().toLocaleString('ja-JP')}</p>
</body>
</html>`

  writeFileSync(join(OUTPUT_DIR, 'report.html'), html, 'utf-8')
  console.log(`\n📊 比較レポート: ${join(OUTPUT_DIR, 'report.html')}\n`)
}
