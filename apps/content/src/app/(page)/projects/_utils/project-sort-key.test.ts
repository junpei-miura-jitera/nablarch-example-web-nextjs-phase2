import { describe, expect, it } from 'vitest'
import { PROJECT_SORT_KEY } from './project-sort-key'

describe('PROJECT_SORT_KEY', () => {
  it('exposes the supported sort labels', () => {
    expect(PROJECT_SORT_KEY).toEqual({
      id: 'プロジェクトＩＤ',
      name: 'プロジェクト名',
      startDate: 'プロジェクト開始日',
      endDate: 'プロジェクト終了日',
    })
  })
})
