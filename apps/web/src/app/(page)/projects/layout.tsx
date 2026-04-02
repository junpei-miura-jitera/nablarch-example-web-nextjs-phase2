import { redirect } from 'next/navigation'
import { ProjectHeaderLayout } from './_layouts/project-header-layout'
import { getAuthUserServer } from './_utils/auth-user.server'

/**
 * プロジェクト画面共通レイアウト。
 *
 * ヘッダー・フッターで子ページをラップする。 サイドメニューの有無は各ページコンポーネント側で制御する。
 */
export default async function ProjectsLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUserServer()
  if (!user) {
    redirect('/login')
  }

  return <ProjectHeaderLayout>{children}</ProjectHeaderLayout>
}
