import { describe, expect, it } from 'vitest'
import { apiProjectBulkFormSchema, apiProjectBulkItemSchema } from './project-bulk'

describe('apiProjectBulkItemSchema', () => {
  it('parses a valid bulk edit row', () => {
    expect(
      apiProjectBulkItemSchema.parse({
        projectId: '1',
        projectName: '一括更新案件',
        projectType: 'development',
        projectStartDate: '2026-04-01',
        projectEndDate: '2026-04-30',
      }),
    ).toEqual({
      projectId: '1',
      projectName: '一括更新案件',
      projectType: 'development',
      projectStartDate: '2026-04-01',
      projectEndDate: '2026-04-30',
    })
  })

  it('rejects a blank project name', () => {
    const result = apiProjectBulkItemSchema.safeParse({
      projectId: '1',
      projectName: '',
      projectType: 'maintenance',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('プロジェクト名を入力してください。')
  })
})

describe('apiProjectBulkFormSchema', () => {
  it('parses a list of bulk edit rows', () => {
    expect(
      apiProjectBulkFormSchema.parse({
        projectList: [
          {
            projectId: '1',
            projectName: '案件A',
            projectType: 'development',
          },
          {
            projectId: '2',
            projectName: '案件B',
            projectType: 'maintenance',
          },
        ],
      }),
    ).toEqual({
      projectList: [
        {
          projectId: '1',
          projectName: '案件A',
          projectType: 'development',
        },
        {
          projectId: '2',
          projectName: '案件B',
          projectType: 'maintenance',
        },
      ],
    })
  })
})
