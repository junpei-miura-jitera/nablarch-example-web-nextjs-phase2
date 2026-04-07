import { HttpResponse, http } from 'msw'
import type { ApiProjectBulkItemValues } from './post.schema'

/**
 * `/api/projectbulk/confirmOfUpdate` を処理する POST handler。
 */
export const projectBulkConfirmOfUpdatePostHandler = http.post(
  '/api/projectbulk/confirmOfUpdate',
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

    return HttpResponse.json({ ok: true, message: '' })
  },
)
