import { HttpResponse, http } from 'msw'

/**
 * `/api/project/completeOfCreate` を処理する GET handler。
 */
export const projectCompleteOfCreateGetHandler = http.get('/api/project/completeOfCreate', () => {
  return HttpResponse.json({ ok: true, message: '' })
})
