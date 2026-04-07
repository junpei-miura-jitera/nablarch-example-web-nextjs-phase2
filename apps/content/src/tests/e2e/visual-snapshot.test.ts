import { Buffer } from 'node:buffer'
import { test, expect } from '@playwright/test'

/**
 * Next.js ページのスナップショットテスト。
 *
 * Java 参照 CSV を mock 初期データへ流用しているため、全ページで厳密なピクセル比較を行う。
 *
 * 使い方:
 *
 * 1. ベースライン作成: pnpm e2e:update
 * 2. 比較テスト実行: pnpm e2e
 *
 * @see _references/nablarch-example-web/ — 元 JSP アプリケーション
 */

type SnapshotPage = {
  name: string
  path: string
  auth?: 'admin' | 'member' | 'none'
  beforeGoto?: (page: import('@playwright/test').Page) => Promise<void>
  afterGoto?: (page: import('@playwright/test').Page) => Promise<void>
}

const PROJECT_FORM_COOKIE = {
  projectName: 'テスト案件',
  projectType: 'development',
  projectClass: 'a',
  clientId: '1',
  clientName: 'テスト顧客',
  projectStartDate: '2015/04/09',
  projectEndDate: '2015/04/10',
  projectManager: '',
  projectLeader: '',
  note: '',
  sales: '1000',
  costOfGoodsSold: '500',
  sga: '100',
  allocationOfCorpExpenses: '50',
}

const PROJECT_UPDATE_FORM_COOKIE = {
  ...PROJECT_FORM_COOKIE,
  projectId: 1,
  version: 1,
}

const PROJECT_BULK_FORM_COOKIE = {
  projectList: [
    {
      projectId: '1',
      projectName: 'プロジェクト００１',
      projectType: 'development',
      projectStartDate: '2010/09/18',
      projectEndDate: '2015/04/09',
    },
    {
      projectId: '2',
      projectName: 'プロジェクト００２',
      projectType: 'maintenance',
      projectStartDate: '2012/06/22',
      projectEndDate: '2014/12/31',
    },
  ],
}

async function seedProjectFormCookie(
  page: import('@playwright/test').Page,
  data: Record<string, unknown>,
) {
  await page.evaluate((value) => {
    document.cookie = `project_form_data=${encodeURIComponent(JSON.stringify(value))}; path=/; max-age=600; samesite=strict`
  }, data)
}

const ADMIN_LOGIN = { id: '10000001', password: 'pass123-' }
const MEMBER_LOGIN = { id: '10000002', password: 'pass123-' }
const MOCK_BASE_URL = process.env.MOCK_SERVER_BASE_URL ?? 'http://localhost:9090'

async function waitForStablePage(page: import('@playwright/test').Page) {
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(200)
}

async function loginToNext(
  page: import('@playwright/test').Page,
  credential: typeof ADMIN_LOGIN | typeof MEMBER_LOGIN = ADMIN_LOGIN,
) {
  await page.goto('/login')
  await waitForStablePage(page)
  await page.fill('input[name="loginId"]', credential.id)
  await page.fill('input[name="userPassword"]', credential.password)
  await page.getByRole('button', { name: 'ログイン' }).click()
  await page.waitForURL('**/projects', { timeout: 10000 })
  await waitForStablePage(page)
}

test('project-upload-api accepts upload payload', async ({ request }) => {
  await request.post(`${MOCK_BASE_URL}/__mock/reset`)
  try {
    const res = await request.post('/api/projectupload/upload', {
      multipart: {
        uploadFile: {
          name: 'projects.csv',
          mimeType: 'text/csv',
          buffer: Buffer.from(
            [
              'projectName,projectType,projectClass,projectManager,projectLeader,clientId,clientName,projectStartDate,projectEndDate,note,sales,costOfGoodsSold,sga,allocationOfCorpExpenses',
              'テストPJ,development,a,担当者,責任者,1,テスト顧客,2015/04/09,2015/04/10,備考,1000,500,100,50',
            ].join('\n'),
          ),
        },
      },
    })
    expect(res.ok()).toBeTruthy()
    await expect(res.json()).resolves.toMatchObject({ ok: true, count: 1 })
  } finally {
    await request.post(`${MOCK_BASE_URL}/__mock/reset`)
  }
})

