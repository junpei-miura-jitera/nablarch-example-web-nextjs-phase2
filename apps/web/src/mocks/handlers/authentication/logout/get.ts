/**
 * ログアウト endpoint。
 *
 * 旧 `mocks/handlers/auth/handlers.ts` の `/api/authentication/logout` 処理を
 * endpoint 単位へ分離して移行した。
 *
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/AuthenticationAction.java#logout
 */
import { HttpResponse, http } from 'msw'
import { store } from '../../_services/mock-state'

/**
 * `/api/authentication/logout` を処理する GET handler。
 */
export const authenticationLogoutGetHandler = http.get('/api/authentication/logout', () => {
  store.setAuthenticatedUser(null)
  return HttpResponse.json({ ok: true, message: '' })
})
