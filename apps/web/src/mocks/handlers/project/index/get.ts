import { HttpResponse, http } from 'msw'
import { createDefaultSearchParams, searchProjects } from '../../_services/mock-project-query'
import { store } from '../../_services/mock-state'

/**
 * `/api/project/index` を処理する GET handler。
 */
export const projectIndexGetHandler = http.get('/api/project/index', () => {
  return HttpResponse.json(
    searchProjects(store.getProjects(), store.getCurrentUserId(), createDefaultSearchParams()),
  )
})
