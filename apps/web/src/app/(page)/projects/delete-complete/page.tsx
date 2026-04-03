import type { Metadata } from 'next'
import { CompletePage } from '../_fragments/complete-page'
import { ProjectSidemenuLayout } from '../_layouts/project-sidemenu-layout'

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
    <ProjectSidemenuLayout>
      <CompletePage title="プロジェクト削除完了画面" message="プロジェクトの削除が完了しました。" />
    </ProjectSidemenuLayout>
  )
}
