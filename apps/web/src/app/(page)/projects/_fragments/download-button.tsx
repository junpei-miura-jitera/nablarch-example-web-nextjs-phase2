'use client'

import { useState } from 'react'
import { toArray } from '../_utils/search-params-helpers'
import type { ProjectClassValue } from '../_constants/project-class'

/**
 * CSV ダウンロードボタン。
 *
 * ブラウザ上でファイルダウンロードを実行するためクライアントコンポーネント。
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
      const qs = new URLSearchParams()
      qs.set('pageNumber', (searchParams.pageNumber as string | undefined) ?? '1')
      if (searchParams.clientId) qs.set('clientId', searchParams.clientId as string)
      if (searchParams.clientName) qs.set('clientName', searchParams.clientName as string)
      if (searchParams.projectName) qs.set('projectName', searchParams.projectName as string)
      if (searchParams.projectType) qs.set('projectType', searchParams.projectType as string)
      for (const v of toArray(searchParams.projectClass) as ProjectClassValue[])
        qs.append('projectClass', v)
      if (searchParams.projectStartDateBegin)
        qs.set('projectStartDateBegin', searchParams.projectStartDateBegin as string)
      if (searchParams.projectStartDateEnd)
        qs.set('projectStartDateEnd', searchParams.projectStartDateEnd as string)
      if (searchParams.projectEndDateBegin)
        qs.set('projectEndDateBegin', searchParams.projectEndDateBegin as string)
      if (searchParams.projectEndDateEnd)
        qs.set('projectEndDateEnd', searchParams.projectEndDateEnd as string)
      if (searchParams.sortKey) qs.set('sortKey', searchParams.sortKey as string)
      if (searchParams.sortDir) qs.set('sortDir', searchParams.sortDir as string)

      const res = await fetch(`/api/project/download?${qs}`)
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
      <button type="button" onClick={handleDownload} className="btn btn-link p-0 ms-2">
        ダウンロード
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/download.png" alt="ダウンロード" />
      </button>
      {downloadError && <span className="message-error ms-2">{downloadError}</span>}
    </>
  )
}
