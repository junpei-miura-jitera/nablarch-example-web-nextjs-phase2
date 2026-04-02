import type { ApiLoginUser } from ':/shared/api/authentication'
import { defaultMockLoginUser } from './mock-authentication-runtime'
import { projectFixtures, type MockProjectRecord } from './mock-project-runtime'

function createInitialProjects(): MockProjectRecord[] {
  return structuredClone(projectFixtures as unknown as MockProjectRecord[])
}

function createInitialNextProjectId(): number {
  return Math.max(...projectFixtures.map((project) => project.projectId)) + 1
}

let projects: MockProjectRecord[] = createInitialProjects()
let nextProjectId = createInitialNextProjectId()
let authenticatedUser: ApiLoginUser | null = null

export const mockStore = {
  getAuthenticatedUser(): ApiLoginUser | null {
    return authenticatedUser
  },

  setAuthenticatedUser(user: ApiLoginUser | null): void {
    authenticatedUser = user
  },

  getCurrentUserId(): number {
    return authenticatedUser?.userId ?? defaultMockLoginUser.userId
  },

  getProjects(): MockProjectRecord[] {
    return projects
  },

  getProject(id: number): MockProjectRecord | undefined {
    return projects.find((project) => project.projectId === id)
  },

  issueProjectId(): number {
    const issuedId = nextProjectId
    nextProjectId += 1
    return issuedId
  },

  reserveProjectIds(count: number): number {
    const issuedId = nextProjectId
    nextProjectId += count
    return issuedId
  },

  insertProject(project: MockProjectRecord): void {
    projects = [...projects, project]
  },

  insertProjects(nextProjects: readonly MockProjectRecord[]): void {
    projects = [...projects, ...nextProjects]
  },

  replaceProject(nextProject: MockProjectRecord): boolean {
    const index = projects.findIndex((project) => project.projectId === nextProject.projectId)
    if (index === -1) {
      return false
    }

    projects = projects.map((project, currentIndex) =>
      currentIndex === index ? nextProject : project,
    )
    return true
  },

  replaceProjects(nextProjects: MockProjectRecord[]): void {
    projects = nextProjects
  },

  removeProject(projectId: number): boolean {
    const index = projects.findIndex((project) => project.projectId === projectId)
    if (index === -1) {
      return false
    }

    projects = projects.filter((_, currentIndex) => currentIndex !== index)
    return true
  },

  reset(): void {
    projects = createInitialProjects()
    nextProjectId = createInitialNextProjectId()
    authenticatedUser = null
  },
}

export const store = mockStore
