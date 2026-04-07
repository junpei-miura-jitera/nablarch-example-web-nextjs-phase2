import type { Metadata } from 'next'
import Link from 'next/link'
import type { ApiProjectDto } from ':/app/(page)/projects/_utils/api/project'
import { API_BASE_URL } from ':/bases/env.server'
import { apiProjectSearchFormSchema } from ':/app/(page)/projects/_utils/api/project'
import { PROJECT_TYPE } from ':/app/(page)/projects/_utils/project-type'
import { formatDate } from ':/app/(page)/projects/_utils/format-date'
import { LayoutHeader } from './_components/layouts/layout-header'
import { LayoutSideMenu } from './_components/layouts/layout-side-menu'
import { SortSelect } from './_fragments/sort-select'
import { DownloadButton } from './_fragments/download-button'
import { ProjectPagination } from './_fragments/pagination'
import { SaveListUrl } from './_fragments/save-list-url'
import {
  buildPageUrl,
  buildProjectSearchParams,
  normalizeProjectSearchParams,
} from './_utils/search-params-helpers'

/**
 * プロジェクト検索一覧画面のメタデータ。
 */
export const metadata: Metadata = {
  title: 'プロジェクト検索一覧画面',
}

/**
 * プロジェクト検索一覧ページ。
 *
 * 元の Java 版と同様に、ソート条件・ページ番号は URL クエリパラメータで サーバーサイドに渡し、サーバーがソート済みの結果を返す。
 *
 * 現時点では MSW モックがページネーション非対応のため、 API が返す全件をサーバーサイドでスライスして擬似ページングを行う。
 * バックエンド接続時にスライス処理を削除すれば本来のサーバーサイドページングに切り替わる。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/index.jsp
 */

/**
 * ページサイズ。
 */
const PAGE_SIZE = 20

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>
}) {
  const params = await searchParams
  const normalizedParams = normalizeProjectSearchParams(params)
  const hasSearchParams = Object.keys(params).length > 0
  const sortKey = normalizedParams.sortKey ?? 'id'
  const sortDir = normalizedParams.sortDir ?? 'asc'
  const pageNumber = Number(normalizedParams.pageNumber ?? '1')
  const validatedSearchParams = apiProjectSearchFormSchema.safeParse(normalizedParams)
  const projectNameError = validatedSearchParams.success
    ? undefined
    : validatedSearchParams.error.flatten().fieldErrors.projectName?.[0]
  const queryParams = buildProjectSearchParams(params, {
    pageNumber: String(pageNumber),
    sortKey,
    sortDir,
  })

  let allProjects: ApiProjectDto[] = []
  if (validatedSearchParams.success) {
    const endpoint = hasSearchParams ? 'list' : 'index'
    const requestUrl = hasSearchParams
      ? `${API_BASE_URL}/api/project/${endpoint}?${queryParams}`
      : `${API_BASE_URL}/api/project/${endpoint}`

    const res = await fetch(requestUrl, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`API error ${res.status}`)
    const data: ApiProjectDto[] | null = await res.json()
    allProjects = data ?? []
  }

  // 擬似ページング: MSW が全件返すのでサーバーサイドでスライス。
  // 本来は Nablarch の UniversalDao#findAllBySqlFile が
  // SqlResultSet（pagination 付き）を返し、Action がそのまま JSP に渡す。
  // バックエンド接続時はこのスライス処理を削除し、API レスポンスの
  // pagination オブジェクトから totalCount/pageCount を取得する。
  // @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java#list
  const totalCount = allProjects.length
  const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / PAGE_SIZE)
  const currentPage = totalPages === 0 ? 1 : Math.min(Math.max(1, pageNumber), totalPages)
  const startIdx = totalPages === 0 ? 0 : (currentPage - 1) * PAGE_SIZE
  const projects = allProjects.slice(startIdx, startIdx + PAGE_SIZE)

  return (
    <>
      <LayoutHeader />
      <SaveListUrl />
      <div className="container-fluid mainContents">
        <div className="row">
          <LayoutSideMenu projectNameError={projectNameError} />
          <div className="pages col-md-10">
            <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-body">
              {/* title-nav */}
              <div className="title-nav">
                <span>プロジェクト検索一覧画面</span>
                <div className="button-nav">
                  <Link href="/projects/new" className="btn btn-lg btn-light">
                    新規登録
                  </Link>
                </div>
              </div>

              {/* n:errors filter="global" に対応するグローバルエラーメッセージ表示領域 */}
              <div className="message-area margin-top"></div>

              {/* Java 版の index() は初期表示時点で searchResult を設定するため、一覧は常に表示する。 */}
              {validatedSearchParams.success && (
                <>
                {/* sort-nav */}
                <div className="sort-nav mb-3">
                  <div style={{ float: 'left' }}>
                    <span className="font-group">{'検索結果 '}</span>
                    <span className="search-result-count">{` ${totalCount} `}</span>
                    <DownloadButton searchParams={params} />
                  </div>
                  <SortSelect sortKey={sortKey} sortDir={sortDir} />
                </div>

                {/* ページネーション（テーブル上部） */}
                <ProjectPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  buildUrl={(page) => buildPageUrl('/projects', params, page)}
                />

                {/* 検索結果テーブル */}
                <table className="table table-striped table-hover">
                  <tbody>
                    <tr>
                      <th>プロジェクトID</th>
                      <th>プロジェクト名</th>
                      <th>プロジェクト種別</th>
                      <th>開始日</th>
                      <th>終了日</th>
                    </tr>
                    {projects.map((project) => (
                      <tr key={project.projectId} className="info">
                        <td>
                          <Link href={`/projects/${project.projectId}`}>{project.projectId}</Link>
                        </td>
                        <td>{project.projectName}</td>
                        <td>
                          {PROJECT_TYPE[project.projectType as keyof typeof PROJECT_TYPE] ??
                            project.projectType}
                        </td>
                        <td>{formatDate(project.projectStartDate)}</td>
                        <td>{formatDate(project.projectEndDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </>
              )}

              {/* page-footer */}
              <div className="title-nav page-footer">
                <div className="button-nav">
                  <Link href="/projects/new" className="btn btn-lg btn-light">
                    新規登録
                  </Link>
                </div>
              </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
