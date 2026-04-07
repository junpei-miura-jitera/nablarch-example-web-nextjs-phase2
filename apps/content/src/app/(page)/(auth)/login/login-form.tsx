'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useRouter } from 'next/navigation'
import { apiLoginFormSchema, type ApiLoginFormValues } from ':/utils/api/authentication'

/**
 * ログインフォーム。
 *
 * メールアドレスとパスワードで認証し、成功時は /projects へ遷移する。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/login/index.jsp
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/AuthenticationAction.java
 *
 * 元 JSP は AuthenticationAction.java の @OnError でグローバルエラー ("errors.login") のみ表示。
 * Next.js 側も入力値の事前制限は行わず、認証結果をグローバルエラーとして表示する。
 *
 * 元 LoginForm.java の @Domain 制約はサーバー側で評価され、失敗時も errors.login に集約される。
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/entity/core/validation/validator/ExampleDomainType.java
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/form/LoginForm.java
 */
export function LoginForm() {
  const router = useRouter()
  const [errors_global, setErrorsGlobal] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ApiLoginFormValues>({
    resolver: standardSchemaResolver(apiLoginFormSchema),
  })

  const onSubmit = async (formData: ApiLoginFormValues) => {
    if (isLoading) return // 二重送信防止
    setErrorsGlobal([])
    setIsLoading(true)
    try {
      // @see _references/nablarch-example-web/src/main/java/.../AuthenticationAction.java の login メソッド
      // AuthenticationAction.java はバリデーションエラー時に message フィールドでエラー内容を返す
      const res = await fetch('/api/authentication/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = (await res.json()) as Record<string, unknown> | null
      if (!res.ok || !data?.ok) {
        // @see index.jsp: <n:errors filter="global"> — 複数エラーメッセージ対応
        const messages: string[] = Array.isArray(data?.messages)
          ? (data.messages as string[])
          : [
              (data?.message as string) ??
                'ログインに失敗しました。ログインIDまたはパスワードが誤っています。',
            ]
        setErrorsGlobal(messages)
        // @see index.jsp L39: <n:password restoreValue="false"> — エラー時パスワードをクリア
        setValue('userPassword', '')
        return
      }
      router.push('/projects')
    } catch {
      setErrorsGlobal(['ログインに失敗しました。ログインIDまたはパスワードが誤っています。'])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="message-area margin-top">
        {errors_global.length > 0 &&
          errors_global.map((msg, i) => (
            <span key={i} className="message-error">
              {msg}
            </span>
          ))}
      </div>

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
            className={`form-control form-control-lg${errors.loginId ? ' input-error' : ''}`}
            placeholder="ログインID"
            {...register('loginId')}
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
            {...register('userPassword')}
          />
          {errors.userPassword && (
            <span className="message-error">{errors.userPassword.message}</span>
          )}
        </div>
      </div>

      {/* ボタン */}
      <div className="title-nav page-footer">
        <div className="button-nav">
          <div className="button-block real-button-block">
            <button type="submit" className="btn btn-lg btn-light" disabled={isLoading}>
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
