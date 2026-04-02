'use client'

import { useRouter } from 'next/navigation'

const LIST_URL_KEY = 'listUrl'

/**
 * 操作完了画面の共通コンポーネント。
 *
 * 登録・更新・削除完了時に共通のレイアウトでメッセージを表示する。 「次へ」ボタンは sessionStorage に保存された検索条件付き一覧 URL に遷移する。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/completeOfCreate.jsp — 共通構造
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/completeOfUpdate.jsp — 共通構造
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/completeOfDelete.jsp — 共通構造
 */
export function CompletePage({ title, message }: { title: string; message: string }) {
  const router = useRouter()

  const handleNext = () => {
    const fallback = '/projects'
    const raw = sessionStorage.getItem(LIST_URL_KEY)
    if (!raw) {
      router.push(fallback)
      return
    }
    try {
      // open redirect 防止: 相対パスのみ許可。絶対 URL が保存されていた場合は pathname + search を抽出する
      const listUrl =
        raw.startsWith('/') && !raw.startsWith('//')
          ? raw
          : new URL(raw).pathname + new URL(raw).search
      router.push(listUrl)
    } catch {
      router.push(fallback)
    }
  }

  return (
    <>
      {/* completeOfCreate.jsp L20-24 / completeOfUpdate.jsp L20-24: タイトル + 上部「次へ」ボタン */}
      <div className="title-nav">
        <span className="page-title">{title}</span>
        <div className="button-nav">
          <button type="button" onClick={handleNext} className="btn btn-lg btn-success">
            次へ
          </button>
        </div>
      </div>
      <section>
        {/* completeOfCreate.jsp L26-28: メッセージ表示 */}
        <div className="message-area">{message}</div>
      </section>
      {/* completeOfCreate.jsp L29-32: フッター「次へ」ボタン */}
      <div className="title-nav page-footer">
        <div className="button-nav">
          <button type="button" onClick={handleNext} className="btn btn-lg btn-success">
            次へ
          </button>
        </div>
      </div>
    </>
  )
}
