'use client'

import { useRouter } from 'next/navigation'
import { ProjectCompletePageView } from ':/app/(page)/projects/_components/complete-page'
import { getSavedListUrl } from '../_utils/list-url'

/**
 * 操作完了画面の共通コンポーネント。
 *
 * 登録・更新・削除完了時に共通のレイアウトでメッセージを表示する。 「次へ」ボタンは sessionStorage に保存された検索条件付き一覧 URL に遷移する。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/completeOfCreate.jsp — 共通構造
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/completeOfUpdate.jsp — 共通構造
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/completeOfDelete.jsp — 共通構造
 */
export function ProjectCompletePage({
  title,
  message,
  topNextId,
  bottomNextId,
  messageClassName,
  nextPath,
}: {
  title: string
  message: string
  topNextId?: string
  bottomNextId?: string
  messageClassName?: string
  nextPath?: string
}) {
  const router = useRouter()

  const handleNext = () => {
    router.push(nextPath ?? getSavedListUrl('/projects'))
  }

  return (
    <ProjectCompletePageView
      title={title}
      message={message}
      onNext={handleNext}
      topNextId={topNextId}
      bottomNextId={bottomNextId}
      messageClassName={messageClassName}
    />
  )
}
