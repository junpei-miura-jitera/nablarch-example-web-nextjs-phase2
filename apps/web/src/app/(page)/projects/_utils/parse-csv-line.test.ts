import { describe, it, expect } from 'vitest'
import { parseCsvLine } from './parse-csv-line'

describe('parseCsvLine', () => {
  it('parses simple CSV', () => {
    expect(parseCsvLine('a,b,c')).toEqual(['a', 'b', 'c'])
  })

  it('handles quoted fields', () => {
    expect(parseCsvLine('"hello, world",b')).toEqual(['hello, world', 'b'])
  })

  it('handles escaped quotes', () => {
    expect(parseCsvLine('"say ""hi""",b')).toEqual(['say "hi"', 'b'])
  })

  it('trims whitespace', () => {
    expect(parseCsvLine(' a , b , c ')).toEqual(['a', 'b', 'c'])
  })

  it('handles empty fields', () => {
    expect(parseCsvLine(',,')).toEqual(['', '', ''])
  })
})
