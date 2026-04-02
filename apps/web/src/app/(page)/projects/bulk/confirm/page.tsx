import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata: Metadata = { title: 'プロジェクト検索一覧更新画面' }
import type { ApiProjectBulkItemValues } from ':/shared/api/project-bulk'
import { PROJECT_TYPE } from '../../_constants/project-type'
import { loadProjectFormFromCookieServer } from '../../_utils/cookie-helpers.server'
import { formatDate } from '../../_utils/format-date'
import { ConfirmBulkButton } from './confirm-bulk-button'

/**
 * プロジェクト一括更新確認画面。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/projectBulk/confirmOfUpdate.jsp
 */
export default async function BulkConfirmPage() {
  const formData = await loadProjectFormFromCookieServer()
  if (!formData || !formData.projectList) redirect('/projects/bulk')
  const items = formData.projectList as ApiProjectBulkItemValues[]
  if (items.length === 0) redirect('/projects/bulk')

  return (
    <section>
      <div className="title-nav">
        <span>プロジェクト検索一覧更新画面</span>
        <div className="button-nav">
          {/* confirmOfUpdate.jsp L25: backToList → Cookie からデータを復元するために ?restore=1 を付与 */}
          <Link href="/projects/bulk?restore=1" className="btn btn-lg btn-light">
            入力へ戻る
          </Link>
          <ConfirmBulkButton items={items} />
        </div>
      </div>

      <h2 className="font-group my-3">プロジェクト変更一覧</h2>

      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>プロジェクトID</th>
            <th>プロジェクト名</th>
            <th>プロジェクト種別</th>
            <th>開始日</th>
            <th>終了日</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.projectId}>
              <td>{item.projectId}</td>
              <td>{item.projectName}</td>
              <td>
                {PROJECT_TYPE[item.projectType as keyof typeof PROJECT_TYPE] ?? item.projectType}
              </td>
              <td>{formatDate(item.projectStartDate)}</td>
              <td>{formatDate(item.projectEndDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="title-nav page-footer">
        <div className="button-nav">
          <Link href="/projects/bulk?restore=1" className="btn btn-lg btn-light">
            入力へ戻る
          </Link>
          <ConfirmBulkButton items={items} />
        </div>
      </div>
    </section>
  )
}
