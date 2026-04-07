import { HttpResponse, http } from 'msw'

/**
 * `/api/projectupload/index` を処理する GET handler。
 */
export const projectUploadIndexGetHandler = http.get('/api/projectupload/index', () => {
  return HttpResponse.json(undefined, { status: 200 })
})
