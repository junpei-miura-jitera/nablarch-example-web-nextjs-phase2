import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "project_form_data";
const MAX_AGE = 600; // 10分

/**
 * フォームデータ Cookie の Route Handler。
 *
 * クライアントから document.cookie で設定する代わりに、
 * この Route Handler 経由で HttpOnly Cookie を設定・削除する。
 * これにより XSS でフォームデータ（金額情報等）が窃取されるリスクを軽減する。
 *
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java — session scope
 */

/** GET: Cookie からフォームデータを取得（「戻る」操作時のフォーム復元用）。 */
export async function GET() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie) return NextResponse.json(null);
  try {
    return NextResponse.json(JSON.parse(decodeURIComponent(cookie.value)));
  } catch {
    return NextResponse.json(null);
  }
}

const MAX_BODY_SIZE = 8 * 1024; // 8KB

/** POST: フォームデータを HttpOnly Cookie に保存。 */
export async function POST(request: Request) {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BODY_SIZE) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }
  const body = await request.json();
  if (body === null || Array.isArray(body) || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, encodeURIComponent(JSON.stringify(body)), {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    maxAge: MAX_AGE,
  });
  return NextResponse.json({ ok: true });
}

/** DELETE: フォームデータ Cookie を削除。 */
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
