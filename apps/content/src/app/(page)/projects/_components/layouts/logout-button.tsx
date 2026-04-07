'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

/**
 * ログアウトボタン。
 *
 * `LayoutHeader` 専用の小さな UI 部品として、同じ `layouts` 配下にコロケーションする。
 *
 * サーバーサイドのログアウト API を呼び出してから Cookie をクリアし /login に遷移する。 header.jsp の `<n:a
 * href="/action/logout">ログアウト</n:a>` に相当。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/common/header.jsp — `<n:a href="/action/logout">`
 */
export function LogoutButton() {
  const router = useRouter()

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/authentication/logout')
    } finally {
      router.push('/login')
    }
  }, [router])

  // @see header.jsp L68: 元は <n:a> タグ（リンク要素）。同等のスタイルで表示する
  return (
    <a
      href="/login"
      onClick={(event) => {
        event.preventDefault()
        void handleLogout()
      }}
    >
      ログアウト
    </a>
  )
}
