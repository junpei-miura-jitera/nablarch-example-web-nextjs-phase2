'use client'

import { useState } from 'react'
import { buildProjectSearchParams } from '../_utils/search-params-helpers'

/**
 * CSV ダウンロードボタン。
 *
 * ブラウザ上でファイルダウンロードを実行するためクライアントコンポーネント。
 * `marginLeft: 3px` は JSP 由来の style ではなく、Java 実画面との残差を減らすための微調整。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/index.jsp
 */
export function DownloadButton({
  searchParams,
}: {
  searchParams: Record<string, string | string[]>
}) {
  const [downloadError, setDownloadError] = useState<string | null>(null)

  // @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java の download メソッド
  async function handleDownload() {
    setDownloadError(null)
    try {
      const queryParams = buildProjectSearchParams(searchParams, {
        pageNumber: typeof searchParams.pageNumber === 'string' ? searchParams.pageNumber : '1',
      })

      const res = await fetch(`/api/project/download?${queryParams}`)
      if (!res.ok) throw new Error(`API error ${res.status}`)
      const blob = await res.blob()
      // Java 版はストリーミングレスポンスで CSV を返す。ここでは Blob API で同等の動作を再現
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      // @see ProjectAction.java L240: response.setContentDisposition("プロジェクト一覧.csv")
      a.download = 'プロジェクト一覧.csv'
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      setDownloadError('CSVダウンロードに失敗しました')
    }
  }

  return (
    <>
      <a
        href="#"
        style={{ marginLeft: '3px' }}
        onClick={(event) => {
          event.preventDefault()
          void handleDownload()
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/download.png" alt="ダウンロード" />
      </a>
      {downloadError && <span className="message-error ms-2">{downloadError}</span>}
    </>
  )
}
