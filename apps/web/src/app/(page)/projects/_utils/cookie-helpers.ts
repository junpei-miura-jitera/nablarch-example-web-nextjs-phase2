/**
 * フォームデータの Cookie 操作ヘルパー（クライアント専用）。
 *
 * 確認画面への遷移前にフォーム入力値を一時保存する。 Nablarch の session scope に相当する仕組みを Cookie で代替している。
 *
 * バックエンド接続時には、サーバーサイドセッション（HttpSession 等）への移行を推奨する。
 *
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java — session scope でのフォームデータ保持
 */

const COOKIE_NAME = 'project_form_data'
const MAX_AGE = 600

function readCookie(name: string): string | null {
  const prefix = `${name}=`
  for (const cookie of document.cookie.split(';')) {
    const trimmed = cookie.trim()
    if (trimmed.startsWith(prefix)) {
      return trimmed.slice(prefix.length)
    }
  }
  return null
}

/**
 * フォームデータを Cookie に保存する。
 */
export async function saveProjectFormToCookie(data: Record<string, unknown>): Promise<void> {
  const value = encodeURIComponent(JSON.stringify(data))
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${MAX_AGE}; samesite=strict`
}

/**
 * Cookie からフォームデータを読み込む。
 */
export async function loadProjectFormFromCookie(): Promise<Record<string, unknown> | null> {
  try {
    const raw = readCookie(COOKIE_NAME)
    if (!raw) return null
    return JSON.parse(decodeURIComponent(raw))
  } catch {
    return null
  }
}

/**
 * Cookie に保存したフォームデータを削除する。
 */
export async function clearProjectFormCookie(): Promise<void> {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; samesite=strict`
}
