import { describe, expect, it } from 'vitest'
import { apiLoginFormSchema, apiLoginUserSchema } from './authentication'

describe('apiLoginFormSchema', () => {
  it('parses a login payload', () => {
    expect(
      apiLoginFormSchema.parse({
        loginId: '10000001',
        userPassword: 'pass123-',
      }),
    ).toEqual({
      loginId: '10000001',
      userPassword: 'pass123-',
    })
  })
})

describe('apiLoginUserSchema', () => {
  it('parses an authenticated user payload', () => {
    expect(
      apiLoginUserSchema.parse({
        userId: 10000001,
        kanjiName: '管理者ユーザ',
        admin: true,
        lastLoginDateTime: '2026-04-06T09:00:00',
      }),
    ).toEqual({
      userId: 10000001,
      kanjiName: '管理者ユーザ',
      admin: true,
      lastLoginDateTime: '2026-04-06T09:00:00',
    })
  })

  it('rejects invalid user payloads', () => {
    expect(apiLoginUserSchema.safeParse({ userId: '10000001' }).success).toBe(false)
  })
})
