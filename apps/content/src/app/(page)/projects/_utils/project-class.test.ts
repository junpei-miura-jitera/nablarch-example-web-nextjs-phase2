import { describe, expect, it } from 'vitest'
import { PROJECT_CLASS } from './project-class'

describe('PROJECT_CLASS', () => {
  it('matches the Java-compatible project class labels', () => {
    expect(PROJECT_CLASS).toEqual({
      ss: 'SS',
      s: 'S',
      a: 'A',
      b: 'B',
      c: 'C',
      d: 'D',
    })
  })
})
