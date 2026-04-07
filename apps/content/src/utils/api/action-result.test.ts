import { describe, expect, it } from 'vitest'
import { apiActionResultSchema } from './action-result'

describe('apiActionResultSchema', () => {
  it('parses action results with or without a message', () => {
    expect(apiActionResultSchema.parse({ ok: true })).toEqual({ ok: true })
    expect(apiActionResultSchema.parse({ ok: false, message: '保存に失敗しました。' })).toEqual({
      ok: false,
      message: '保存に失敗しました。',
    })
  })

  it('rejects non-boolean ok values', () => {
    expect(apiActionResultSchema.safeParse({ ok: 'true' }).success).toBe(false)
  })
})
