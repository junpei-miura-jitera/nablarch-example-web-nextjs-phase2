import { redirect } from 'next/navigation'
import { getAuthUserServer } from './_utils/auth-user.server'

/**
 * プロジェクト画面の auth gate。
 * ヘッダー / フッター / サイドメニューは各 page が明示配置する。
 */
export default async function ProjectsLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUserServer()
  if (!user) {
    redirect('/login')
  }

  return children
}
