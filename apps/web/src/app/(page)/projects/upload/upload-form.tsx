'use client'

import { useState } from 'react'

/**
 * アップロード結果の型。
 */
type UploadResult = { ok: true; count: number } | { ok: false; errors: readonly string[] }

/**
 * CSV ファイルアップロードフォーム。
 *
 * Java 版の構造: title-nav "プロジェクト一括登録画面" + button "登録" h2 "プロジェクト情報ファイル選択" table: "プロジェクト情報ファイル選択"
 * ヘッダー + "プロジェクト情報ファイル必須" 行 title-nav (footer) + button "登録"
 *
 * 元 JSP では `<n:errors>` タグにより行番号付きの詳細バリデーションエラーを表示していた。 API が返す message フィールドを改行で分割し、同等の詳細エラー表示を行う。
 *
 * 変換メモ:
 *
 * - JSP の `allowDoubleSubmission=false` / `useToken` による二重送信防止は、 UI レベルの `isUploading` フラグ（ボタン
 *   disabled 制御）に置き換えた。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/projectUpload/create.jsp
 */
export function UploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    // @see ProjectUploadAction.java L67-69: ファイル未選択時のエラー表示
    if (!file) {
      setResult({ ok: false, errors: ['ファイルを選択してください。'] })
      return
    }
    setIsUploading(true)
    setResult(null)
    try {
      const fd = new FormData()
      // @see create.jsp L42: <n:file name="uploadFile"> — Java API のパラメータ名に合わせる
      fd.append('uploadFile', file)
      const res = await fetch('/api/projectupload/upload', {
        method: 'POST',
        body: fd,
      })
      const data = (await res.json().catch(() => null)) as Record<string, unknown> | null
      if (!res.ok || !data?.ok) {
        // API が返す message を改行区切りで分割し、詳細エラー（行番号付き等）を個別表示する
        const message = data?.message as string | undefined
        const errors = message
          ? message.split('\n').filter(Boolean)
          : ['アップロードに失敗しました。']
        setResult({ ok: false, errors })
        return
      }
      setResult({ ok: true, count: (data as { count?: number })?.count ?? 0 })
    } catch {
      setResult({ ok: false, errors: ['アップロードに失敗しました。'] })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleUpload} encType="multipart/form-data">
      {/* title-nav: 上部 */}
      <div className="title-nav">
        <span>プロジェクト一括登録画面</span>
        <div className="button-nav">
          <button type="submit" className="btn btn-lg btn-light" disabled={isUploading}>
            登録
          </button>
        </div>
      </div>

      {/* メッセージエリア */}
      {result && result.ok && (
        <div className="message-area margin-top">
          {/* create.jsp L24: <n:message messageId="success.upload.project"> — message-info クラスを使用 */}
          <span className="message-info">{result.count}件のプロジェクトを登録しました。</span>
        </div>
      )}
      {result && !result.ok && (
        <div className="message-area margin-top">
          {result.errors.map((msg, i) => (
            <span key={i} className="message-error">
              {msg}
              {i < result.errors.length - 1 && <br />}
            </span>
          ))}
        </div>
      )}

      <div className="floatClear" />

      {/* セクション */}
      <h2 className="font-group mb-3">プロジェクト情報ファイル選択</h2>

      <table className="table">
        <colgroup>
          <col style={{ width: '20%' }} />
          <col style={{ width: '30%' }} />
          <col style={{ width: '50%' }} />
        </colgroup>
        <tbody>
          <tr>
            <th colSpan={2}>プロジェクト情報ファイル選択</th>
          </tr>
          <tr>
            <th className="width-250 required">プロジェクト情報ファイル</th>
            <td>
              <div className="input-group">
                <input
                  id="uploadFile"
                  type="file"
                  className="form-control form-control-lg"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* title-nav: 下部 */}
      <div className="title-nav">
        <div className="button-nav">
          <button type="submit" className="btn btn-lg btn-light" disabled={isUploading}>
            登録
          </button>
        </div>
      </div>
    </form>
  )
}
