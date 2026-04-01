"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useRouter } from "next/navigation";
import { apiPost, ApiError } from ":/app/(api)/_utils/client";
import { loginFormSchema, type LoginForm as LoginFormValues } from "./login-form.schema";

/**
 * ログインフォーム。
 *
 * メールアドレスとパスワードで認証し、成功時は /projects へ遷移する。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/login/index.jsp
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/AuthenticationAction.java
 *
 * 元 JSP は AuthenticationAction.java の @OnError でグローバルエラー ("errors.login") のみ表示。
 * Next.js ではフィールドレベルバリデーション（zod）を追加し、UX を改善している。
 *
 * 元 LoginForm.java の @Domain 制約:
 * - loginId: @Domain("loginId") → @Length(max=20), @SystemChar(charsetDef="半角数字")
 * - userPassword: @Domain("password") → 制約なし（ExampleDomainType.java で annotation 未定義）
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/entity/core/validation/validator/ExampleDomainType.java
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/form/LoginForm.java
 */
export function LoginForm() {
  const router = useRouter();
  const [errors_global, setErrorsGlobal] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormValues>({
    resolver: standardSchemaResolver(loginFormSchema),
  });

  const onSubmit = async (formData: LoginFormValues) => {
    if (isLoading) return; // 二重送信防止
    setErrorsGlobal([]);
    setIsLoading(true);
    try {
      // @see _references/nablarch-example-web/src/main/java/.../AuthenticationAction.java の login メソッド
      // AuthenticationAction.java はバリデーションエラー時に message フィールドでエラー内容を返す
      const data = await apiPost<Record<string, unknown>>("/api/authentication/login", formData);
      if (!data?.ok) {
        // @see index.jsp: <n:errors filter="global"> — 複数エラーメッセージ対応
        const messages: string[] = Array.isArray(data?.messages)
          ? (data.messages as string[])
          : [((data?.message as string) ?? "ログインIDまたはパスワードが誤っています。")];
        setErrorsGlobal(messages);
        // @see index.jsp L39: <n:password restoreValue="false"> — エラー時パスワードをクリア
        setValue("userPassword", "");
        return;
      }
      router.push("/projects");
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as Record<string, unknown> | null;
        const messages: string[] = Array.isArray(body?.messages)
          ? (body.messages as string[])
          : [((body?.message as string) ?? "ログインIDまたはパスワードが誤っています。")];
        setErrorsGlobal(messages);
        setValue("userPassword", "");
      } else {
        setErrorsGlobal(["ログインIDまたはパスワードが誤っています。"]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {errors_global.length > 0 && (
        <div className="message-area margin-top">
          {errors_global.map((msg, i) => (
            <span key={i} className="message-error">{msg}</span>
          ))}
        </div>
      )}

      <h2 className="font-group">ログイン情報</h2>

      {/* ログインID */}
      <div className="row m-3">
        <label htmlFor="loginId" className="col-md-2 m-auto col-form-label">
          ログインID
        </label>
        <div className="col-md-10">
          <input
            id="loginId"
            type="text"
            className={`form-control form-control-lg${errors.loginId ? " input-error" : ""}`}
            placeholder="ログインID"
            maxLength={20}
            pattern="[0-9]*"
            inputMode="numeric"
            {...register("loginId")}
          />
          {errors.loginId && <span className="message-error">{errors.loginId.message}</span>}
        </div>
      </div>

      {/* パスワード */}
      <div className="row m-3">
        <label htmlFor="userPassword" className="col-md-2 m-auto col-form-label">
          パスワード
        </label>
        <div className="col-md-10">
          <input
            id="userPassword"
            type="password"
            className="form-control form-control-lg"
            placeholder="パスワード"
            autoComplete="off"
            {...register("userPassword")}
          />
          {errors.userPassword && <span className="message-error">{errors.userPassword.message}</span>}
        </div>
      </div>

      {/* ボタン */}
      <div className="title-nav page-footer">
        <div className="button-nav">
          <div className="button-block real-button-block">
            <button
              type="submit"
              className="btn btn-lg btn-light"
              disabled={isLoading}
            >
              {isLoading ? "ログイン中..." : "ログイン"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
