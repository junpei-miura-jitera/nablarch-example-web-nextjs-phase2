import type { Metadata } from 'next'
import { LoginForm } from './login-form'

export const metadata: Metadata = { title: 'ログイン' }

/**
 * ログインページ。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/login/index.jsp
 */
export default function LoginPage() {
  return (
    <>
      {/* タイトルバー */}
      <div className="title-nav">
        <span>ログイン</span>
      </div>

      <LoginForm />
    </>
  )
}
