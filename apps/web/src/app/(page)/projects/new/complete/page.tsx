import type { Metadata } from 'next'
import { CompletePage } from '../../_fragments/complete-page'
import { ProjectSidemenuLayout } from '../../_layouts/project-sidemenu-layout'

export const metadata: Metadata = { title: 'プロジェクト登録完了画面' }

/**
 * プロジェクト登録完了画面。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/completeOfCreate.jsp
 */
export default function CompleteCreatePage() {
  return (
    <ProjectSidemenuLayout>
      <CompletePage title="プロジェクト登録完了画面" message="登録が完了しました。" />
    </ProjectSidemenuLayout>
  )
}
