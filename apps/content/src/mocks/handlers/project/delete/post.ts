import { HttpResponse, http } from 'msw'
import { store } from '../../_services/mock-state'
import type { ProjectDeletePostValues } from './post.schema'

/**
 * `/api/project/delete` を処理する POST handler。
 */
export const projectDeletePostHandler = http.post('/api/project/delete', async ({ request }) => {
  const body = (await request.json()) as ProjectDeletePostValues
  const projectId = Number(body.projectId)

  if (!projectId) {
    return HttpResponse.json({
      ok: false,
      message: 'プロジェクトIDが不正です。',
    })
  }

  if (!store.removeProject(projectId)) {
    return HttpResponse.json({
      ok: false,
      message: 'プロジェクトが見つかりません。',
    })
  }

  return HttpResponse.json({ ok: true, message: '' })
})
