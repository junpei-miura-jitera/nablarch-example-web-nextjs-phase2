/**
 * ログイン実行 endpoint。
 *
 * 旧 `mocks/handlers/auth/handlers.ts` の `/api/authentication/login` 処理を
 * endpoint 単位へ分離して移行した。
 *
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/AuthenticationAction.java#login
 */
import { HttpResponse, http } from 'msw'
import { authenticate } from '../../_services/mock-auth-session'
import { store } from '../../_services/mock-state'
import type { ApiLoginFormValues } from './post.schema'

/**
 * `/api/authentication/login` を処理する POST handler。
 */
export const authenticationLoginPostHandler = http.post(
  '/api/authentication/login',
  async ({ request }) => {
    const body = (await request.json()) as ApiLoginFormValues
    const user = authenticate(body.loginId, body.userPassword)

    if (!user) {
      return HttpResponse.json({
        ok: false,
        message: 'ログインIDまたはパスワードが正しくありません。',
      })
    }

    store.setAuthenticatedUser(user)

    return HttpResponse.json({ ok: true, message: '', user })
  },
)
