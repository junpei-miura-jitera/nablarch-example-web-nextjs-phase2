import type { UseFormSetValue } from 'react-hook-form'
import type { ApiProjectDto, ApiProjectFormValues } from ':/app/(page)/projects/_utils/api/project'
import { formatDate, normalizeDateForApi } from './format-date'

export const PROJECT_FORM_FIELD_KEYS: (keyof ApiProjectFormValues)[] = [
  'projectName',
  'projectType',
  'projectClass',
  'projectManager',
  'projectLeader',
  'clientId',
  'clientName',
  'projectStartDate',
  'projectEndDate',
  'note',
  'sales',
  'costOfGoodsSold',
  'sga',
  'allocationOfCorpExpenses',
]

export function applyProjectFormValues(
  setValue: UseFormSetValue<ApiProjectFormValues>,
  values: Record<string, unknown>,
) {
  for (const key of PROJECT_FORM_FIELD_KEYS) {
    const rawValue = values[key]
    if (rawValue == null) continue
    const value =
      key === 'projectStartDate' || key === 'projectEndDate'
        ? formatDate(String(rawValue))
        : String(rawValue)
    setValue(key, value)
  }
}

export function buildProjectFormValuesFromProject(project: ApiProjectDto): ApiProjectFormValues {
  return {
    projectName: project.projectName ?? '',
    projectType: project.projectType ?? 'development',
    projectClass: project.projectClass ?? 'ss',
    projectManager: project.projectManager ?? '',
    projectLeader: project.projectLeader ?? '',
    clientId: String(project.clientId ?? ''),
    clientName: project.clientName ?? '',
    projectStartDate: formatDate(project.projectStartDate),
    projectEndDate: formatDate(project.projectEndDate),
    note: project.note ?? '',
    sales: project.sales != null ? String(project.sales) : '',
    costOfGoodsSold: project.costOfGoodsSold != null ? String(project.costOfGoodsSold) : '',
    sga: project.sga != null ? String(project.sga) : '',
    allocationOfCorpExpenses:
      project.allocationOfCorpExpenses != null ? String(project.allocationOfCorpExpenses) : '',
  }
}

export function validateProjectPeriod(
  projectStartDate: string | undefined,
  projectEndDate: string | undefined,
) {
  const normalizedStart = normalizeDateForApi(projectStartDate)
  const normalizedEnd = normalizeDateForApi(projectEndDate)
  if (!normalizedStart || !normalizedEnd) return true
  if (normalizedEnd < normalizedStart) {
    return 'プロジェクト終了日はプロジェクト開始日より後の日付を入力して下さい。'
  }
  return true
}

export function validateAmountDigits(value: string | undefined) {
  if (!value) return true
  if (String(value).replace(/^-/, '').length > 9) return '9桁以内で入力してください'
  return true
}
