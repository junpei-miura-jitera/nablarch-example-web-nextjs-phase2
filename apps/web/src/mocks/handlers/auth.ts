/**
 * 認証関連の MSW ハンドラー。
 *
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/AuthenticationAction.java
 */
import { HttpResponse, http } from "msw";
import { store } from "../store";
import type { LoginFormRequest } from ":/app/(page)/projects/_schemas/project.types";

export const authHandlers = [
  /**
   * ログイン画面初期表示。
   *
   * 現在のログインユーザー情報を返す。未認証の場合は null 相当の空レスポンス。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/AuthenticationAction.java#index
   */
  http.get("/api/authentication/index", () => {
    const user = store.getAuthenticatedUser();
    return HttpResponse.json(user);
  }),

  /**
   * ログイン処理。
   *
   * loginId / userPassword を検証し、認証状態をストアに保持する。
   * 認証失敗時はエラーメッセージ付きの ActionResult を返す。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/AuthenticationAction.java#login
   */
  http.post("/api/authentication/login", async ({ request }) => {
    const body = (await request.json()) as LoginFormRequest;
    const user = store.login(body.loginId, body.userPassword);

    if (!user) {
      return HttpResponse.json({
        ok: false,
        message: "ログインIDまたはパスワードが正しくありません。",
      });
    }

    return HttpResponse.json({ ok: true, message: "" });
  }),

  /**
   * ログアウト処理。
   *
   * 認証状態をクリアし、ActionResult を返す。
   *
   * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/AuthenticationAction.java#logout
   */
  http.get("/api/authentication/logout", () => {
    store.logout();
    return HttpResponse.json({ ok: true, message: "" });
  }),
];
