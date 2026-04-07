import { describe, expect, it } from 'vitest'
import { apiClientDtoSchema, apiIndustryDtoSchema } from './client'

describe('apiClientDtoSchema', () => {
  it('parses a client dto response', () => {
    expect(
      apiClientDtoSchema.parse({
        clientId: 1,
        clientName: '株式会社テスト',
        industryCode: 'it',
        industryName: '情報通信',
      }),
    ).toEqual({
      clientId: 1,
      clientName: '株式会社テスト',
      industryCode: 'it',
      industryName: '情報通信',
    })
  })

  it('rejects missing required fields', () => {
    expect(apiClientDtoSchema.safeParse({ clientId: 1 }).success).toBe(false)
  })
})

describe('apiIndustryDtoSchema', () => {
  it('parses an industry dto response', () => {
    expect(
      apiIndustryDtoSchema.parse({
        industryCode: 'finance',
        industryName: '金融',
      }),
    ).toEqual({
      industryCode: 'finance',
      industryName: '金融',
    })
  })
})
