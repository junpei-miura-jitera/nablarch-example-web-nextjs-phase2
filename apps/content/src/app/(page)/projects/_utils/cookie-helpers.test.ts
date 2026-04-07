/**
 * Cookie ヘルパーのユニットテスト。
 *
 * Cookie-helpers.ts はブラウザの Cookie を直接操作する。テストでは jsdom の document.cookie を使って確認する。
 *
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest'

beforeEach(() => {
  document.cookie = 'project_form_data=; path=/; max-age=0; samesite=strict'
})

describe('cookie-helpers', () => {
  it('saves and loads form data', async () => {
    const { saveProjectFormToCookie, loadProjectFormFromCookie } = await import('./cookie-helpers')
    const data = { projectName: 'テスト', sales: 1000 }
    await saveProjectFormToCookie(data)
    const loaded = await loadProjectFormFromCookie()
    expect(loaded).toEqual(data)
  })

  it('returns null when no cookie', async () => {
    const { loadProjectFormFromCookie } = await import('./cookie-helpers')
    const loaded = await loadProjectFormFromCookie()
    expect(loaded).toBeNull()
  })

  it('clears cookie', async () => {
    const { saveProjectFormToCookie, clearProjectFormCookie, loadProjectFormFromCookie } =
      await import('./cookie-helpers')
    await saveProjectFormToCookie({ test: true })
    await clearProjectFormCookie()
    const loaded = await loadProjectFormFromCookie()
    expect(loaded).toBeNull()
  })
})
