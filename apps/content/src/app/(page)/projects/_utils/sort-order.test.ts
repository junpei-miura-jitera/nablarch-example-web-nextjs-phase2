import { describe, expect, it } from 'vitest'
import { SORT_ORDER } from './sort-order'

describe('SORT_ORDER', () => {
  it('exposes the supported sort directions', () => {
    expect(SORT_ORDER).toEqual({
      asc: '昇順',
      desc: '降順',
    })
  })
})
