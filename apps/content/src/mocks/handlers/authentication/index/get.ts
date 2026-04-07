/**
 * 認証トップ画面初期表示 endpoint。
 *
 * 旧 `mocks/handlers/auth/handlers.ts` の `/api/authentication/index` 処理を endpoint 単位へ分離して移行した。
 *
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/AuthenticationAction.java#index
 */
import { HttpResponse, http } from 'msw'
import { store } from '../../_services/mock-state'

/**
 * `/api/authentication/index` を処理する GET handler。
 */
export const authenticationIndexGetHandler = http.get('/api/authentication/index', () => {
  return HttpResponse.json(store.getAuthenticatedUser())
})
