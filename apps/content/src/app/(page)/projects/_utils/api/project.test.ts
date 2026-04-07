import { describe, expect, it } from 'vitest'
import {
  apiProjectFormSchema,
  apiProjectSearchFormSchema,
  CLIENT_NAME_FULLWIDTH_MESSAGE,
  isFullWidthText,
  PROJECT_NAME_FULLWIDTH_MESSAGE,
  PROJECT_REQUIRED_MESSAGE,
  USER_NAME_FULLWIDTH_MESSAGE,
} from './project'

describe('isFullWidthText', () => {
  it('detects half-width characters mixed into text', () => {
    expect(isFullWidthText('全角テキスト')).toBe(true)
    expect(isFullWidthText('ABC')).toBe(false)
    expect(isFullWidthText('ﾊﾝｶｸ')).toBe(false)
  })
})

describe('apiProjectFormSchema', () => {
  it('parses a valid project form payload', () => {
    expect(
      apiProjectFormSchema.parse({
        projectName: '全角プロジェクト',
        projectType: 'development',
        projectClass: 'a',
        projectManager: '山田太郎',
        projectLeader: '佐藤花子',
        clientId: '1',
        clientName: '株式会社顧客',
        projectStartDate: '2026/04/01',
        projectEndDate: '2026/04/30',
        note: '備考',
        sales: '1000',
        costOfGoodsSold: '200',
        sga: '50',
        allocationOfCorpExpenses: '10',
      }),
    ).toMatchObject({
      projectName: '全角プロジェクト',
      clientId: '1',
      clientName: '株式会社顧客',
    })
  })

  it('rejects required blanks with the shared required message', () => {
    const result = apiProjectFormSchema.safeParse({
      projectName: ' ',
      projectType: 'development',
      projectClass: 'a',
      projectManager: '',
      projectLeader: '',
      clientId: ' ',
      clientName: '',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      PROJECT_REQUIRED_MESSAGE,
      PROJECT_REQUIRED_MESSAGE,
    ])
  })

  it('rejects half-width names for project, user, and client fields', () => {
    const result = apiProjectFormSchema.safeParse({
      projectName: 'Project Alpha',
      projectType: 'maintenance',
      projectClass: 'ss',
      projectManager: 'Manager',
      projectLeader: 'Leader',
      clientId: '1',
      clientName: 'Client',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      PROJECT_NAME_FULLWIDTH_MESSAGE,
      USER_NAME_FULLWIDTH_MESSAGE,
      USER_NAME_FULLWIDTH_MESSAGE,
      CLIENT_NAME_FULLWIDTH_MESSAGE,
    ])
  })
})

describe('apiProjectSearchFormSchema', () => {
  it('parses optional search params including repeated projectClass values', () => {
    expect(
      apiProjectSearchFormSchema.parse({
        pageNumber: '2',
        clientName: 'Acme',
        projectName: '全角案件',
        projectClass: ['a', 'b'],
        sortKey: 'name',
        sortDir: 'desc',
      }),
    ).toMatchObject({
      pageNumber: '2',
      clientName: 'Acme',
      projectName: '全角案件',
      projectClass: ['a', 'b'],
      sortKey: 'name',
      sortDir: 'desc',
    })
  })

  it('rejects half-width project names in search params', () => {
    const result = apiProjectSearchFormSchema.safeParse({ projectName: 'Project Alpha' })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe(PROJECT_NAME_FULLWIDTH_MESSAGE)
  })
})
