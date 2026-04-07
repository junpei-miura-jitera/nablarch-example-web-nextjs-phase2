import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const originalApiBaseUrl = process.env.API_BASE_URL

describe('API_BASE_URL', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    if (originalApiBaseUrl === undefined) {
      delete process.env.API_BASE_URL
    } else {
      process.env.API_BASE_URL = originalApiBaseUrl
    }
    vi.resetModules()
  })

  it('parses the configured API base url', async () => {
    process.env.API_BASE_URL = 'http://localhost:9090'

    const { API_BASE_URL } = await import('./env.server')

    expect(API_BASE_URL).toBe('http://localhost:9090')
  })

  it('falls back to the local mock server when API_BASE_URL is missing', async () => {
    delete process.env.API_BASE_URL

    const { API_BASE_URL } = await import('./env.server')

    expect(API_BASE_URL).toBe('http://localhost:9090')
  })
})
