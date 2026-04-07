import type { Metadata } from 'next'
import { LayoutFooter } from '../../_components/layouts/layout-footer'
import { LayoutHeader } from '../../_components/layouts/layout-header'
import { ProjectCompletePage } from '../../_fragments/complete-page'

/**
 * プロジェクト登録完了画面のメタデータ。
 */
export const metadata: Metadata = {
  title: 'プロジェクト登録完了画面',
}

/**
 * プロジェクト登録完了画面。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/completeOfCreate.jsp
 */
export default function CompleteCreatePage() {
  return (
    <>
      <LayoutHeader />
      <ProjectCompletePage
        title="プロジェクト登録完了画面"
        message="登録が完了しました。"
        messageClassName="message-area message-info"
        nextPath="/projects/new"
      />
      <LayoutFooter />
    </>
  )
}
