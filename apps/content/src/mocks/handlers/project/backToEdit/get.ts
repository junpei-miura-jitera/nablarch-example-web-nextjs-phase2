import { HttpResponse, http } from 'msw'

/**
 * `/api/project/backToEdit` を処理する GET handler。
 */
export const projectBackToEditGetHandler = http.get('/api/project/backToEdit', () => {
  return HttpResponse.json({ ok: true, message: '' })
})
