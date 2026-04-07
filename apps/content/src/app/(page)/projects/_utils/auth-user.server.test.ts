import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock(':/bases/env.server', () => ({
  API_BASE_URL: 'http://mock.example.test',
}))

describe('getAuthUserServer', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('returns the parsed authenticated user when the response is valid', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        userId: 10000001,
        kanjiName: '管理者ユーザ',
        admin: true,
        lastLoginDateTime: '2026-04-06T09:00:00',
      }),
    } as Response)

    const { getAuthUserServer } = await import('./auth-user.server')

    await expect(getAuthUserServer()).resolves.toEqual({
      userId: 10000001,
      kanjiName: '管理者ユーザ',
      admin: true,
      lastLoginDateTime: '2026-04-06T09:00:00',
    })
    expect(fetch).toHaveBeenCalledWith('http://mock.example.test/api/authentication/index', {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
  })

  it('returns null when the response status is not ok', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response)

    const { getAuthUserServer } = await import('./auth-user.server')

    await expect(getAuthUserServer()).resolves.toBeNull()
  })

  it('returns null when the payload does not match the schema', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ userId: 'invalid' }),
    } as Response)

    const { getAuthUserServer } = await import('./auth-user.server')

    await expect(getAuthUserServer()).resolves.toBeNull()
  })
})
