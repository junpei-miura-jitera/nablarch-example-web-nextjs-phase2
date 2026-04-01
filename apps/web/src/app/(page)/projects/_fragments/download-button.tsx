"use client";

import { useState } from "react";
import { apiGetBlob } from ":/app/(api)/_utils/client";
import { toArray } from "../_utils/search-params-helpers";
import type { ProjectClassValue } from "../_constants/project-class";

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
  searchParams: Record<string, string | string[]>;
}) {
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java の download メソッド
  async function handleDownload() {
    setDownloadError(null);
    try {
      const res = await apiGetBlob("/api/project/download", {
        pageNumber: (searchParams.pageNumber as string | undefined) ?? "1",
        clientId: searchParams.clientId as string | undefined,
        clientName: searchParams.clientName as string | undefined,
        projectName: searchParams.projectName as string | undefined,
        projectType: searchParams.projectType as "development" | "maintenance" | undefined,
        projectClass: toArray(searchParams.projectClass) as ProjectClassValue[] | undefined,
        projectStartDateBegin: searchParams.projectStartDateBegin as string | undefined,
        projectStartDateEnd: searchParams.projectStartDateEnd as string | undefined,
        projectEndDateBegin: searchParams.projectEndDateBegin as string | undefined,
        projectEndDateEnd: searchParams.projectEndDateEnd as string | undefined,
        sortKey: searchParams.sortKey as string | undefined,
        sortDir: searchParams.sortDir as string | undefined,
      });
      const blob = await res.blob();
      // Java 版はストリーミングレスポンスで CSV を返す。ここでは Blob API で同等の動作を再現
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // @see ProjectAction.java L240: response.setContentDisposition("プロジェクト一覧.csv")
      a.download = "プロジェクト一覧.csv";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setDownloadError("CSVダウンロードに失敗しました");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleDownload}
        className="btn btn-link p-0 ms-2"
      >
        ダウンロード
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/download.png" alt="ダウンロード" />
      </button>
      {downloadError && (
        <span className="message-error ms-2">{downloadError}</span>
      )}
    </>
  );
}
