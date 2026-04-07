import { HttpResponse, http } from 'msw'
import { updateProject } from '../../_services/mock-project-command'
import { store } from '../../_services/mock-state'
import type { ApiProjectUpdatePostValues } from './post.schema'

/**
 * `/api/project/update` を処理する POST handler。
 */
export const projectUpdatePostHandler = http.post('/api/project/update', async ({ request }) => {
  const body = (await request.json()) as ApiProjectUpdatePostValues
  const projectId = Number(body.projectId)

  if (!projectId) {
    return HttpResponse.json({
      ok: false,
      message: 'プロジェクトIDが不正です。',
    })
  }

  const existingProject = store.getProject(projectId)
  if (!existingProject) {
    return HttpResponse.json({
      ok: false,
      message: 'プロジェクトが見つかりません。',
    })
  }

  store.replaceProject(updateProject(existingProject, body))

  return HttpResponse.json({ ok: true, message: '' })
})
