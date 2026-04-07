import { HttpResponse, http } from 'msw'

/**
 * `/api/project/confirmOfUpdate` を処理する POST handler。
 */
export const projectConfirmOfUpdatePostHandler = http.post(
  '/api/project/confirmOfUpdate',
  async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>

    if (!body.projectName || !body.projectType || !body.projectClass || !body.clientId) {
      return HttpResponse.json({
        ok: false,
        message: '必須項目が入力されていません。',
      })
    }

    return HttpResponse.json({ ok: true, message: '' })
  },
)
