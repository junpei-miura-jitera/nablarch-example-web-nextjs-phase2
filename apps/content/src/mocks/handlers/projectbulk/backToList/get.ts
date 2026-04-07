import { HttpResponse, http } from 'msw'

/**
 * `/api/projectbulk/backToList` を処理する GET handler。
 */
export const projectBulkBackToListGetHandler = http.get('/api/projectbulk/backToList', () => {
  return HttpResponse.json({ ok: true, message: '' })
})
