import { describe, expect, it } from 'vitest'
import { PROJECT_TYPE } from './project-type'

describe('PROJECT_TYPE', () => {
  it('matches the Java-compatible project type labels', () => {
    expect(PROJECT_TYPE).toEqual({
      development: '新規開発PJ',
      maintenance: '保守PJ',
    })
  })
})
