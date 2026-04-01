/**
 * フォームデータの Cookie 操作ヘルパー（クライアント専用）。
 *
 * 確認画面への遷移前にフォーム入力値を一時保存する。
 * Nablarch の session scope に相当する仕組みを HttpOnly Cookie で代替している。
 * Cookie の設定・削除は Route Handler（/api/form-cookie）経由で行い、
 * document.cookie を直接操作しない（XSS でのデータ窃取を防止）。
 *
 * バックエンド接続時には、サーバーサイドセッション（HttpSession 等）への移行を推奨する。
 *
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java — session scope でのフォームデータ保持
 * @see /src/app/api/form-cookie/route.ts — HttpOnly Cookie を設定する Route Handler
 */

/**
 * フォームデータを HttpOnly Cookie に保存する。
 *
 * Route Handler 経由で HttpOnly Cookie を設定するため、
 * JavaScript からは Cookie 値を読み取れない。
 */
export async function saveProjectFormToCookie(data: Record<string, unknown>): Promise<void> {
  const res = await fetch("/api/form-cookie", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    // 413: Cookie サイズ上限（8KB）超過、400: バリデーションエラー等
    throw new Error(`フォームデータの保存に失敗しました（${res.status}）`);
  }
}

/**
 * Cookie からフォームデータを読み込む。
 *
 * HttpOnly Cookie のためクライアントから直接読めないので、
 * Route Handler 経由で取得する。
 * 確認画面から「戻る」操作時のフォーム復元に使用する。
 */
export async function loadProjectFormFromCookie(): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch("/api/form-cookie");
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Cookie に保存したフォームデータを削除する。
 */
export async function clearProjectFormCookie(): Promise<void> {
  await fetch("/api/form-cookie", { method: "DELETE" });
}
