import { describe, expect, it } from 'vitest'
import { apiProjectBulkFormSchema } from './api/project-bulk'
import { bulkFormSchema } from './project-types'

describe('bulkFormSchema', () => {
  it('re-exports the bulk form schema used by the page flow', () => {
    expect(bulkFormSchema).toBe(apiProjectBulkFormSchema)
    expect(
      bulkFormSchema.parse({
        projectList: [
          {
            projectId: '1',
            projectName: 'プロジェクトA',
            projectType: 'development',
          },
        ],
      }),
    ).toEqual({
      projectList: [
        {
          projectId: '1',
          projectName: 'プロジェクトA',
          projectType: 'development',
        },
      ],
    })
  })
})
