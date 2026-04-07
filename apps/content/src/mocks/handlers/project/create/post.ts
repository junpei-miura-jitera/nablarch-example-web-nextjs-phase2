import { HttpResponse, http } from 'msw'
import { createProject } from '../../_services/mock-project-command'
import { store } from '../../_services/mock-state'
import type { ApiProjectFormValues } from './post.schema'

/**
 * `/api/project/create` を処理する POST handler。
 */
export const projectCreatePostHandler = http.post('/api/project/create', async ({ request }) => {
  const body = (await request.json()) as ApiProjectFormValues
  const createdProject = createProject(store.issueProjectId(), store.getCurrentUserId(), body)
  store.insertProject(createdProject)
  return HttpResponse.json({ ok: true, message: '' })
})
