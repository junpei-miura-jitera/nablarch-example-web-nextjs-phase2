import type { ApiProjectFormValues } from ':/app/(page)/projects/_utils/api/project'
import type { ApiProjectBulkItemValues } from ':/app/(page)/projects/_utils/api/project-bulk'
import { normalizeDateForApi } from ':/app/(page)/projects/_utils/format-date'
import { clientFixtures } from './mock-client-runtime'
import type { MockProjectRecord } from './mock-project-runtime'

type ProjectIdentity = {
  projectId: number
  userId: number
  version: number
}

function resolveClientName(clientId: number): string {
  return clientFixtures.find((client) => client.clientId === clientId)?.clientName ?? ''
}

export function formToMockProjectRecord(
  form: ApiProjectFormValues,
  identity: ProjectIdentity,
): MockProjectRecord {
  const clientId = Number(form.clientId)
  return {
    projectId: identity.projectId,
    projectName: form.projectName,
    projectType: form.projectType as MockProjectRecord['projectType'],
    projectClass: form.projectClass as MockProjectRecord['projectClass'],
    projectStartDate: normalizeDateForApi(form.projectStartDate),
    projectEndDate: normalizeDateForApi(form.projectEndDate),
    clientId,
    clientName: form.clientName ?? resolveClientName(clientId),
    projectManager: form.projectManager ?? '',
    projectLeader: form.projectLeader ?? '',
    userId: identity.userId,
    note: form.note ?? '',
    sales: form.sales ? Number(form.sales) : 0,
    costOfGoodsSold: form.costOfGoodsSold ? Number(form.costOfGoodsSold) : 0,
    sga: form.sga ? Number(form.sga) : 0,
    allocationOfCorpExpenses: form.allocationOfCorpExpenses
      ? Number(form.allocationOfCorpExpenses)
      : 0,
    version: identity.version,
  }
}

export function createProject(
  projectId: number,
  currentUserId: number,
  form: ApiProjectFormValues,
): MockProjectRecord {
  return formToMockProjectRecord(form, {
    projectId,
    userId: currentUserId,
    version: 1,
  })
}

export function updateProject(
  existingProject: MockProjectRecord,
  form: ApiProjectFormValues,
): MockProjectRecord {
  return formToMockProjectRecord(form, {
    projectId: existingProject.projectId,
    userId: existingProject.userId,
    version: (existingProject.version ?? 0) + 1,
  })
}

export function bulkUpdateProjects(
  projects: readonly MockProjectRecord[],
  projectList: readonly ApiProjectBulkItemValues[],
): {
  failed: number
  projects: MockProjectRecord[]
  updated: number
} {
  let nextProjects = [...projects]
  let updated = 0
  let failed = 0

  for (const item of projectList) {
    const projectId = Number(item.projectId)
    const index = nextProjects.findIndex((project) => project.projectId === projectId)
    if (index === -1) {
      failed++
      continue
    }

    const existing = nextProjects[index]
    const merged: MockProjectRecord = {
      ...existing,
      projectName: item.projectName,
      projectType: item.projectType as MockProjectRecord['projectType'],
      projectStartDate: item.projectStartDate
        ? normalizeDateForApi(item.projectStartDate)
        : existing.projectStartDate,
      projectEndDate: item.projectEndDate
        ? normalizeDateForApi(item.projectEndDate)
        : existing.projectEndDate,
      version: (existing.version ?? 0) + 1,
    }

    nextProjects = nextProjects.map((project, currentIndex) =>
      currentIndex === index ? merged : project,
    )
    updated++
  }

  return {
    failed,
    projects: nextProjects,
    updated,
  }
}

export function uploadProjects(
  nextProjectId: number,
  currentUserId: number,
  rows: readonly ApiProjectFormValues[],
): {
  created: number
  createdProjects: MockProjectRecord[]
  nextProjectId: number
} {
  let created = 0
  let nextId = nextProjectId
  const createdProjects: MockProjectRecord[] = []

  for (const row of rows) {
    createdProjects.push(createProject(nextId, currentUserId, row))
    nextId += 1
    created++
  }

  return {
    created,
    createdProjects,
    nextProjectId: nextId,
  }
}
