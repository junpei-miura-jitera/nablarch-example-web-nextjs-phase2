import type { Metadata } from 'next'
import { LayoutFooter } from '../_components/layouts/layout-footer'
import { LayoutHeader } from '../_components/layouts/layout-header'
import { CreateProjectForm } from './create-project-form'

/**
 * プロジェクト登録画面のメタデータ。
 */
export const metadata: Metadata = {
  title: 'プロジェクト登録画面',
}

/**
 * プロジェクト新規登録画面。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/create.jsp
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java#newEntity (L50-55)
 */
export default async function CreateProjectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>
}) {
  const params = await searchParams
  // 確認画面から「戻る」で遷移した場合は Cookie のフォームデータを復元する
  // 直接アクセスの場合はフォーム側で Cookie をクリアする
  const isReturningFromConfirm = params.from === 'confirm'
  return (
    <>
      <LayoutHeader />
      <section>
        <CreateProjectForm clearCookie={!isReturningFromConfirm} />
      </section>
      <LayoutFooter />
    </>
  )
}
