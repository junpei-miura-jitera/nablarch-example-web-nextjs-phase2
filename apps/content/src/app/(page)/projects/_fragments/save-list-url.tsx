'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { saveCurrentListUrl } from '../_utils/list-url'

/**
 * ページロード時に現在の URL を sessionStorage に保存する。
 *
 * 詳細画面や編集画面の「戻る」ボタン (BackButton) が 検索条件付きの一覧 URL に戻れるようにするため。
 *
 * 元の JSP では saveListUrl() で同様の処理を行っていた。
 *
 * @see _references/nablarch-example-web/src/main/webapp/javascripts/projectList.js
 */
export function SaveListUrl() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    saveCurrentListUrl(pathname, searchParams)
  }, [pathname, searchParams])

  return null
}
