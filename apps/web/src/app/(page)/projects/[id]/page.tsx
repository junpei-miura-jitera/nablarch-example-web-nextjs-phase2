import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const metadata: Metadata = { title: 'プロジェクト詳細画面' }
import type { ApiProjectDto } from ':/shared/api/project'

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:9090'
import { PROJECT_TYPE } from '../_constants/project-type'
import { PROJECT_CLASS } from '../_constants/project-class'
import { calculateProjectProfit, formatMoney, formatRate } from '../_utils/project-profit'
import { formatDate } from '../_utils/format-date'
import { parseProjectIdFromRouteSegment } from '../_utils/route-params'
import { BackButton } from '../_fragments/back-button'

/**
 * プロジェクト詳細画面。
 *
 * プロジェクトの全フィールドと収益計算結果を表示する。 サイドメニューなしで直接 section を配置する（detail.jsp と同一構造）。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/detail.jsp
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java#show (L252-271)
 */
export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const projectId = parseProjectIdFromRouteSegment(id)
  if (projectId === null) notFound()

  // プロジェクトを取得する
  const res = await fetch(`${API_BASE}/api/project/show?projectId=${projectId}`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  const project: ApiProjectDto = await res.json()

  // プロジェクトの収益指標を計算する
  const profit = calculateProjectProfit({
    sales: project.sales ?? null,
    costOfGoodsSold: project.costOfGoodsSold ?? null,
    sga: project.sga ?? null,
    allocationOfCorpExpenses: project.allocationOfCorpExpenses ?? null,
  })

  return (
    <section>
      {/* detail.jsp L25-33: タイトル + 変更/戻るボタン（上部） */}
      <div className="title-nav">
        <span className="page-title">プロジェクト詳細画面</span>
        <div className="button-nav">
          <div className="button-block real-button-block">
            <Link href={`/projects/${projectId}/edit`} className="btn btn-lg btn-success">
              変更
            </Link>
          </div>
          <div className="button-block link-button-block">
            <BackButton className="btn btn-lg btn-light" />
          </div>
        </div>
      </div>

      {/* detail.jsp L36: <n:errors> — 詳細画面はDB検索のみのためバリデーションエラーは発生しない。
         サーバーエラー時は Next.js の error.tsx が処理する */}
      <div className="message-area margin-top" />

      <h2 className="font-group mb-3">プロジェクト詳細</h2>

      {/* detail.jsp L41-197: プロジェクト詳細テーブル + 収益計算 */}
      <table className="table">
        <tbody>
          <tr>
            <th className="width-250">プロジェクト名</th>
            <td>{project.projectName}</td>
          </tr>
          <tr>
            <th>プロジェクト種別</th>
            <td>{PROJECT_TYPE[project.projectType as keyof typeof PROJECT_TYPE]}</td>
          </tr>
          <tr>
            <th>プロジェクト分類</th>
            <td>{PROJECT_CLASS[project.projectClass as keyof typeof PROJECT_CLASS]}</td>
          </tr>
          <tr>
            <th>プロジェクトマネージャー</th>
            <td>{project.projectManager ?? ''}</td>
          </tr>
          <tr>
            <th>プロジェクトリーダー</th>
            <td>{project.projectLeader ?? ''}</td>
          </tr>
          <tr>
            <th>顧客名</th>
            <td>
              {project.clientId ?? ''} {project.clientName ?? ''}
            </td>
          </tr>
          <tr>
            <th>プロジェクト開始日</th>
            <td>{formatDate(project.projectStartDate)}</td>
          </tr>
          <tr>
            <th>プロジェクト終了日</th>
            <td>{formatDate(project.projectEndDate)}</td>
          </tr>
          <tr>
            <th>備考</th>
            <td>{project.note ?? ''}</td>
          </tr>
          <tr>
            <th>売上高</th>
            <td>{project.sales != null ? `${formatMoney(project.sales)} 千円` : ''}</td>
          </tr>
          <tr>
            <th>売上原価</th>
            <td>
              {project.costOfGoodsSold != null
                ? `${formatMoney(project.costOfGoodsSold)} 千円`
                : ''}
            </td>
          </tr>
          <tr>
            <th>販管費</th>
            <td>{project.sga != null ? `${formatMoney(project.sga)} 千円` : ''}</td>
          </tr>
          <tr>
            <th>本社配賦</th>
            <td>
              {project.allocationOfCorpExpenses != null
                ? `${formatMoney(project.allocationOfCorpExpenses)} 千円`
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
              {profit.operatingProfit != null ? `${formatMoney(profit.operatingProfit)} 千円` : ''}
            </td>
          </tr>
          <tr>
            <td>営業利益率</td>
            <td>{formatRate(profit.operatingProfitRate)}</td>
          </tr>
        </tbody>
      </table>

      {/* detail.jsp L199-216: フッターボタン（上部と同一） */}
      <div className="title-nav page-footer">
        <div className="button-nav">
          <div className="button-block real-button-block">
            <Link href={`/projects/${projectId}/edit`} className="btn btn-lg btn-success">
              変更
            </Link>
          </div>
          <div className="button-block link-button-block">
            <BackButton className="btn btn-lg btn-light" />
          </div>
        </div>
      </div>
    </section>
  )
}
