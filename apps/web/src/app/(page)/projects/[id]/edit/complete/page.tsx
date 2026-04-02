import type { Metadata } from 'next'
import { CompletePage } from '../../../_fragments/complete-page'
import { ProjectSidemenuLayout } from '../../../_layouts/project-sidemenu-layout'

export const metadata: Metadata = { title: 'プロジェクト変更完了画面' }

/**
 * プロジェクト変更完了画面。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/completeOfUpdate.jsp
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java#update (L364-378)
 */
export default function UpdateCompletePage() {
  return (
    <ProjectSidemenuLayout>
      <CompletePage title="プロジェクト変更完了画面" message="プロジェクトの更新が完了しました。" />
    </ProjectSidemenuLayout>
  )
}
