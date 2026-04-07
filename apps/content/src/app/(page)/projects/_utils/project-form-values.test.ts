import { describe, expect, it, vi } from 'vitest'
import type { ApiProjectDto } from ':/app/(page)/projects/_utils/api/project'
import {
  applyProjectFormValues,
  buildProjectFormValuesFromProject,
  validateAmountDigits,
  validateProjectPeriod,
} from './project-form-values'

describe('applyProjectFormValues', () => {
  it('applies only present values and formats date fields', () => {
    const setValue = vi.fn()

    applyProjectFormValues(setValue as never, {
      projectName: 'Alpha',
      projectStartDate: '2024-1-2',
      projectEndDate: null,
      clientId: 99,
      sales: 1200,
    })

    expect(setValue.mock.calls).toEqual([
      ['projectName', 'Alpha'],
      ['clientId', '99'],
      ['projectStartDate', '2024/01/02'],
      ['sales', '1200'],
    ])
  })
})

describe('buildProjectFormValuesFromProject', () => {
  it('builds form-friendly strings and fills default enum values', () => {
    const project: ApiProjectDto = {
      projectName: 'Alpha',
      clientId: 77,
      projectStartDate: '2024-4-5',
      projectEndDate: '2024/6/7',
      sales: 1000,
      costOfGoodsSold: 400,
    }

    expect(buildProjectFormValuesFromProject(project)).toEqual({
      projectName: 'Alpha',
      projectType: 'development',
      projectClass: 'ss',
      projectManager: '',
      projectLeader: '',
      clientId: '77',
      clientName: '',
      projectStartDate: '2024/04/05',
      projectEndDate: '2024/06/07',
      note: '',
      sales: '1000',
      costOfGoodsSold: '400',
      sga: '',
      allocationOfCorpExpenses: '',
    })
  })
})

describe('validateProjectPeriod', () => {
  it('returns true when either side is missing or the period is valid', () => {
    expect(validateProjectPeriod(undefined, '2024/01/01')).toBe(true)
    expect(validateProjectPeriod('2024/01/01', undefined)).toBe(true)
    expect(validateProjectPeriod('2024/01/01', '2024/01/01')).toBe(true)
    expect(validateProjectPeriod('2024/01/01', '2024/01/02')).toBe(true)
  })

  it('returns a validation message when the end date is earlier than the start date', () => {
    expect(validateProjectPeriod('2024/01/02', '2024/01/01')).toBe(
      'プロジェクト終了日はプロジェクト開始日より後の日付を入力して下さい。',
    )
  })
})

describe('validateAmountDigits', () => {
  it('allows blank values and values up to 9 digits', () => {
    expect(validateAmountDigits(undefined)).toBe(true)
    expect(validateAmountDigits('')).toBe(true)
    expect(validateAmountDigits('123456789')).toBe(true)
    expect(validateAmountDigits('-123456789')).toBe(true)
  })

  it('rejects values longer than 9 digits excluding the minus sign', () => {
    expect(validateAmountDigits('1234567890')).toBe('9桁以内で入力してください')
    expect(validateAmountDigits('-1234567890')).toBe('9桁以内で入力してください')
  })
})
