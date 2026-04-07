import type { Metadata } from 'next'
import type { ApiProjectDto } from ':/app/(page)/projects/_utils/api/project'
import { API_BASE_URL } from ':/bases/env.server'
import { LayoutFooter } from '../_components/layouts/layout-footer'
import { LayoutHeader } from '../_components/layouts/layout-header'
import { LayoutSideMenu } from '../_components/layouts/layout-side-menu'
import { BulkEditForm } from './bulk-edit-form'
import { ProjectPagination } from '../_fragments/pagination'
import { SaveListUrl } from '../_fragments/save-list-url'
import {
  buildPageUrl,
  buildProjectSearchParams,
  normalizeProjectSearchParams,
} from '../_utils/search-params-helpers'

/**
 * プロジェクト検索一覧更新画面のメタデータ。
 */
export const metadata: Metadata = {
  title: 'プロジェクト検索一覧更新画面',
}

/**
 * ページサイズ。
 */
const PAGE_SIZE = 20

/**
 * プロジェクト一括更新画面。
 *
 * 元 JSP と同様に searchParams から検索条件・ソート・ページを受け取り、 サーバーサイドで API に渡す。
 *
 * 現時点では MSW モックがページネーション非対応のため、 API が返す全件をサーバーサイドでスライスして擬似ページングを行う。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/projectBulk/update.jsp
 */
export default async function BulkUpdatePage({
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
  const queryParams = buildProjectSearchParams(params, {
    pageNumber: String(pageNumber),
    sortKey,
    sortDir,
  })

  const endpoint = hasSearchParams ? 'list' : 'index'
  const requestUrl = hasSearchParams
    ? `${API_BASE_URL}/api/projectbulk/${endpoint}?${queryParams}`
    : `${API_BASE_URL}/api/projectbulk/${endpoint}`

  const res = await fetch(requestUrl, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  const allProjects: ApiProjectDto[] = (await res.json()) ?? []

  // 擬似ページング（projects/page.tsx と同じ方式）
  // MSW が全件返すのでサーバーサイドでスライス。
  // バックエンド接続時はこのスライス処理を削除し、API レスポンスの
  // pagination オブジェクトから totalCount (resultCount) / pageCount を取得する。
  // @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectBulkAction.java#list
  const totalCount = allProjects.length
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const currentPage = Math.min(Math.max(1, pageNumber), totalPages)
  const startIdx = (currentPage - 1) * PAGE_SIZE
  const projects = allProjects.slice(startIdx, startIdx + PAGE_SIZE)

  return (
    <>
      <LayoutHeader />
      <SaveListUrl />
      <div className="container-fluid mainContents">
        <div className="row">
          <LayoutSideMenu />
          <div className="pages col-md-10">
            <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-body">
                    <ProjectPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      buildUrl={(page) => buildPageUrl('/projects/bulk', params, page)}
                    />
                    <BulkEditForm
                      projects={projects}
                      totalCount={totalCount}
                      sortKey={sortKey}
                      sortDir={sortDir}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <LayoutFooter />
    </>
  )
}
