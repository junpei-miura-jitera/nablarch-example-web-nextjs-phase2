import type { MockProjectRecord } from './mock-project-runtime'

export type MockProjectSearchParams = {
  pageNumber?: string
  clientId?: string
  clientName?: string
  projectName?: string
  projectType?: string
  projectClass?: string[]
  projectStartDateBegin?: string
  projectStartDateEnd?: string
  projectEndDateBegin?: string
  projectEndDateEnd?: string
  sortKey?: string
  sortDir?: string
}

export function createDefaultMockProjectSearchParams(
  overrides: Partial<MockProjectSearchParams> = {},
): Required<Pick<MockProjectSearchParams, 'pageNumber' | 'sortKey' | 'sortDir'>> &
  MockProjectSearchParams {
  return {
    pageNumber: '1',
    sortKey: 'id',
    sortDir: 'asc',
    ...overrides,
  }
}

export function extractMockProjectSearchParams(url: URL): MockProjectSearchParams {
  const get = (key: string) => url.searchParams.get(key) ?? undefined
  const getAll = (key: string) => {
    const values = url.searchParams.getAll(key)
    return values.length > 0 ? values : undefined
  }

  return {
    pageNumber: get('pageNumber'),
    clientId: get('clientId'),
    clientName: get('clientName'),
    projectName: get('projectName'),
    projectType: get('projectType'),
    projectClass: getAll('projectClass'),
    projectStartDateBegin: get('projectStartDateBegin'),
    projectStartDateEnd: get('projectStartDateEnd'),
    projectEndDateBegin: get('projectEndDateBegin'),
    projectEndDateEnd: get('projectEndDateEnd'),
    sortKey: get('sortKey'),
    sortDir: get('sortDir'),
  }
}

function sortKeyToProperty(sortKey: string | undefined): keyof MockProjectRecord {
  switch (sortKey) {
    case 'id':
      return 'projectId'
    case 'name':
      return 'projectName'
    case 'startDate':
      return 'projectStartDate'
    case 'endDate':
      return 'projectEndDate'
    default:
      return 'projectId'
  }
}

export function searchMockProjects(
  projects: readonly MockProjectRecord[],
  currentUserId: number,
  params: MockProjectSearchParams,
): MockProjectRecord[] {
  let result = projects.filter((project) => project.userId === currentUserId)

  if (params.projectName) {
    const projectName = params.projectName
    result = result.filter((project) => project.projectName.includes(projectName))
  }
  if (params.projectType) {
    result = result.filter((project) => project.projectType === params.projectType)
  }
  if (params.projectClass && params.projectClass.length > 0) {
    const projectClass = params.projectClass
    result = result.filter((project) => projectClass.includes(project.projectClass))
  }
  if (params.clientId) {
    const clientId = Number(params.clientId)
    if (!Number.isNaN(clientId)) {
      result = result.filter((project) => project.clientId === clientId)
    }
  }
  if (params.clientName) {
    const clientName = params.clientName
    result = result.filter((project) => project.clientName.includes(clientName))
  }
  if (params.projectStartDateBegin) {
    const projectStartDateBegin = params.projectStartDateBegin
    result = result.filter((project) => project.projectStartDate >= projectStartDateBegin)
  }
  if (params.projectStartDateEnd) {
    const projectStartDateEnd = params.projectStartDateEnd
    result = result.filter((project) => project.projectStartDate <= projectStartDateEnd)
  }
  if (params.projectEndDateBegin) {
    const projectEndDateBegin = params.projectEndDateBegin
    result = result.filter((project) => project.projectEndDate >= projectEndDateBegin)
  }
  if (params.projectEndDateEnd) {
    const projectEndDateEnd = params.projectEndDateEnd
    result = result.filter((project) => project.projectEndDate <= projectEndDateEnd)
  }

  const property = sortKeyToProperty(params.sortKey)
  const direction = params.sortDir === 'desc' ? -1 : 1
  result.sort((left, right) => {
    const leftValue = left[property]
    const rightValue = right[property]
    if (leftValue === rightValue) {
      return (left.projectId - right.projectId) * direction
    }
    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return (leftValue - rightValue) * direction
    }
    return String(leftValue).localeCompare(String(rightValue), 'ja') * direction
  })

  return result
}

export const createDefaultSearchParams = createDefaultMockProjectSearchParams
export const extractSearchParams = extractMockProjectSearchParams
export const searchProjects = searchMockProjects
