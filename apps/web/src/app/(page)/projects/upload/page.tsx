import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const metadata: Metadata = { title: "ファイルアップロード画面" };
import { AUTH_COOKIE_NAME, authUserSchema } from ":/utils/auth";
import { UploadForm } from "./upload-form";

/**
 * プロジェクト一括登録（CSV アップロード）ページ。
 *
 * Java 版はサイドメニューなし（menu.jsp + header.jsp のみ）。
 * `@CheckRole(LoginUserPrincipal.ROLE_ADMIN)` によるADMIN権限チェックに対応。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/projectUpload/create.jsp
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectUploadAction.java (L48,60)
 */
export default async function UploadPage() {
  // @see ProjectUploadAction.java @CheckRole(ROLE_ADMIN) — 管理者のみアクセス可
  const cookieStore = await cookies();
  const raw = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (raw) {
    try {
      const user = authUserSchema.parse(JSON.parse(raw));
      // Java 版は LoginUserPrincipal.ROLE_ADMIN = 1 でチェック。
      // Next.js 版では AuthUser.admin フラグで代替する
      if (!user.admin) {
        redirect("/error?type=permission");
      }
    } catch {
      redirect("/error?type=permission");
    }
  } else {
    redirect("/login");
  }

  return <UploadForm />;
}
