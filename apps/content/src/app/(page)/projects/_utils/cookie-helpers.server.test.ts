import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { cookiesMock } = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: cookiesMock,
}))

describe('cookie-helpers.server', () => {
  beforeEach(() => {
    vi.resetModules()
    cookiesMock.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('loads form data from the server cookie store', async () => {
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue({
        value: encodeURIComponent(JSON.stringify({ projectName: 'テスト案件', sales: 1000 })),
      }),
    })

    const { loadProjectFormFromCookieServer } = await import('./cookie-helpers.server')

    await expect(loadProjectFormFromCookieServer()).resolves.toEqual({
      projectName: 'テスト案件',
      sales: 1000,
    })
  })

  it('returns null when the cookie is missing or malformed', async () => {
    const { loadProjectFormFromCookieServer } = await import('./cookie-helpers.server')

    cookiesMock.mockResolvedValueOnce({ get: vi.fn().mockReturnValue(undefined) })
    await expect(loadProjectFormFromCookieServer()).resolves.toBeNull()

    cookiesMock.mockResolvedValueOnce({
      get: vi.fn().mockReturnValue({ value: '%E0%A4%A' }),
    })
    await expect(loadProjectFormFromCookieServer()).resolves.toBeNull()
  })

  it('deletes the saved form cookie', async () => {
    const deleteMock = vi.fn()
    cookiesMock.mockResolvedValue({ delete: deleteMock })

    const { clearProjectFormCookieServer } = await import('./cookie-helpers.server')
    await clearProjectFormCookieServer()

    expect(deleteMock).toHaveBeenCalledWith('project_form_data')
  })
})
