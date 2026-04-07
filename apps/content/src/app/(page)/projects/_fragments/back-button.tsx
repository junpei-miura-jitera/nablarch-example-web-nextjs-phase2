'use client'

import { useRouter } from 'next/navigation'
import { getSavedListUrl } from '../_utils/list-url'

/**
 * 検索条件付き一覧画面に戻るボタン。
 *
 * SessionStorage に保存された一覧 URL（検索条件付き）に遷移する。 保存がなければ /projects にフォールバックする。
 *
 * 元の JSP では saveListUrl() / setListUrlTo() で sessionStorage を使っていた。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/detail.jsp
 * @see _references/nablarch-example-web/src/main/webapp/javascripts/projectList.js
 */
export function BackButton({ className, id }: { className?: string; id?: string }) {
  const router = useRouter()
  const fallback = '/projects'

  const handleBack = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    router.push(getSavedListUrl(fallback))
  }

  return (
    <a id={id} href={fallback} className={className} onClick={handleBack}>
      戻る
    </a>
  )
}
