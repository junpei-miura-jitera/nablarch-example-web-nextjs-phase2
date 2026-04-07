import { HttpResponse, http } from 'msw'
import { createDefaultSearchParams, searchProjects } from '../../_services/mock-project-query'
import { store } from '../../_services/mock-state'

/**
 * `/api/projectbulk/index` を処理する GET handler。
 */
export const projectBulkIndexGetHandler = http.get('/api/projectbulk/index', () => {
  return HttpResponse.json(
    searchProjects(store.getProjects(), store.getCurrentUserId(), createDefaultSearchParams()),
  )
})
