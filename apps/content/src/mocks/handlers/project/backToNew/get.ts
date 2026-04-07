import { HttpResponse, http } from 'msw'

/**
 * `/api/project/backToNew` を処理する GET handler。
 */
export const projectBackToNewGetHandler = http.get('/api/project/backToNew', () => {
  return HttpResponse.json({ ok: true, message: '' })
})
