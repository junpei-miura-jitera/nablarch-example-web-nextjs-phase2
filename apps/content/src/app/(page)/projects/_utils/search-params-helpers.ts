import type { ApiProjectSearchFormValues } from ':/app/(page)/projects/_utils/api/project'

export type ProjectSearchParamsInput = Record<string, string | string[] | undefined>

/**
 * SearchParams の値を string[] に正規化する
 */
export function toArray(value: string | string[] | undefined): string[] | undefined {
  if (value == null) return undefined
  return Array.isArray(value) ? value : [value]
}

export function toSingle(value: string | string[] | undefined): string | undefined {
  if (value == null) return undefined
  return Array.isArray(value) ? value[0] : value
}

export function normalizeProjectSearchParams(
  params: ProjectSearchParamsInput,
): ApiProjectSearchFormValues {
  return {
    pageNumber: toSingle(params.pageNumber),
    clientId: toSingle(params.clientId),
    clientName: toSingle(params.clientName),
    projectName: toSingle(params.projectName),
    projectType: toSingle(params.projectType),
    projectClass: toArray(params.projectClass),
    projectStartDateBegin: toSingle(params.projectStartDateBegin),
    projectStartDateEnd: toSingle(params.projectStartDateEnd),
    projectEndDateBegin: toSingle(params.projectEndDateBegin),
    projectEndDateEnd: toSingle(params.projectEndDateEnd),
    sortKey: toSingle(params.sortKey),
    sortDir: toSingle(params.sortDir),
  }
}

export function buildProjectSearchParams(
  params: ProjectSearchParamsInput,
  overrides: ProjectSearchParamsInput = {},
) {
  const normalized = normalizeProjectSearchParams({
    ...params,
    ...overrides,
  })
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(normalized)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, item)
      }
      continue
    }

    if (value != null && value !== '') {
      searchParams.set(key, value)
    }
  }

  return searchParams
}

export function searchParamsToRecord(searchParams: Pick<URLSearchParams, 'entries'>) {
  const record: ProjectSearchParamsInput = {}

  for (const [key, value] of searchParams.entries()) {
    const currentValue = record[key]
    if (currentValue == null) {
      record[key] = value
      continue
    }

    record[key] = Array.isArray(currentValue) ? [...currentValue, value] : [currentValue, value]
  }

  return record
}

/**
 * SideMenu.js と同様の日付パラメータを計算して /projects に遷移するための URL を生成するヘルパー。
 *
 * Sidemenu.jsp では期間リンクの href にフォームの既存検索条件（clientId, clientName, projectName, projectType,
 * projectClass, sortKey, sortDir）をすべて含めたうえで sideMenu.js が日付パラメータを追記する。この関数は同等の振る舞いを再現する。
 *
 * @see _references/nablarch-example-web/src/main/webapp/javascripts/sideMenu.js
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/common/sidemenu.jsp
 */
export function buildPeriodSearchUrl(
  type: 'startThisYear' | 'endThisYear' | 'endLastYear',
  formRef: React.RefObject<HTMLFormElement | null>,
  basePath: `/${string}`,
  currentSearchParams: URLSearchParams,
): string {
  const thisYear = new Date().getFullYear()
  const thisYearStartDate = `${thisYear}0101`
  const thisYearEndDate = `${thisYear}1231`
  const lastYearEndDate = `${thisYear - 1}1231`

  const params = new URLSearchParams()

  // フォームの現在値を引き継ぐ（sidemenu.jsp の <c:param> に対応）
  if (formRef.current) {
    const formData = new FormData(formRef.current)

    const carryOverKeys = [
      'clientId',
      'clientName',
      'projectName',
      'projectType',
      'sortKey',
      'sortDir',
    ] as const

    for (const key of carryOverKeys) {
      const value = formData.get(key)
      if (typeof value === 'string' && value !== '') {
        params.set(key, value)
      } else {
        // フォームに input がないキー（projectType 等）は searchParams から引き継ぐ
        const fallback = currentSearchParams.get(key)
        if (fallback) {
          params.set(key, fallback)
        }
      }
    }

    // projectClass は複数値
    const projectClassValues = formData.getAll('projectClass')
    for (const projectClassValue of projectClassValues) {
      if (typeof projectClassValue === 'string' && projectClassValue !== '') {
        params.append('projectClass', projectClassValue)
      }
    }
  }

  // ページ番号はリセット
  params.set('pageNumber', '1')

  // 日付パラメータを追加
  if (type === 'startThisYear') {
    params.set('projectStartDateBegin', thisYearStartDate)
    params.set('projectStartDateEnd', thisYearEndDate)
  } else if (type === 'endThisYear') {
    params.set('projectEndDateBegin', thisYearStartDate)
    params.set('projectEndDateEnd', thisYearEndDate)
  } else if (type === 'endLastYear') {
    params.set('projectEndDateEnd', lastYearEndDate)
  }

  return `${basePath}?${params.toString()}`
}

export function buildPageUrl(
  basePath: `/${string}`,
  params: ProjectSearchParamsInput,
  page: number,
): string {
  const searchParams = buildProjectSearchParams(params, {
    pageNumber: String(page),
  })
  return `${basePath}?${searchParams.toString()}`
}

export function updateProjectSearchUrl(
  basePath: `/${string}`,
  currentSearchParams: Pick<URLSearchParams, 'entries'>,
  updates: ProjectSearchParamsInput,
) {
  const searchParams = buildProjectSearchParams(searchParamsToRecord(currentSearchParams), updates)
  return `${basePath}?${searchParams.toString()}`
}
