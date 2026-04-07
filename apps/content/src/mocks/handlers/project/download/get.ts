import { HttpResponse, http } from 'msw'
import { buildProjectCsv } from '../../_services/mock-project-runtime'
import { extractSearchParams, searchProjects } from '../../_services/mock-project-query'
import { store } from '../../_services/mock-state'

/**
 * `/api/project/download` を処理する GET handler。
 */
export const projectDownloadGetHandler = http.get('/api/project/download', ({ request }) => {
  const params = extractSearchParams(new URL(request.url))
  const csv = buildProjectCsv(searchProjects(store.getProjects(), store.getCurrentUserId(), params))

  return new HttpResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename="projects.csv"',
    },
  })
})
