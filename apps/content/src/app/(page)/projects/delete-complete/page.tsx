import type { Metadata } from 'next'
import { LayoutFooter } from '../_components/layouts/layout-footer'
import { LayoutHeader } from '../_components/layouts/layout-header'
import { ProjectCompletePage } from '../_fragments/complete-page'

/**
 * プロジェクト削除完了画面のメタデータ。
 */
export const metadata: Metadata = {
  title: 'プロジェクト削除完了画面',
}

/**
 * プロジェクト削除完了画面。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/completeOfDelete.jsp
 */
export default function DeleteCompletePage() {
  return (
    <>
      <LayoutHeader />
      <ProjectCompletePage
        title="プロジェクト削除完了画面"
        message="プロジェクトの削除が完了しました。"
        topNextId="topReturnList"
        bottomNextId="bottomReturnList"
        messageClassName="message-area message-info"
      />
      <LayoutFooter />
    </>
  )
}
