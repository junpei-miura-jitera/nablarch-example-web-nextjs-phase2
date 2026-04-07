import { HttpResponse, http } from 'msw'

/**
 * `/api/project/completeOfUpdate` を処理する GET handler。
 */
export const projectCompleteOfUpdateGetHandler = http.get('/api/project/completeOfUpdate', () => {
  return HttpResponse.json({ ok: true, message: '' })
})
