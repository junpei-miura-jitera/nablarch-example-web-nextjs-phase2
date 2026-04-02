import { HttpResponse, http } from 'msw'
import { bulkUpdateProjects } from '../../_services/mock-project-command'
import { store } from '../../_services/mock-state'
import type { ApiProjectBulkItemValues } from './post.schema'

/**
 * `/api/projectbulk/update` を処理する POST handler。
 */
export const projectBulkUpdatePostHandler = http.post(
  '/api/projectbulk/update',
  async ({ request }) => {
    const body = (await request.json()) as {
      projectList?: ApiProjectBulkItemValues[]
    }

    if (!body.projectList || body.projectList.length === 0) {
      return HttpResponse.json({
        ok: false,
        message: '更新対象が選択されていません。',
      })
    }

    const result = bulkUpdateProjects(store.getProjects(), body.projectList)
    store.replaceProjects(result.projects)

    if (result.failed > 0) {
      return HttpResponse.json({
        ok: false,
        message: `${result.updated}件更新、${result.failed}件失敗しました。`,
      })
    }

    return HttpResponse.json({ ok: true, message: '' })
  },
)
