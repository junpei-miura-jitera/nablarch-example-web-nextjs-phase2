import { HttpResponse, http } from 'msw'

import { store } from '../../_services/mock-state'

/**
 * `/api/project/show` を処理する GET handler。
 */
export const projectShowGetHandler = http.get('/api/project/show', ({ request }) => {
  const projectId = Number(new URL(request.url).searchParams.get('projectId'))
  const project = store.getProject(projectId)

  if (!project) {
    return HttpResponse.json(
      { ok: false, message: 'プロジェクトが見つかりません。' },
      { status: 404 },
    )
  }

  return HttpResponse.json(project)
})
