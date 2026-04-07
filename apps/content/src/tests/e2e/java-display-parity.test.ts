import { expect, test } from '@playwright/test'

const LOGIN = { id: '10000001', password: 'pass123-' }
const LOGIN_FAILURE_MESSAGE =
  'ログインに失敗しました。ログインIDまたはパスワードが誤っています。'
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

type InputAttrs = {
  maxLength?: string | null
  pattern?: string | null
  inputMode?: string | null
  readOnly?: boolean
  tabIndex?: string | null
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

const ERROR_EXPECTATIONS = [
  {
    path: '/error',
    message: 'システムエラーが発生しました。このシステムの管理者に連絡してください。',
  },
  {
    path: '/error?type=doubleSubmission',
    message: '不正な画面遷移を検出したため、処理を中断しました。',
  },
  {
    path: '/error?type=optimisticLock',
    message: '対象の情報は、他のユーザによって既に変更されているため操作を完了できませんでした。',
  },
  { path: '/error?type=notFound', message: '指定されたページは存在しないか、既に削除されています。' },
  { path: '/error?type=permission', message: 'アクセス権限がありません。' },
  {
    path: '/error?type=tooLarge',
    message: 'アップロードファイルのサイズがシステム上限値を超過しました。',
  },
  { path: '/error?type=unavailable', message: 'サービス提供時間外です。' },
  {
    path: '/error?type=tampering',
    message: '既にログアウトされています。ログイン後に処理を行ってください。',
  },
  {
    path: '/error?type=user',
    message:
      '処理を正常に終了することができませんでした。お手数ですが、入力内容をご確認の上、少し間をおいてから、もう一度手順をやりなおして下さい。状況が変わらない場合は、お手数ですが、このシステムの管理者にご連絡ください。',
  },
] as const

const PROJECT_REQUIRED_MESSAGE = '入力してください。'
const PROJECT_NAME_FULLWIDTH_MESSAGE = 'プロジェクト名は64文字以下の全角文字で入力してください。'
const USER_NAME_FULLWIDTH_MESSAGE = '氏名は64文字以下の全角文字で入力してください。'
const CLIENT_NAME_FULLWIDTH_MESSAGE = '顧客名は64文字以下の全角文字で入力してください。'

async function loginToNext(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')
  await page.fill('input[name="loginId"]', LOGIN.id)
  await page.fill('input[name="userPassword"]', LOGIN.password)
  await page.getByRole('button', { name: 'ログイン' }).click()
  await page.waitForURL('**/projects', { timeout: 10000 })
  await page.waitForLoadState('networkidle')
}

async function seedProjectFormCookie(
  page: import('@playwright/test').Page,
  data: Record<string, unknown>,
) {
  await page.evaluate((value) => {
    document.cookie = `project_form_data=${encodeURIComponent(JSON.stringify(value))}; path=/; max-age=600; samesite=strict`
  }, data)
}

async function setInputValue(page: import('@playwright/test').Page, selector: string, value: string) {
  await page.locator(selector).evaluate(
    (element, nextValue) => {
      const input = element as HTMLInputElement
      input.value = nextValue
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
    },
    value,
  )
}

async function expectInputAttrs(
  locator: import('@playwright/test').Locator,
  expected: InputAttrs,
) {
  const attrs = await locator.evaluate((element) => ({
    maxLength: element.getAttribute('maxlength'),
    pattern: element.getAttribute('pattern'),
    inputMode: element.getAttribute('inputmode'),
    readOnly: (element as HTMLInputElement | HTMLTextAreaElement).readOnly,
    tabIndex: element.getAttribute('tabindex'),
  }))

  expect(attrs).toEqual({
    maxLength: expected.maxLength ?? null,
    pattern: expected.pattern ?? null,
    inputMode: expected.inputMode ?? null,
    readOnly: expected.readOnly ?? false,
    tabIndex: expected.tabIndex ?? null,
  })
}

test.describe('Java display parity', () => {
  test('login invalid credentials uses the Java global error message', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    await page.fill('input[name="loginId"]', LOGIN.id)
    await page.fill('input[name="userPassword"]', 'wrong-password')
    await page.getByRole('button', { name: 'ログイン' }).click()

    await expect(page.locator('.message-area')).toContainText(LOGIN_FAILURE_MESSAGE)
    await expect(page.getByText('ログインIDまたはパスワードが正しくありません。')).toHaveCount(0)
  })

  test('login header link reloads the login page like Java', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    const loginId = page.locator('input[name="loginId"]')
    const userPassword = page.locator('input[name="userPassword"]')

    await loginId.fill('10000001')
    await userPassword.fill('temporary-password')
    await page.getByRole('link', { name: 'ログイン' }).click()
    await page.waitForLoadState('networkidle')

    await expect(loginId).toHaveValue('')
    await expect(userPassword).toHaveValue('')
  })

  test('login accepts Java-style unconstrained loginId input and reports invalid format globally', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    const loginId = page.locator('input[name="loginId"]')
    const attrs = await loginId.evaluate((element) => ({
      maxLength: element.getAttribute('maxlength'),
      pattern: element.getAttribute('pattern'),
      inputMode: element.getAttribute('inputmode'),
    }))

    expect(attrs).toEqual({
      maxLength: null,
      pattern: null,
      inputMode: null,
    })

    await loginId.fill('abcdefghijklmnopqrstu')
    await page.fill('input[name="userPassword"]', 'wrong-password')
    await page.getByRole('button', { name: 'ログイン' }).click()

    await expect(loginId).toHaveValue('abcdefghijklmnopqrstu')
    await expect(page.locator('.message-area')).toContainText(LOGIN_FAILURE_MESSAGE)
    await expect(page.getByText('ログインIDは20文字以内で入力してください。')).toHaveCount(0)
    await expect(page.getByText('ログインIDは半角数字で入力してください。')).toHaveCount(0)
  })

  test('project create form keeps Java input attributes on shared fields', async ({ page }) => {
    await loginToNext(page)
    await page.goto('/projects/new')
    await page.waitForLoadState('networkidle')

    await expectInputAttrs(page.locator('input[name="projectName"]'), { maxLength: '64' })
    await expectInputAttrs(page.locator('input[name="clientId"]'), {
      maxLength: '10',
      readOnly: true,
      tabIndex: '-1',
    })
    await expectInputAttrs(page.locator('input[name="clientName"]'), {
      maxLength: '64',
      readOnly: true,
      tabIndex: '-1',
    })
    await expectInputAttrs(page.locator('input[name="projectStartDate"]'), {})
    await expectInputAttrs(page.locator('input[name="projectEndDate"]'), {})
    await expectInputAttrs(page.locator('input[name="sales"]'), { maxLength: '9' })
    await expectInputAttrs(page.locator('input[name="costOfGoodsSold"]'), { maxLength: '9' })
  })

  test('project create form keeps Java button wrappers and back link ids', async ({ page }) => {
    await loginToNext(page)
    await page.goto('/projects/new')
    await page.waitForLoadState('networkidle')

    const topNav = page.locator('.title-nav').first()
    const footerNav = page.locator('.title-nav.page-footer').first()

    await expect(topNav.locator('.button-block.real-button-block')).toHaveCount(1)
    await expect(topNav.locator('.button-block.link-button-block')).toHaveCount(1)
    await expect(page.locator('#topBackLink')).toHaveText('戻る')

    await expect(footerNav.locator('.button-block.real-button-block')).toHaveCount(1)
    await expect(footerNav.locator('.button-block.link-button-block')).toHaveCount(1)
    await expect(page.locator('#bottomBackLink')).toHaveText('戻る')

    await expect(page.locator('.button-nav .ms-2')).toHaveCount(0)
  })

  test('project create form uses Java required messages on empty submit', async ({ page }) => {
    await loginToNext(page)
    await page.goto('/projects/new')
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: '登録' }).first().click()

    await expect(page.locator('tr').filter({ hasText: 'プロジェクト名' }).locator('.message-error')).toHaveText(
      PROJECT_REQUIRED_MESSAGE,
    )
    await expect(page.locator('tr').filter({ hasText: '顧客名' }).locator('.message-error').first()).toHaveText(
      PROJECT_REQUIRED_MESSAGE,
    )
    await expect(page.getByText('プロジェクト名を入力してください。')).toHaveCount(0)
    await expect(page.getByText('顧客を選択してください。')).toHaveCount(0)
  })

  test('project create form rejects half-width values before confirm', async ({ page }) => {
    await loginToNext(page)
    await page.goto('/projects/new')
    await page.waitForLoadState('networkidle')

    await page.fill('input[name="projectName"]', 'test project')
    await page.fill('input[name="projectManager"]', 'manager')
    await setInputValue(page, '#client-id', '1')
    await setInputValue(page, '#client-name', 'test client')

    await page.getByRole('button', { name: '登録' }).first().click()

    await expect(page).toHaveURL(/\/projects\/new$/)
    await expect(page.locator('tr').filter({ hasText: 'プロジェクト名' }).locator('.message-error')).toHaveText(
      PROJECT_NAME_FULLWIDTH_MESSAGE,
    )
    await expect(
      page.locator('tr').filter({ hasText: 'プロジェクトマネージャー' }).locator('.message-error'),
    ).toHaveText(USER_NAME_FULLWIDTH_MESSAGE)
  })

  test('project create form shows a datepicker popup like Java', async ({ page }) => {
    await loginToNext(page)
    await page.goto('/projects/new')
    await page.waitForLoadState('networkidle')

    await page.locator('input[name="projectStartDate"]').click()

    await expect(page.locator('.ui-datepicker')).toBeVisible()
  })

  test('project edit form keeps Java input attributes on shared fields', async ({ page }) => {
    await loginToNext(page)
    await page.goto('/projects/1/edit')
    await page.waitForLoadState('networkidle')

    await expectInputAttrs(page.locator('input[name="projectName"]'), { maxLength: '64' })
    await expectInputAttrs(page.locator('input[name="projectStartDate"]'), {})
    await expectInputAttrs(page.locator('input[name="projectEndDate"]'), {})
    await expectInputAttrs(page.locator('input[name="sales"]'), { maxLength: '9' })
    await expectInputAttrs(page.locator('input[name="allocationOfCorpExpenses"]'), {
      maxLength: '9',
    })
  })

  test('project bulk form keeps Java input attributes on editable cells', async ({ page }) => {
    await loginToNext(page)
    await page.goto('/projects/bulk')
    await page.waitForLoadState('networkidle')

    const firstRow = page.locator('table.table-striped.table-hover tbody tr.info').first()

    await expectInputAttrs(firstRow.locator('input[name="projectList.0.projectName"]'), {
      maxLength: '64',
    })
    await expectInputAttrs(firstRow.locator('input[name="projectList.0.projectStartDate"]'), {
      maxLength: '10',
    })
    await expectInputAttrs(firstRow.locator('input[name="projectList.0.projectEndDate"]'), {
      maxLength: '10',
    })
  })

  test('project side menu keeps Java search ids and field attributes', async ({ page }) => {
    await loginToNext(page)
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    await expectInputAttrs(page.locator('#projectName'), { maxLength: '64' })
    await expect(page.locator('#projectName')).toHaveAttribute('placeholder', 'プロジェクト名')
    await expectInputAttrs(page.locator('#client-id'), { readOnly: true })
    await expect(page.locator('#client-id')).toHaveAttribute('placeholder', '顧客ID')
    await expectInputAttrs(page.locator('#client-name'), { readOnly: true })
    await expect(page.locator('#client-name')).toHaveAttribute('placeholder', '顧客名')
    await expect(page.locator('#firstPageNumber')).toHaveAttribute('type', 'hidden')
    await expect(page.locator('#firstPageNumber')).toHaveValue('1')
    await expect(page.locator('#startThisYear')).toContainText('今年開始')
    await expect(page.locator('#endThisYear')).toContainText('今年終了')
    await expect(page.locator('#endLastYear')).toContainText('昨年までに終了')
    await expect(page.locator('#search')).toHaveAttribute('type', 'submit')
    await expect(page.locator('#search')).toHaveValue('検索')
  })

  test('project list uses Java logout link semantics and no extra download text', async ({ page }) => {
    await loginToNext(page)
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('.headerRightPane a').filter({ hasText: 'ログアウト' })).toHaveCount(1)
    await expect(page.locator('.headerRightPane button').filter({ hasText: 'ログアウト' })).toHaveCount(0)

    const downloadLink = page
      .locator('a')
      .filter({ has: page.locator('img[alt="ダウンロード"]') })
      .first()
    await expect(downloadLink).toHaveText('')
    await expect(page.getByText('TIS株式会社')).toHaveCount(0)
  })

  test('project list hides pagination when Java search result count is zero', async ({ page }) => {
    await loginToNext(page)
    await page.goto('/projects?projectName=存在しない案件')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('.search-result-count')).toHaveText('0')
    await expect(page.locator('.paging')).toHaveCount(0)
    await expect(page.locator('.pagination')).toHaveCount(0)
  })

  test('project list does not keep period filter when Java rank search resubmits the side menu', async ({ page }) => {
    await loginToNext(page)
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    await page.locator('#startThisYear').click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.search-result-count')).toHaveText('0')

    await page.fill('#projectName', 'プロジェクト')
    await page.locator('#search').click()
    await page.waitForLoadState('networkidle')

    await expect(page.locator('.search-result-count')).not.toHaveText('0')
    await expect(page).not.toHaveURL(/projectStartDateBegin=/)
    await expect(page).not.toHaveURL(/projectStartDateEnd=/)
  })

  test('project list rejects half-width search text with Java field message', async ({ page }) => {
    await loginToNext(page)
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    await page.fill('#projectName', 'test project')
    await page.locator('#search').click()
    await page.waitForLoadState('networkidle')

    await expect(page.locator('#projectName').locator('..').locator('.message-error')).toHaveText(
      PROJECT_NAME_FULLWIDTH_MESSAGE,
    )
    await expect(page.locator('.sort-nav')).toHaveCount(0)
  })

  test('project list keeps Java client modal DOM without extra close controls or labels', async ({ page }) => {
    await loginToNext(page)
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    await page.locator('.menu .text-end a').first().click()
    await expect(page.locator('#client-search-dialog')).toBeVisible()

    await expect(page.locator('#client-search-dialog .navbar .btn-close')).toHaveCount(0)
    await expect(page.locator('#message-area .btn-close')).toHaveCount(0)
    await expect(page.locator('#search-industry-code option').first()).toHaveText('')

    await expect(page.locator('#search-result tbody tr').first()).toBeVisible()
    const firstClientCell = page.locator('#search-result tbody tr').first().locator('td').first()
    await expect(firstClientCell.locator('a')).toHaveCount(1)
    await expect(firstClientCell.locator('span.id')).toHaveCount(1)
    await expect(firstClientCell.locator('span.name')).toHaveCount(1)
  })

  test('project list client modal rejects half-width client names like Java', async ({ page }) => {
    await loginToNext(page)
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    await page.locator('.menu .text-end a').first().click()
    await expect(page.locator('#client-search-dialog')).toBeVisible()

    await page.fill('#search-client-name', 'test client')
    await page.locator('#client-search').click()

    await expect(page.locator('#message-area')).toContainText(CLIENT_NAME_FULLWIDTH_MESSAGE)
  })

  test('client search modal keeps Java ids for search controls', async ({ page }) => {
    await loginToNext(page)
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    await page.locator('.menu .text-end a').first().click()

    await expect(page.locator('#client-search-dialog')).toBeVisible()
    await expect(page.locator('#message-area')).toHaveCount(1)
    await expect(page.locator('#client-search')).toContainText('検索')
    await expect(page.locator('#search-client-name')).toHaveAttribute('type', 'text')
    await expect(page.locator('#search-industry-code')).toHaveCount(1)
  })

  test('project detail keeps Java return link ids', async ({ page }) => {
    await loginToNext(page)
    await page.goto('/projects/1')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('#topReturnList')).toHaveText('戻る')
    await expect(page.locator('#bottomReturnList')).toHaveText('戻る')
  })

  test('project complete pages keep Java layout and navigation markers', async ({ page }) => {
    await loginToNext(page)

    await page.goto('/projects/new/complete')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('nav.menu')).toHaveCount(0)
    await expect(page.locator('.message-area.message-info')).toContainText('登録が完了しました。')

    await page.goto('/projects/1/edit/complete')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('#topReturnList')).toHaveText('次へ')
    await expect(page.locator('#bottomReturnList')).toHaveText('次へ')
    await expect(page.locator('.message-area.message-info')).toContainText(
      'プロジェクトの更新が完了しました。',
    )

    await page.goto('/projects/delete-complete')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('nav.menu')).toHaveCount(0)
    await expect(page.locator('#topReturnList')).toHaveText('次へ')
    await expect(page.locator('#bottomReturnList')).toHaveText('次へ')
    await expect(page.locator('.message-area.message-info')).toContainText(
      'プロジェクトの削除が完了しました。',
    )

    await page.goto('/projects/bulk/complete')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('nav.menu')).toHaveCount(0)
    await expect(page.locator('#topReturnList')).toHaveText('次へ')
    await expect(page.locator('#bottomReturnList')).toHaveText('次へ')
    await expect(page.locator('.message-area')).toContainText('プロジェクトの更新が完了しました。')
  })

  test('project create complete next buttons return to Java create screen', async ({ page }) => {
    await loginToNext(page)
    await page.goto('/projects/new/complete')
    await page.waitForLoadState('networkidle')

    await page.getByRole('link', { name: '次へ' }).first().click()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/\/projects\/new$/)

    await page.goto('/projects/new/complete')
    await page.waitForLoadState('networkidle')
    await page.getByRole('link', { name: '次へ' }).nth(1).click()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/\/projects\/new$/)
  })

  test('error pages keep Java dynamic message order', async ({ page }) => {
    await loginToNext(page)

    await page.goto('/error?type=user&message=動的エラー')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.message-area')).toContainText('動的エラー')
    await expect(page.locator('.message-area li.message-error')).toContainText('動的エラー')
    await expect(page.locator('.message-area')).toContainText(
      '処理を正常に終了することができませんでした。',
    )

    const userTexts = await page.locator('.message-area').locator(':scope > *').allTextContents()
    expect(userTexts[0]).toContain('動的エラー')

    await page.goto('/error?type=optimisticLock&message=動的エラー')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.message-area')).toContainText(
      '対象の情報は、他のユーザによって既に変更されているため操作を完了できませんでした。',
    )
    const optimisticTexts = await page
      .locator('.message-area')
      .locator(':scope > *')
      .allTextContents()
    expect(optimisticTexts.at(-1)).toContain('動的エラー')
  })

  test('error pages match Java fixed messages', async ({ page }) => {
    await loginToNext(page)

    for (const entry of ERROR_EXPECTATIONS) {
      await page.goto(entry.path)
      await page.waitForLoadState('networkidle')
      await expect(page).toHaveTitle('エラー画面')
      await expect(page.locator('.page-title')).toHaveText('エラー画面')
      await expect(page.locator('.message-area')).toContainText(entry.message)
    }
  })

  test('project list uses Java-style slash dates on later pages', async ({ page }) => {
    await loginToNext(page)
    await page.goto('/projects?pageNumber=7')
    await page.waitForLoadState('networkidle')

    const firstRow = page.locator('table.table-striped.table-hover tbody tr.info').first()

    await expect(firstRow.locator('td').nth(3)).toHaveText(/\d{4}\/\d{2}\/\d{2}/)
    await expect(firstRow.locator('td').nth(4)).toHaveText(/\d{4}\/\d{2}\/\d{2}/)
  })

  test('project list keeps Java secondary sort order for same end date', async ({ page }) => {
    await loginToNext(page)
    await page.goto('/projects?sortKey=endDate&sortDir=desc')
    await page.waitForLoadState('networkidle')

    const rows = page.locator('table.table-striped.table-hover tbody tr.info')
    const rowCount = await rows.count()
    const seenByDate = new Map<string, number[]>()

    for (let index = 0; index < Math.min(rowCount, 20); index += 1) {
      const row = rows.nth(index)
      const date = (await row.locator('td').nth(4).textContent())?.trim() ?? ''
      const projectId = Number((await row.locator('td').nth(0).textContent())?.trim() ?? '0')
      if (date === '' || Number.isNaN(projectId)) continue
      const values = seenByDate.get(date) ?? []
      values.push(projectId)
      seenByDate.set(date, values)
    }

    const sameDateIds = [...seenByDate.values()].find((values) => values.length >= 2)
    expect(sameDateIds).toBeDefined()
    expect(sameDateIds).toEqual([...sameDateIds!].sort((left, right) => right - left))
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
    await seedProjectFormCookie(page, PROJECT_FORM_COOKIE)

    await page.goto('/projects/new/confirm')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('nav.menu')).toHaveCount(0)
    await expect(page.locator('.page-title')).toHaveText('プロジェクト登録画面')
    await expect(page.getByRole('link', { name: '入力へ戻る' })).toHaveCount(2)
    await expect(page.getByRole('button', { name: '確定' })).toHaveCount(2)
  })

  test('project update confirm title and controls match Java', async ({ page }) => {
    await loginToNext(page)
    await seedProjectFormCookie(page, PROJECT_UPDATE_FORM_COOKIE)

    await page.goto('/projects/1/edit/confirm')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('nav.menu')).toHaveCount(0)
    await expect(page.locator('.page-title')).toHaveText('プロジェクト変更画面')
    await expect(page.getByRole('link', { name: '入力へ戻る' })).toHaveCount(2)
    await expect(page.getByRole('button', { name: '確定' })).toHaveCount(2)
  })

  test('project bulk confirm title, controls and slash dates match Java', async ({ page }) => {
    await loginToNext(page)
    await seedProjectFormCookie(page, PROJECT_BULK_FORM_COOKIE)

    await page.goto('/projects/bulk/confirm')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('nav.menu')).toHaveCount(0)
    await expect(page.locator('.title-nav').first()).toContainText('プロジェクト検索一覧更新画面')
    await expect(page.getByRole('link', { name: '入力へ戻る' })).toHaveCount(2)
    await expect(page.getByRole('button', { name: '確定' })).toHaveCount(2)
    await expect(page.locator('table tbody tr').nth(1).locator('td').nth(3)).toHaveText(
      /\d{4}\/\d{2}\/\d{2}/,
    )
  })

  test('project complete pages match Java titles and messages', async ({ page }) => {
    await loginToNext(page)

    const expectations = [
      {
        path: '/projects/new/complete',
        title: 'プロジェクト登録完了画面',
        message: '登録が完了しました。',
      },
      {
        path: '/projects/1/edit/complete',
        title: 'プロジェクト変更完了画面',
        message: 'プロジェクトの更新が完了しました。',
      },
      {
        path: '/projects/delete-complete',
        title: 'プロジェクト削除完了画面',
        message: 'プロジェクトの削除が完了しました。',
      },
      {
        path: '/projects/bulk/complete',
        title: 'プロジェクト一覧更新完了画面',
        message: 'プロジェクトの更新が完了しました。',
      },
    ] as const

    for (const entry of expectations) {
      await page.goto(entry.path)
      await page.waitForLoadState('networkidle')
      await expect(page).toHaveTitle(entry.title)
      await expect(page.locator('.page-title')).toHaveText(entry.title)
      await expect(page.locator('.message-area')).toContainText(entry.message)
      await expect(page.getByRole('link', { name: '次へ' })).toHaveCount(2)
    }
  })

  test('project upload document title matches Java', async ({ page }) => {
    await loginToNext(page)
    await page.goto('/projects/upload')
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveTitle('プロジェクト一括登録画面')
  })
})
