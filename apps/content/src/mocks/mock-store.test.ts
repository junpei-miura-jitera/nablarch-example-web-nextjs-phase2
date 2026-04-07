import { beforeEach, describe, expect, it } from 'vitest'
import { authenticateMockUser } from './handlers/_services/mock-auth-session'
import { createProject, uploadProjects } from './handlers/_services/mock-project-command'
import { projectFixtures } from './handlers/_services/mock-project-runtime'
import {
  createDefaultMockProjectSearchParams,
  searchMockProjects,
} from './handlers/_services/mock-project-query'
import { mockStore } from './handlers/_services/mock-state'

describe('mock store project dataset', () => {
  beforeEach(() => {
    mockStore.reset()
  })

  it('matches the Java reference project counts by user', () => {
    const counts = projectFixtures.reduce<Record<number, number>>((acc, project) => {
      acc[project.userId] = (acc[project.userId] ?? 0) + 1
      return acc
    }, {})

    expect(counts[105]).toBe(191)
    expect(counts[106]).toBe(190)
    expect(counts[107]).toBe(190)
    expect(counts[108]).toBe(190)
  })

  it('returns 191 projects on the default admin search', () => {
    const result = searchMockProjects(
      mockStore.getProjects(),
      mockStore.getCurrentUserId(),
      createDefaultMockProjectSearchParams(),
    )
    expect(result).toHaveLength(191)
  })

  it('switches project visibility based on the logged-in user', () => {
    mockStore.setAuthenticatedUser(authenticateMockUser('10000002', 'pass123-'))
    const result = searchMockProjects(
      mockStore.getProjects(),
      mockStore.getCurrentUserId(),
      createDefaultMockProjectSearchParams(),
    )
    expect(result).toHaveLength(190)
    expect(new Set(result.map((project) => project.userId))).toEqual(new Set([106]))
  })

  it('inserts a created project into the in-memory repository', () => {
    const beforeCount = mockStore.getProjects().length
    const createdProject = createProject(mockStore.issueProjectId(), mockStore.getCurrentUserId(), {
      projectName: 'insert test project',
      projectType: 'development',
      projectClass: 'a',
      projectManager: 'manager',
      projectLeader: 'leader',
      clientId: '1',
      clientName: 'client',
      projectStartDate: '2026-04-01',
      projectEndDate: '2026-04-30',
      note: 'note',
      sales: '100',
      costOfGoodsSold: '10',
      sga: '5',
      allocationOfCorpExpenses: '3',
    })

    mockStore.insertProject(createdProject)

    expect(mockStore.getProjects()).toHaveLength(beforeCount + 1)
    expect(mockStore.getProject(createdProject.projectId)?.projectName).toBe('insert test project')
  })

  it('reserves sequential ids and inserts uploaded projects in order', () => {
    const beforeCount = mockStore.getProjects().length
    const result = uploadProjects(mockStore.reserveProjectIds(2), mockStore.getCurrentUserId(), [
      {
        projectName: 'upload test 1',
        projectType: 'development',
        projectClass: 'b',
        clientId: '1',
      },
      {
        projectName: 'upload test 2',
        projectType: 'maintenance',
        projectClass: 'c',
        clientId: '2',
      },
    ])

    mockStore.insertProjects(result.createdProjects)

    expect(mockStore.getProjects()).toHaveLength(beforeCount + 2)
    expect(result.createdProjects.map((project) => project.projectId)).toEqual([
      result.createdProjects[0].projectId,
      result.createdProjects[0].projectId + 1,
    ])
  })
})
