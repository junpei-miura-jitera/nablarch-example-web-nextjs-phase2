import type { Metadata } from 'next'
import { LayoutFooter } from '../../_components/layouts/layout-footer'
import { LayoutHeader } from '../../_components/layouts/layout-header'
import { ProjectCompletePage } from '../../_fragments/complete-page'

/**
 * プロジェクト一覧更新完了画面のメタデータ。
 */
export const metadata: Metadata = {
  title: 'プロジェクト一覧更新完了画面',
}

/**
 * プロジェクト一括更新完了画面。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/projectBulk/completeOfUpdate.jsp
 */
export default function BulkCompletePage() {
  return (
    <>
      <LayoutHeader />
      <ProjectCompletePage
        title="プロジェクト一覧更新完了画面"
        message="プロジェクトの更新が完了しました。"
        topNextId="topReturnList"
        bottomNextId="bottomReturnList"
        wrapMessageWithSection
      />
      <LayoutFooter />
    </>
  )
}
