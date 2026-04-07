/**
 * 顧客検索 endpoint。
 *
 * 旧 `mocks/handlers/client/handlers.ts` の `/api/client/find` 処理を endpoint 単位へ分離して移行した。
 *
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ClientAction.java#find
 */
import { HttpResponse, http } from 'msw'
import { clientFixtures } from '../../_services/mock-client-runtime'
import { CLIENT_NAME_FULLWIDTH_MESSAGE, isFullWidthText } from ':/app/(page)/projects/_utils/api/project'

/**
 * `/api/client/find` を処理する GET handler。
 */
export const clientFindGetHandler = http.get('/api/client/find', ({ request }) => {
  const url = new URL(request.url)
  const clientName = url.searchParams.get('clientName') ?? ''
  const industryCode = url.searchParams.get('industryCode') ?? ''
  const sortKey = url.searchParams.get('sortKey') ?? 'id'
  const sortDir = url.searchParams.get('sortDir') ?? 'asc'

  let results = [...clientFixtures]

  if (clientName && !isFullWidthText(clientName)) {
    return HttpResponse.json([{ message: CLIENT_NAME_FULLWIDTH_MESSAGE }], { status: 400 })
  }

  if (clientName) {
    results = results.filter((client) => client.clientName.includes(clientName))
  }
  if (industryCode) {
    results = results.filter((client) => client.industryCode === industryCode)
  }

  results.sort((left, right) => {
    const order = sortDir === 'asc' ? 1 : -1
    if (sortKey === 'name') {
      return left.clientName.localeCompare(right.clientName, 'ja') * order
    }
    return (left.clientId - right.clientId) * order
  })

  return HttpResponse.json(results)
})
