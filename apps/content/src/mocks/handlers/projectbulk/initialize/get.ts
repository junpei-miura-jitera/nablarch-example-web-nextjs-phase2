import { HttpResponse, http } from 'msw'
import { createDefaultSearchParams, searchProjects } from '../../_services/mock-project-query'
import { store } from '../../_services/mock-state'

/**
 * `/api/projectbulk/initialize` を処理する GET handler。
 */
export const projectBulkInitializeGetHandler = http.get('/api/projectbulk/initialize', () => {
  return HttpResponse.json(
    searchProjects(store.getProjects(), store.getCurrentUserId(), createDefaultSearchParams()),
  )
})
