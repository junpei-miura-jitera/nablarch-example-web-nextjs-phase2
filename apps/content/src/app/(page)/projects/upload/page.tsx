import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { LayoutFooter } from '../_components/layouts/layout-footer'
import { LayoutHeader } from '../_components/layouts/layout-header'
import { getAuthUserServer } from '../_utils/auth-user.server'
import { UploadForm } from './upload-form'

/**
 * プロジェクト一括登録画面のメタデータ。
 */
export const metadata: Metadata = {
  title: 'プロジェクト一括登録画面',
}

/**
 * プロジェクト一括登録（CSV アップロード）ページ。
 *
 * Java 版はサイドメニューなし（menu.jsp + header.jsp のみ）。 `@CheckRole(LoginUserPrincipal.ROLE_ADMIN)`
 * によるADMIN権限チェックに対応。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/projectUpload/create.jsp
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectUploadAction.java (L48,60)
 */
export default async function UploadPage() {
  // @see ProjectUploadAction.java @CheckRole(ROLE_ADMIN) — 管理者のみアクセス可
  const user = await getAuthUserServer()
  if (!user) {
    redirect('/login')
  }
  if (!user.admin) {
    redirect('/error?type=permission')
  }

  return (
    <>
      <LayoutHeader />
      <UploadForm />
      <LayoutFooter />
    </>
  )
}
