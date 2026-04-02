import { test, expect } from '@playwright/test'

/**
 * Next.js ページのスナップショットテスト。
 *
 * Java 参照 CSV を mock 初期データへ流用しているため、全ページで厳密なピクセル比較を行う。
 *
 * 使い方:
 *   1. ベースライン作成: pnpm e2e:update
 *   2. 比較テスト実行:   pnpm e2e
 *
 * @see _references/nablarch-example-web/ — 元 JSP アプリケーション
 */

const pages = [
  { name: 'login', path: '/login' },
  { name: 'project-list', path: '/projects' },
  { name: 'project-list-page-7', path: '/projects?pageNumber=7' },
  { name: 'project-new', path: '/projects/new' },
  { name: 'project-detail', path: '/projects/1' },
  { name: 'project-edit', path: '/projects/1/edit' },
  { name: 'project-bulk', path: '/projects/bulk' },
  { name: 'project-upload', path: '/projects/upload' },
  // Error pages
  { name: 'error-system', path: '/error' },
  { name: 'error-double-submission', path: '/error?type=doubleSubmission' },
  { name: 'error-optimistic-lock', path: '/error?type=optimisticLock' },
  { name: 'error-not-found', path: '/error?type=notFound' },
  { name: 'error-permission', path: '/error?type=permission' },
  { name: 'error-too-large', path: '/error?type=tooLarge' },
  { name: 'error-unavailable', path: '/error?type=unavailable' },
  { name: 'error-tampering', path: '/error?type=tampering' },
  { name: 'error-user', path: '/error?type=user' },
] as const

const LOGIN = { id: '10000001', password: 'pass123-' }

async function loginToNext(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')
  await page.fill('input[name="loginId"]', LOGIN.id)
  await page.fill('input[name="userPassword"]', LOGIN.password)
  await page.getByRole('button', { name: 'ログイン' }).click()
  await page.waitForURL('**/projects', { timeout: 10000 })
  await page.waitForLoadState('networkidle')
}

for (const entry of pages) {
  test(`${entry.name} (${entry.path})`, async ({ page }) => {
    if (entry.path !== '/login') {
      await loginToNext(page)
    }
    await page.goto(entry.path)
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveScreenshot(`${entry.name}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })
}