const pages: SnapshotPage[] = [
  { name: 'login', path: '/login', auth: 'none' },
  {
    name: 'login-invalid-credentials',
    path: '/login',
    auth: 'none',
    afterGoto: async (page) => {
      await page.fill('input[name="loginId"]', ADMIN_LOGIN.id)
      await page.fill('input[name="userPassword"]', 'wrong-password')
      await page.getByRole('button', { name: 'ログイン' }).click()
      await expect(page.locator('.message-area .message-error')).toBeVisible()
    },
  },
  { name: 'project-list', path: '/projects' },
  { name: 'project-list-page-7', path: '/projects?pageNumber=7' },
  {
    name: 'project-list-filtered',
    path: '/projects?projectName=%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88&projectClass=a&sortKey=name&sortDir=desc',
    afterGoto: async (page) => {
      await expect(page.locator('#projectName')).toHaveValue('プロジェクト')
      await expect(page.locator('select').nth(0)).toHaveValue('name')
      await expect(page.locator('select').nth(1)).toHaveValue('desc')
    },
  },
  {
    name: 'project-list-empty',
    path: '/projects?projectName=%E5%AD%98%E5%9C%A8%E3%81%97%E3%81%AA%E3%81%84%E6%A1%88%E4%BB%B6',
    afterGoto: async (page) => {
      await expect(page.locator('.search-result-count')).toHaveText('0')
    },
  },
  {
    name: 'project-list-client-modal',
    path: '/projects',
    afterGoto: async (page) => {
      await page.locator('nav.menu .text-end button').first().click()
      await expect(page.locator('#client-search-title')).toHaveText('顧客検索一覧画面')
      await waitForStablePage(page)
    },
  },
  { name: 'project-new', path: '/projects/new' },
  {
    name: 'project-new-validation-error',
    path: '/projects/new',
    afterGoto: async (page) => {
      await page.fill('input[name="projectStartDate"]', '2015/04/10')
      await page.fill('input[name="projectEndDate"]', '2015/04/09')
      await page.getByRole('button', { name: '登録' }).first().click()
      await expect(page.locator('.message-error').first()).toBeVisible()
      await waitForStablePage(page)
    },
  },
  {
    name: 'project-new-client-modal',
    path: '/projects/new',
    afterGoto: async (page) => {
      await page.locator('.btn-group-sm button').first().click()
      await expect(page.locator('#client-search-title')).toHaveText('顧客検索一覧画面')
      await waitForStablePage(page)
    },
  },
  {
    name: 'project-new-confirm',
    path: '/projects/new/confirm',
    beforeGoto: async (page) => seedProjectFormCookie(page, PROJECT_FORM_COOKIE),
  },
  {
    name: 'project-new-confirm-submit-error',
    path: '/projects/new/confirm',
    beforeGoto: async (page) => {
      await seedProjectFormCookie(page, PROJECT_FORM_COOKIE)
      await page.route('**/api/project/create', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ ok: false, message: '登録に失敗しました。' }),
        })
      })
    },
    afterGoto: async (page) => {
      await page.getByRole('button', { name: '確定' }).first().click()
      await expect(page.getByText('登録に失敗しました。')).toBeVisible()
    },
  },
  { name: 'project-new-complete', path: '/projects/new/complete' },
  { name: 'project-detail', path: '/projects/1' },
  { name: 'project-edit', path: '/projects/1/edit' },
  {
    name: 'project-edit-validation-error',
    path: '/projects/1/edit',
    afterGoto: async (page) => {
      await page.fill('input[name="projectName"]', '')
      await page.fill('input[name="projectEndDate"]', '2010/01/01')
      await page.getByRole('button', { name: '更新' }).first().click()
      await expect(page.locator('.message-error').first()).toBeVisible()
      await waitForStablePage(page)
    },
  },
  {
    name: 'project-edit-client-modal',
    path: '/projects/1/edit',
    afterGoto: async (page) => {
      await page.locator('.btn-group-sm button').first().click()
      await expect(page.locator('#client-search-title')).toHaveText('顧客検索一覧画面')
      await waitForStablePage(page)
    },
  },
  {
    name: 'project-edit-confirm',
    path: '/projects/1/edit/confirm',
    beforeGoto: async (page) => seedProjectFormCookie(page, PROJECT_UPDATE_FORM_COOKIE),
  },
  {
    name: 'project-edit-confirm-submit-error',
    path: '/projects/1/edit/confirm',
    beforeGoto: async (page) => {
      await seedProjectFormCookie(page, PROJECT_UPDATE_FORM_COOKIE)
      await page.route('**/api/project/update', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: false, message: '更新に失敗しました。' }),
        })
      })
    },
    afterGoto: async (page) => {
      await page.getByRole('button', { name: '確定' }).first().click()
      await expect(page.getByText('更新に失敗しました。')).toBeVisible()
    },
  },
  { name: 'project-edit-complete', path: '/projects/1/edit/complete' },
  { name: 'project-delete-complete', path: '/projects/delete-complete' },
  { name: 'project-bulk', path: '/projects/bulk' },
  {
    name: 'project-bulk-empty',
    path: '/projects/bulk?projectName=__NO_MATCH_PROJECT__',
    afterGoto: async (page) => {
      await expect(page.locator('.search-result-count')).toHaveText('0')
    },
  },
  {
    name: 'project-bulk-validation-error',
    path: '/projects/bulk',
    afterGoto: async (page) => {
      const projectName = page.locator('input[name="projectList.0.projectName"]')
      await projectName.click()
      await projectName.press(`${process.platform === 'darwin' ? 'Meta' : 'Control'}+A`)
      await projectName.press('Backspace')
      await page.getByRole('button', { name: '更新' }).first().click()
      await expect(page.getByText('プロジェクト名を入力してください。')).toBeVisible()
      await waitForStablePage(page)
    },
  },
  {
    name: 'project-bulk-confirm',
    path: '/projects/bulk/confirm',
    beforeGoto: async (page) => seedProjectFormCookie(page, PROJECT_BULK_FORM_COOKIE),
  },
  {
    name: 'project-bulk-confirm-submit-error',
    path: '/projects/bulk/confirm',
    beforeGoto: async (page) => {
      await seedProjectFormCookie(page, PROJECT_BULK_FORM_COOKIE)
      await page.route('**/api/projectbulk/update', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: false, message: '更新に失敗しました。' }),
        })
      })
    },
    afterGoto: async (page) => {
      await page.getByRole('button', { name: '確定' }).first().click()
      await expect(page.getByText('更新に失敗しました。')).toBeVisible()
    },
  },
  { name: 'project-bulk-complete', path: '/projects/bulk/complete' },
  { name: 'project-upload', path: '/projects/upload' },
  {
    name: 'project-upload-success',
    path: '/projects/upload',
    afterGoto: async (page) => {
      await page.route('**/api/projectupload/upload', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ok: true,
            count: 1,
            message: '1件のプロジェクトを登録しました。',
          }),
        })
      })
      const uploadInput = page.locator('#uploadFile')
      await uploadInput.setInputFiles({
        name: 'projects.csv',
        mimeType: 'text/csv',
        buffer: Buffer.from('header1,header2\nok,data\n'),
      })
      await page.getByRole('button', { name: '登録' }).first().click()
      await expect(page.locator('.message-info')).toContainText('1件のプロジェクトを登録しました。')
      await waitForStablePage(page)
    },
  },
  {
    name: 'project-upload-error',
    path: '/projects/upload',
    afterGoto: async (page) => {
      await page.route('**/api/projectupload/upload', async (route) => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            ok: false,
            message: '1行目: 顧客IDが不正です。\n2行目: プロジェクト名は必須です。',
          }),
        })
      })
      const uploadInput = page.locator('#uploadFile')
      await uploadInput.setInputFiles({
        name: 'projects.csv',
        mimeType: 'text/csv',
        buffer: Buffer.from('header1,header2\nbad,data\n'),
      })
      await page.getByRole('button', { name: '登録' }).first().click()
      await expect(page.locator('.message-area .message-error').first()).toBeVisible()
      await waitForStablePage(page)
    },
  },
  {
    name: 'project-upload-permission-member',
    path: '/projects/upload',
    auth: 'member',
    afterGoto: async (page) => {
      await page.waitForURL('**/error?type=permission', { timeout: 10000 })
      await waitForStablePage(page)
    },
  },
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

test.describe.configure({ mode: 'serial' })

for (const entry of pages) {
  test(`${entry.name} (${entry.path})`, async ({ page }) => {
    if (entry.auth !== 'none') {
      await loginToNext(page, entry.auth === 'member' ? MEMBER_LOGIN : ADMIN_LOGIN)
    }
    if (entry.beforeGoto) {
      await entry.beforeGoto(page)
    }
    await page.goto(entry.path)
    await waitForStablePage(page)
    if (entry.afterGoto) {
      await entry.afterGoto(page)
    }

    await expect(page).toHaveScreenshot(`${entry.name}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    })
  })
}
