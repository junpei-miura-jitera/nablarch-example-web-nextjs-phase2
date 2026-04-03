import type { Metadata } from 'next'
import type { ApiProjectDto } from ':/shared/api/project'
import { API_BASE_URL } from ':/bases/env.server'
import { BulkEditForm } from './bulk-edit-form'
import { Pagination } from '../_fragments/pagination'
import { SaveListUrl } from '../_fragments/save-list-url'
import { ProjectSidemenuLayout } from '../_layouts/project-sidemenu-layout'
import type { ProjectClassValue } from '../_constants/project-class'
import { toArray, buildPageUrl } from '../_utils/search-params-helpers'

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
  const hasSearchParams = Object.keys(params).length > 0
  const sortKey = (params.sortKey as string | undefined) ?? 'id'
  const sortDir = (params.sortDir as string | undefined) ?? 'asc'
  const pageNumber = Number((params.pageNumber as string | undefined) ?? '1')

  const qs = new URLSearchParams()
  qs.set('pageNumber', String(pageNumber))
  qs.set('sortKey', sortKey)
  qs.set('sortDir', sortDir)
  if (params.clientId) qs.set('clientId', params.clientId as string)
  if (params.clientName) qs.set('clientName', params.clientName as string)
  if (params.projectName) qs.set('projectName', params.projectName as string)
  if (params.projectType) qs.set('projectType', params.projectType as string)
  for (const v of (toArray(params.projectClass) ?? []) as ProjectClassValue[]) {
    qs.append('projectClass', v)
  }
  if (params.projectStartDateBegin)
    qs.set('projectStartDateBegin', params.projectStartDateBegin as string)
  if (params.projectStartDateEnd)
    qs.set('projectStartDateEnd', params.projectStartDateEnd as string)
  if (params.projectEndDateBegin)
    qs.set('projectEndDateBegin', params.projectEndDateBegin as string)
  if (params.projectEndDateEnd) qs.set('projectEndDateEnd', params.projectEndDateEnd as string)

  const endpoint = hasSearchParams ? 'list' : 'index'
  const requestUrl = hasSearchParams
    ? `${API_BASE_URL}/api/projectbulk/${endpoint}?${qs}`
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
    <ProjectSidemenuLayout>
      <SaveListUrl />
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-body">
              <Pagination
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
    </ProjectSidemenuLayout>
  )
}
