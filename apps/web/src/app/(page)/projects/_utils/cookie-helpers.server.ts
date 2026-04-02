import { cookies } from 'next/headers'

// フォームデータ保存用 Cookie 名
const PROJECT_FORM_COOKIE_NAME = 'project_form_data'

/**
 * Cookie からフォームデータを読み込む（サーバー専用）。
 *
 * 確認画面で、Cookie に保存されたフォームデータを取得する。 元の Nablarch Action における session scope からのフォームデータ取得に対応する。
 * バックエンド接続時には、サーバーサイドセッションからの読み取りに置き換えること。
 *
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java — SessionUtil.get による session scope 取得
 */
export async function loadProjectFormFromCookieServer(): Promise<Record<string, unknown> | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(PROJECT_FORM_COOKIE_NAME)
  if (!cookie) return null
  try {
    return JSON.parse(decodeURIComponent(cookie.value))
  } catch {
    return null
  }
}

/**
 * Cookie に保存したフォームデータを削除する（サーバー専用）。
 */
export async function clearProjectFormCookieServer() {
  const cookieStore = await cookies()
  cookieStore.delete(PROJECT_FORM_COOKIE_NAME)
}
