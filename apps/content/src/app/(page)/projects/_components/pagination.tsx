import type { ReactNode } from 'react'

type PaginationLinkRenderer = (props: {
  href: string
  className: string
  children: ReactNode
}) => ReactNode

type ProjectPaginationViewProps = {
  currentPage: number
  totalPages: number
  buildUrl: (page: number) => string
  renderLink?: PaginationLinkRenderer
}

function DefaultPaginationLink({
  href,
  className,
  children,
}: {
  href: string
  className: string
  children: ReactNode
}) {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  )
}

/**
 * Storybook でも扱いやすいプレゼンテーション用のページネーション。
 *
 * Next.js の `Link` には依存せず、必要な場合だけ呼び出し側でリンク描画を差し替える。
 */
export function ProjectPaginationView({
  currentPage,
  totalPages,
  buildUrl,
  renderLink,
}: ProjectPaginationViewProps) {
  if (totalPages <= 0) return null

  const hasPrev = currentPage > 1
  const hasNext = currentPage < totalPages
  const LinkRenderer = renderLink ?? DefaultPaginationLink

  return (
    <div className="paging mb-3">
      <div className="fs-5 mb-3 border-0">
        [{currentPage}/{totalPages}ページ]
      </div>

      <ul className="pagination">
        <li className={hasPrev ? '' : 'disabled'}>
          {hasPrev ? (
            <LinkRenderer href={buildUrl(1)} className="page-link">
              最初
            </LinkRenderer>
          ) : (
            <a className="page-link" href="#">
              最初
            </a>
          )}
        </li>

        <li className={hasPrev ? '' : 'disabled'}>
          {hasPrev ? (
            <LinkRenderer href={buildUrl(currentPage - 1)} className="page-link">
              前へ
            </LinkRenderer>
          ) : (
            <a className="page-link" href="#">
              前へ
            </a>
          )}
        </li>

        {totalPages > 1 &&
          Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <li key={page} className={page === currentPage ? 'active' : undefined}>
              {page === currentPage ? (
                <a className="page-link" href="#">
                  {page}
                </a>
              ) : (
                <LinkRenderer href={buildUrl(page)} className="page-link">
                  {page}
                </LinkRenderer>
              )}
            </li>
          ))}

        <li className={hasNext ? '' : 'disabled'}>
          {hasNext ? (
            <LinkRenderer href={buildUrl(currentPage + 1)} className="page-link">
              次へ
            </LinkRenderer>
          ) : (
            <a className="page-link" href="#">
              次へ
            </a>
          )}
        </li>

        <li className={hasNext ? '' : 'disabled'}>
          {hasNext ? (
            <LinkRenderer href={buildUrl(totalPages)} className="page-link">
              最後
            </LinkRenderer>
          ) : (
            <a className="page-link" href="#">
              最後
            </a>
          )}
        </li>
      </ul>
    </div>
  )
}
