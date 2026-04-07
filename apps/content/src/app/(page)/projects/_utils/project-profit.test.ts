import { describe, it, expect } from 'vitest'
import { calculateProjectProfit, formatMoney, formatRate } from './project-profit'

describe('calculateProjectProfit', () => {
  it('returns all null when sales is null', () => {
    const result = calculateProjectProfit({
      sales: null,
      costOfGoodsSold: 100,
      sga: 50,
      allocationOfCorpExpenses: 30,
    })
    expect(result.grossProfit).toBeNull()
    expect(result.operatingProfit).toBeNull()
  })

  it('calculates gross profit correctly', () => {
    const result = calculateProjectProfit({
      sales: 1000,
      costOfGoodsSold: 600,
      sga: null,
      allocationOfCorpExpenses: null,
    })
    expect(result.grossProfit).toBe(400)
    expect(result.profitBeforeAllocation).toBeNull()
    expect(result.operatingProfit).toBeNull()
  })

  it('calculates all profits when all values provided', () => {
    const result = calculateProjectProfit({
      sales: 1000,
      costOfGoodsSold: 600,
      sga: 100,
      allocationOfCorpExpenses: 50,
    })
    expect(result.grossProfit).toBe(400)
    expect(result.profitBeforeAllocation).toBe(300)
    expect(result.profitRateBeforeAllocation).toBe(0.3)
    expect(result.operatingProfit).toBe(250)
    expect(result.operatingProfitRate).toBe(0.25)
  })

  it('truncates rate at 3rd decimal place (ROUND_DOWN)', () => {
    const result = calculateProjectProfit({
      sales: 1000,
      costOfGoodsSold: 600,
      sga: 67,
      allocationOfCorpExpenses: 0,
    })
    // profitBeforeAllocation = 333, rate = 333/1000 = 0.333
    expect(result.profitRateBeforeAllocation).toBe(0.333)
  })

  it('truncates toward zero for negative rates (matches Java RoundingMode.DOWN)', () => {
    const result = calculateProjectProfit({
      sales: 1000,
      costOfGoodsSold: 1100,
      sga: 37,
      allocationOfCorpExpenses: 0,
    })
    // profitBeforeAllocation = 1000 - 1100 - 37 = -137, rate = -137/1000 = -0.137
    // Math.trunc(-0.137 * 1000) / 1000 = Math.trunc(-137) / 1000 = -0.137
    // (Math.floor would give -0.138 which is wrong)
    expect(result.profitRateBeforeAllocation).toBe(-0.137)
  })

  it('returns zero rate when sales is zero (matches Java BigDecimal.ZERO)', () => {
    const result = calculateProjectProfit({
      sales: 0,
      costOfGoodsSold: 0,
      sga: 0,
      allocationOfCorpExpenses: 0,
    })
    expect(result.grossProfit).toBe(0)
    // Java: ArithmeticException catch → BigDecimal.ZERO.setScale(3) = 0.000
    expect(result.profitRateBeforeAllocation).toBe(0)
    expect(result.operatingProfitRate).toBe(0)
  })
})

describe('formatMoney', () => {
  it('formats with Japanese locale', () => {
    expect(formatMoney(1234567)).toBe('1,234,567')
  })

  it('returns empty string for null', () => {
    expect(formatMoney(null)).toBe('')
  })
})

describe('formatRate', () => {
  it('formats as percentage with 1 decimal', () => {
    expect(formatRate(0.123)).toBe('12.3 %')
  })

  it('returns empty string for null', () => {
    expect(formatRate(null)).toBe('')
  })

  it('formats zero rate', () => {
    expect(formatRate(0)).toBe('0 %')
  })

  it('avoids floating-point drift with integer truncation', () => {
    // 0.1 + 0.2 = 0.30000000000000004 in IEEE 754
    // Math.trunc(0.30000000000000004 * 1000) / 10 = 30
    expect(formatRate(0.1 + 0.2)).toBe('30 %')
  })
})
