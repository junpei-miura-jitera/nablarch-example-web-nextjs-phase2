/**
 * 業種検索 endpoint。
 *
 * 旧 `mocks/handlers/client/handlers.ts` の `/api/industry/find` 処理を endpoint 単位へ分離して移行した。
 *
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/IndustryAction.java#find
 */
import { HttpResponse, http } from 'msw'
import { industryFixtures } from '../../_services/mock-client-runtime'

/**
 * `/api/industry/find` を処理する GET handler。
 */
export const industryFindGetHandler = http.get('/api/industry/find', ({ request }) => {
  const url = new URL(request.url)
  const industryCode = url.searchParams.get('industryCode') ?? ''
  const industryName = url.searchParams.get('industryName') ?? ''

  let results = [...industryFixtures]

  if (industryCode) {
    results = results.filter((industry) => industry.industryCode === industryCode)
  }
  if (industryName) {
    results = results.filter((industry) => industry.industryName.includes(industryName))
  }

  return HttpResponse.json(results)
})
