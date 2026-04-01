import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "auth_session";

/**
 * ログアウト Route Handler。
 *
 * クライアントから document.cookie で auth_session を削除する代わりに、
 * この Route Handler で HttpOnly Cookie を削除する。
 * 元の Nablarch では /action/logout でサーバーサイドのセッションを破棄していた。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/common/header.jsp — `<n:a href="/action/logout">`
 */
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
