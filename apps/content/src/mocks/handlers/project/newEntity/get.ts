import { HttpResponse, http } from 'msw'

/**
 * `/api/project/newEntity` を処理する GET handler。
 */
export const projectNewEntityGetHandler = http.get('/api/project/newEntity', () => {
  return HttpResponse.json(undefined, { status: 200 })
})
