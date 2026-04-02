import { expect, test } from '@playwright/test'

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

test.describe('Java display parity', () => {
  test('project list uses Java-style slash dates on later pages', async ({ page }) => {
    await loginToNext(page)
    await page.goto('/projects?pageNumber=7')
    await page.waitForLoadState('networkidle')

    const firstRow = page.locator('table.table-striped.table-hover tbody tr.info').first()

    await expect(firstRow.locator('td').nth(3)).toHaveText(/\d{4}\/\d{2}\/\d{2}/)
    await expect(firstRow.locator('td').nth(4)).toHaveText(/\d{4}\/\d{2}\/\d{2}/)
  })

  test('project detail uses Java-style slash dates', async ({ page }) => {
    await loginToNext(page)
    await page.goto('/projects/1')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('cell', { name: /\d{4}\/\d{2}\/\d{2}/ }).first()).toBeVisible()
  })

  test('project create form uses Java-style text date inputs', async ({ page }) => {
    await loginToNext(page)
    await page.goto('/projects/new')
    await page.waitForLoadState('networkidle')

    const startDate = page.locator('input[name="projectStartDate"]')
    const endDate = page.locator('input[name="projectEndDate"]')

    await expect(startDate).toHaveAttribute('type', 'text')
    await expect(endDate).toHaveAttribute('type', 'text')
  })

  test('project edit form uses Java-style text date inputs and slash values', async ({ page }) => {
    await loginToNext(page)
    await page.goto('/projects/1/edit')
    await page.waitForLoadState('networkidle')

    const startDate = page.locator('input[name="projectStartDate"]')
    const endDate = page.locator('input[name="projectEndDate"]')

    await expect(startDate).toHaveAttribute('type', 'text')
    await expect(endDate).toHaveAttribute('type', 'text')
    await expect(startDate).toHaveValue(/\d{4}\/\d{2}\/\d{2}/)
    await expect(endDate).toHaveValue(/\d{4}\/\d{2}\/\d{2}/)
    await expect(page.getByText('本当に削除しますか？')).toHaveCount(0)
  })

  test('project bulk form uses Java-style text date inputs and slash values', async ({ page }) => {
    await loginToNext(page)
    await page.goto('/projects/bulk')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('.search-result-count')).not.toHaveText('0')
    const firstRow = page.locator('table.table-striped.table-hover tbody tr.info').first()
    const startDate = firstRow.locator('td').nth(3).locator('input')
    const endDate = firstRow.locator('td').nth(4).locator('input')

    await expect(startDate).toHaveAttribute('type', 'text')
    await expect(endDate).toHaveAttribute('type', 'text')
    await expect(startDate).toHaveValue(/\d{4}\/\d{2}\/\d{2}/)
    await expect(endDate).toHaveValue(/\d{4}\/\d{2}\/\d{2}/)
  })

  test('project create confirm title matches Java', async ({ page }) => {
    await loginToNext(page)
    await page.goto('/projects/new')
    await page.waitForLoadState('networkidle')

    await page.evaluate(() => {
      const value = encodeURIComponent(
        JSON.stringify({
          projectName: 'テストPJ',
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
        }),
      )
      document.cookie = `project_form_data=${value}; path=/; max-age=600; samesite=strict`
    })

    await page.goto('/projects/new/confirm')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('.page-title')).toHaveText('プロジェクト登録画面')
  })

  test('project upload document title matches Java', async ({ page }) => {
    await loginToNext(page)
    await page.goto('/projects/upload')
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveTitle('プロジェクト一括登録画面')
  })
})
