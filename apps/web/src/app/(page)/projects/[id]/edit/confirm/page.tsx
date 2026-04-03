import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { apiProjectUpdateFormSchema } from ':/shared/api/project'
import { ProjectSidemenuLayout } from '../../../_layouts/project-sidemenu-layout'
import { PROJECT_CLASS } from '../../../_constants/project-class'
import { PROJECT_TYPE } from '../../../_constants/project-type'
import { calculateProjectProfit, formatMoney, formatRate } from '../../../_utils/project-profit'
import { formatDate } from '../../../_utils/format-date'
import { loadProjectFormFromCookieServer } from '../../../_utils/cookie-helpers.server'
import { parseProjectIdFromRouteSegment } from '../../../_utils/route-params'
import { ConfirmUpdateButton } from './confirm-update-button'

/**
 * プロジェクト変更画面のメタデータ。
 */
export const metadata: Metadata = {
  title: 'プロジェクト変更画面',
}

/**
 * プロジェクト変更確認画面。
 *
 * Cookie に保存されたフォームデータを表示し、確定ボタンで API に送信する。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/confirmOfUpdate.jsp
 */
export default async function ConfirmUpdatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const projectId = parseProjectIdFromRouteSegment(id)
  if (projectId === null) notFound()
  const rawFormData = await loadProjectFormFromCookieServer()
  if (!rawFormData) redirect(`/projects/${projectId}/edit`)
  const parsed = apiProjectUpdateFormSchema.safeParse(rawFormData)
  if (!parsed.success) redirect(`/projects/${projectId}/edit`)
  const cookieProjectId = Number(rawFormData.projectId as string | number | undefined)
  const cookieVersion = Number(rawFormData.version as string | number | undefined)
  if (!Number.isInteger(cookieProjectId) || cookieProjectId !== projectId) {
    redirect(`/projects/${projectId}/edit`)
  }
  if (!Number.isInteger(cookieVersion) || cookieVersion < 1) {
    redirect(`/projects/${projectId}/edit`)
  }
  const formData = {
    ...parsed.data,
    projectId: cookieProjectId,
    version: cookieVersion,
  }

  const profit = calculateProjectProfit({
    sales: formData.sales ? Number(formData.sales) : null,
    costOfGoodsSold: formData.costOfGoodsSold ? Number(formData.costOfGoodsSold) : null,
    sga: formData.sga ? Number(formData.sga) : null,
    allocationOfCorpExpenses: formData.allocationOfCorpExpenses
      ? Number(formData.allocationOfCorpExpenses)
      : null,
  })

  return (
    <ProjectSidemenuLayout>
      <div className="title-nav">
        <span className="page-title">プロジェクト変更画面</span>
        <div className="button-nav">
          <Link href={`/projects/${projectId}/edit`} className="btn btn-lg btn-light">
            入力へ戻る
          </Link>
          <ConfirmUpdateButton projectId={projectId} formData={formData} />
        </div>
      </div>

      <section>
        <h2 className="font-group mb-3">プロジェクト詳細</h2>
        <table className="table">
          <tbody>
            <tr>
              <th className="required width-250">プロジェクト名</th>
              <td>{formData.projectName as string}</td>
            </tr>
            <tr>
              <th className="required width-250">プロジェクト種別</th>
              <td>{PROJECT_TYPE[formData.projectType as string as keyof typeof PROJECT_TYPE]}</td>
            </tr>
            <tr>
              <th className="required width-250">プロジェクト分類</th>
              <td>
                {PROJECT_CLASS[formData.projectClass as string as keyof typeof PROJECT_CLASS]}
              </td>
            </tr>
            <tr>
              <th className="width-250">プロジェクトマネージャー</th>
              <td>{(formData.projectManager as string) || ''}</td>
            </tr>
            <tr>
              <th className="width-250">プロジェクトリーダー</th>
              <td>{(formData.projectLeader as string) || ''}</td>
            </tr>
            {/* — update.jsp: clientId + clientName を同一セルに並置 */}
            <tr>
              <th className="required width-250">顧客名</th>
              <td>
                {String(formData.clientId)} {(formData.clientName as string) || ''}
              </td>
            </tr>
            <tr>
              <th className="width-250">プロジェクト開始日</th>
              <td>{formatDate(formData.projectStartDate as string)}</td>
            </tr>
            <tr>
              <th className="width-250">プロジェクト終了日</th>
              <td>{formatDate(formData.projectEndDate as string)}</td>
            </tr>
            <tr>
              <th className="width-250">備考</th>
              <td>{(formData.note as string) || ''}</td>
            </tr>
            <tr>
              <th className="width-250">売上高</th>
              <td>{formData.sales ? `${formatMoney(Number(formData.sales))} 千円` : ''}</td>
            </tr>
            <tr>
              <th className="width-250">売上原価</th>
              <td>
                {formData.costOfGoodsSold
                  ? `${formatMoney(Number(formData.costOfGoodsSold))} 千円`
                  : ''}
              </td>
            </tr>
            <tr>
              <th className="width-250">販管費</th>
              <td>{formData.sga ? `${formatMoney(Number(formData.sga))} 千円` : ''}</td>
            </tr>
            <tr>
              <th className="width-250">本社配賦</th>
              <td>
                {formData.allocationOfCorpExpenses
                  ? `${formatMoney(Number(formData.allocationOfCorpExpenses))} 千円`
                  : ''}
              </td>
            </tr>
            <tr>
              <td>売上総利益</td>
              <td>{profit.grossProfit != null ? `${formatMoney(profit.grossProfit)} 千円` : ''}</td>
            </tr>
            <tr>
              <td>配賦前利益</td>
              <td>
                {profit.profitBeforeAllocation != null
                  ? `${formatMoney(profit.profitBeforeAllocation)} 千円`
                  : ''}
              </td>
            </tr>
            <tr>
              <td>配賦前利益率</td>
              <td>{formatRate(profit.profitRateBeforeAllocation)}</td>
            </tr>
            <tr>
              <td>営業利益</td>
              <td>
                {profit.operatingProfit != null
                  ? `${formatMoney(profit.operatingProfit)} 千円`
                  : ''}
              </td>
            </tr>
            <tr>
              <td>営業利益率</td>
              <td>{formatRate(profit.operatingProfitRate)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <div className="title-nav page-footer">
        <div className="button-nav">
          <Link href={`/projects/${projectId}/edit`} className="btn btn-lg btn-light">
            入力へ戻る
          </Link>
          <ConfirmUpdateButton projectId={projectId} formData={formData} />
        </div>
      </div>
    </ProjectSidemenuLayout>
  )
}
