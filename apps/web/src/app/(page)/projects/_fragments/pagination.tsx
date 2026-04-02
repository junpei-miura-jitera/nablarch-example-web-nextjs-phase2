import Link from 'next/link'

/**
 * ページネーション UI（Server Component）。
 *
 * 元の Java 版 `<app:listSearchResult>` カスタムタグのページング部分を再現する。
 *
 * 構成要素と対応元:
 *
 * - 「[n/Nページ]」表示 … listSearchPaging.tag L89-98 `pagination.pageNumber / pagination.pageCount`
 * - 「最初」ボタン … listSearchPaging.tag L102-111 `firstSubmitLabel="最初"` + `pagination.hasPrevPage`
 * - 「前へ」ボタン … listSearchPaging.tag L113-122 `prevSubmitLabel="前へ"`
 * - ページ番号リンク … listSearchPaging.tag L124-137 `forEach begin=1 end=pageCount`
 * - 「次へ」ボタン … listSearchPaging.tag L139-148 `nextSubmitLabel="次へ"` + `pagination.hasNextPage`
 * - 「最後」ボタン … listSearchPaging.tag L150-159 `lastSubmitLabel="最後"`
 *
 * CSS クラスは index.jsp L141-149 で指定されたもの:
 *
 * - `pagingCss="paging mb-3"`, `currentPageNumberCss="fs-5 mb-3 border-0"`
 * - `firstSubmitCss/prevSubmitCss/pageNumberSubmitCss/nextSubmitCss/lastSubmitCss="page-link"`
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/tags/listSearchResult/listSearchPaging.tag
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/index.jsp:139-154
 */
export function Pagination({
  currentPage,
  totalPages,
  buildUrl,
}: {
  currentPage: number
  totalPages: number
  buildUrl: (page: number) => string
}) {
  if (totalPages <= 0) return null

  const hasPrev = currentPage > 1
  const hasNext = currentPage < totalPages

  return (
    <div className="paging mb-3">
      {/* [現在ページ/総ページ数] — listSearchPaging.tag L89-98 */}
      <div className="fs-5 mb-3 border-0">
        [{currentPage}/{totalPages}ページ]
      </div>

      <ul className="pagination">
        {/* 最初 — listSearchPaging.tag L102-111 */}
        <li className={`page-item ${hasPrev ? '' : 'disabled'}`}>
          {hasPrev ? (
            <Link href={buildUrl(1)} className="page-link">
              最初
            </Link>
          ) : (
            <span className="page-link">最初</span>
          )}
        </li>

        {/* 前へ — listSearchPaging.tag L113-122 */}
        <li className={`page-item ${hasPrev ? '' : 'disabled'}`}>
          {hasPrev ? (
            <Link href={buildUrl(currentPage - 1)} className="page-link">
              前へ
            </Link>
          ) : (
            <span className="page-link">前へ</span>
          )}
        </li>

        {/* ページ番号 — listSearchPaging.tag L124-137: forEach begin=1 end=pageCount */}
        {/* Java版と同様に全ページ番号を表示する */}
        {totalPages > 1 &&
          Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
              {page === currentPage ? (
                <span className="page-link">{page}</span>
              ) : (
                <Link href={buildUrl(page)} className="page-link">
                  {page}
                </Link>
              )}
            </li>
          ))}

        {/* 次へ — listSearchPaging.tag L139-148 */}
        <li className={`page-item ${hasNext ? '' : 'disabled'}`}>
          {hasNext ? (
            <Link href={buildUrl(currentPage + 1)} className="page-link">
              次へ
            </Link>
          ) : (
            <span className="page-link">次へ</span>
          )}
        </li>

        {/* 最後 — listSearchPaging.tag L150-159 */}
        <li className={`page-item ${hasNext ? '' : 'disabled'}`}>
          {hasNext ? (
            <Link href={buildUrl(totalPages)} className="page-link">
              最後
            </Link>
          ) : (
            <span className="page-link">最後</span>
          )}
        </li>
      </ul>
    </div>
  )
}
