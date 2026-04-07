import type { Metadata } from 'next'
import { LayoutFooter } from '../../../_components/layouts/layout-footer'
import { LayoutHeader } from '../../../_components/layouts/layout-header'
import { ProjectCompletePage } from '../../../_fragments/complete-page'

/**
 * プロジェクト変更完了画面のメタデータ。
 */
export const metadata: Metadata = {
  title: 'プロジェクト変更完了画面',
}

/**
 * プロジェクト変更完了画面。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/completeOfUpdate.jsp
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java#update (L364-378)
 */
export default function UpdateCompletePage() {
  return (
    <>
      <LayoutHeader />
      <ProjectCompletePage
        title="プロジェクト変更完了画面"
        message="プロジェクトの更新が完了しました。"
        topNextId="topReturnList"
        bottomNextId="bottomReturnList"
        messageClassName="message-area message-info"
      />
      <LayoutFooter />
    </>
  )
}
