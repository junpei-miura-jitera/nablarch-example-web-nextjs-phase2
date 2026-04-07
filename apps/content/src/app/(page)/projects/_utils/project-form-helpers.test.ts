import { describe, expect, it } from 'vitest'
import type { ApiProjectFormValues } from ':/app/(page)/projects/_utils/api/project'
import { transformProjectFormData } from './project-form-helpers'

describe('transformProjectFormData', () => {
  it('normalizes dates and converts numeric strings for API submission', () => {
    const input: ApiProjectFormValues = {
      projectName: 'Alpha',
      projectType: 'development',
      projectClass: 'a',
      projectManager: 'Manager',
      projectLeader: 'Leader',
      clientId: '12',
      clientName: 'Client',
      projectStartDate: '2024/1/2',
      projectEndDate: '2024-3-4',
      note: 'note',
      sales: '1000',
      costOfGoodsSold: '500',
      sga: '0',
      allocationOfCorpExpenses: '',
    }

    expect(transformProjectFormData(input)).toEqual({
      ...input,
      clientId: 12,
      projectStartDate: '2024-01-02',
      projectEndDate: '2024-03-04',
      sales: 1000,
      costOfGoodsSold: 500,
      sga: 0,
      allocationOfCorpExpenses: null,
    })
  })

  it('treats blank numeric and date fields as null/empty values', () => {
    const input: ApiProjectFormValues = {
      projectName: 'Blank fields',
      projectType: 'maintenance',
      projectClass: 'ss',
      projectManager: '',
      projectLeader: '',
      clientId: '',
      clientName: '',
      projectStartDate: '',
      projectEndDate: undefined,
      note: '',
      sales: '',
      costOfGoodsSold: '',
      sga: '',
      allocationOfCorpExpenses: '',
    }

    expect(transformProjectFormData(input)).toEqual({
      ...input,
      clientId: null,
      projectStartDate: '',
      projectEndDate: '',
      sales: null,
      costOfGoodsSold: null,
      sga: null,
      allocationOfCorpExpenses: null,
    })
  })
})
