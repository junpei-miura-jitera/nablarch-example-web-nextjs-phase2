import { HttpResponse, http } from 'msw'
import { extractSearchParams, searchProjects } from '../../_services/mock-project-query'
import { store } from '../../_services/mock-state'

/**
 * `/api/projectbulk/list` を処理する GET handler。
 */
export const projectBulkListGetHandler = http.get('/api/projectbulk/list', ({ request }) => {
  const params = extractSearchParams(new URL(request.url))
  return HttpResponse.json(searchProjects(store.getProjects(), store.getCurrentUserId(), params))
})
