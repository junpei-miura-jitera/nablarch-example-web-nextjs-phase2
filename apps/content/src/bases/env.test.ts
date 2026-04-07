import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const originalNodeEnv = process.env.NODE_ENV
const mutableEnv = process.env as Record<string, string | undefined>

describe('ENVIRONMENT', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    if (originalNodeEnv === undefined) {
      delete mutableEnv.NODE_ENV
    } else {
      mutableEnv.NODE_ENV = originalNodeEnv
    }
    vi.resetModules()
  })

  it('parses the current NODE_ENV value', async () => {
    mutableEnv.NODE_ENV = 'test'

    const { ENVIRONMENT } = await import('./env')

    expect(ENVIRONMENT).toBe('test')
  })

  it('throws when NODE_ENV is outside the supported values', async () => {
    mutableEnv.NODE_ENV = 'staging'

    await expect(import('./env')).rejects.toThrow()
  })
})
