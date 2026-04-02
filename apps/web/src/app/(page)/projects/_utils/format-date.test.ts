import { describe, expect, it } from 'vitest'
import { formatDate, normalizeDateForApi } from './format-date'

describe('formatDate', () => {
  it('formats zero-padded ISO dates to Java-style yyyy/MM/dd', () => {
    expect(formatDate('2015-04-09')).toBe('2015/04/09')
  })

  it('pads non-padded ISO dates to Java-style yyyy/MM/dd', () => {
    expect(formatDate('2015-4-9')).toBe('2015/04/09')
  })

  it('keeps slash dates in Java-style yyyy/MM/dd', () => {
    expect(formatDate('2015/4/9')).toBe('2015/04/09')
  })

  it('returns empty string for nullish values', () => {
    expect(formatDate(undefined)).toBe('')
    expect(formatDate(null)).toBe('')
    expect(formatDate('')).toBe('')
  })

  it('normalizes slash dates for API/storage', () => {
    expect(normalizeDateForApi('2015/4/9')).toBe('2015-04-09')
    expect(normalizeDateForApi('2015-4-9')).toBe('2015-04-09')
  })
})
