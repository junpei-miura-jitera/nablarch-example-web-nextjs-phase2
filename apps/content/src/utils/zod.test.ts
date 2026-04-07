import { afterEach, describe, expect, it } from 'vitest'
import { z } from 'zod'
import { setupZodJaLocale } from './zod'

afterEach(() => {
  z.config(z.locales.en())
})

describe('setupZodJaLocale', () => {
  it('configures the Japanese Zod locale', () => {
    setupZodJaLocale()

    expect(z.number().safeParse('x').error?.issues[0]?.message).toBe(
      '無効な入力: 数値が期待されましたが、stringが入力されました',
    )
  })
})
