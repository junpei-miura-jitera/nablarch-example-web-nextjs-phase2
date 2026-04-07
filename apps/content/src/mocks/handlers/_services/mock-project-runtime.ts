import type { ApiProjectDto } from ':/app/(page)/projects/_utils/api/project'
import { clientFixtures } from './mock-client-runtime'
import { readMockCsvRows } from './mock-csv'

export type MockProjectRecord = Required<ApiProjectDto>

function toNumber(value: string): number {
  return value === '' ? 0 : Number(value)
}

const clientNameById = new Map(clientFixtures.map((client) => [client.clientId, client.clientName]))
const projectRows = readMockCsvRows(import.meta.url, '../project/_data/PROJECT.csv')

export const projectFixtures: MockProjectRecord[] = projectRows.map((row, index) => ({
  projectId: index + 1,
  projectName: row.PROJECT_NAME,
  projectType: row.PROJECT_TYPE as MockProjectRecord['projectType'],
  projectClass: row.PROJECT_CLASS as MockProjectRecord['projectClass'],
  projectStartDate: row.PROJECT_START_DATE,
  projectEndDate: row.PROJECT_END_DATE,
  clientId: Number(row.CLIENT_ID),
  clientName: clientNameById.get(Number(row.CLIENT_ID)) ?? '',
  projectManager: row.PROJECT_MANAGER,
  projectLeader: row.PROJECT_LEADER,
  userId: Number(row.USER_ID),
  note: row.NOTE,
  sales: toNumber(row.SALES),
  costOfGoodsSold: toNumber(row.COST_OF_GOODS_SOLD),
  sga: toNumber(row.SGA),
  allocationOfCorpExpenses: toNumber(row.ALLOCATION_OF_CORP_EXPENSES),
  version: toNumber(row.VERSION),
}))

export function buildMockProjectCsv(projects: MockProjectRecord[]): string {
  const header =
    'プロジェクトID,プロジェクト名,プロジェクト種別,プロジェクト分類,プロジェクトマネージャー,プロジェクトリーダー,顧客ID,顧客名,プロジェクト開始日,プロジェクト終了日,備考,売上高,売上原価,販管費,本社配賦'
  const rows = projects.map((project) =>
    [
      project.projectId,
      `"${project.projectName}"`,
      project.projectType,
      project.projectClass,
      `"${project.projectManager}"`,
      `"${project.projectLeader}"`,
      project.clientId,
      `"${project.clientName}"`,
      project.projectStartDate,
      project.projectEndDate,
      `"${project.note}"`,
      project.sales,
      project.costOfGoodsSold,
      project.sga,
      project.allocationOfCorpExpenses,
    ].join(','),
  )

  return [header, ...rows].join('\n')
}

export const buildProjectCsv = buildMockProjectCsv
