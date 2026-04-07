import { HttpResponse, http } from 'msw'

/**
 * `/api/project/completeOfDelete` を処理する GET handler。
 */
export const projectCompleteOfDeleteGetHandler = http.get('/api/project/completeOfDelete', () => {
  return HttpResponse.json({ ok: true, message: '' })
})
