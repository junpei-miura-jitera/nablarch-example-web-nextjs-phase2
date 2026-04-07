import Link from 'next/link'
import { ProjectPaginationView } from ':/app/(page)/projects/_components/pagination'

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
export function ProjectPagination({
  currentPage,
  totalPages,
  buildUrl,
}: {
  currentPage: number
  totalPages: number
  buildUrl: (page: number) => string
}) {
  return (
    <ProjectPaginationView
      currentPage={currentPage}
      totalPages={totalPages}
      buildUrl={buildUrl}
      renderLink={({ href, className, children }) => (
        <Link href={href} className={className}>
          {children}
        </Link>
      )}
    />
  )
}
