import { HttpResponse, http } from 'msw'

/**
 * `/api/projectbulk/completeOfUpdate` を処理する GET handler。
 */
export const projectBulkCompleteOfUpdateGetHandler = http.get(
  '/api/projectbulk/completeOfUpdate',
  () => {
    return HttpResponse.json({ ok: true, message: '' })
  },
)
