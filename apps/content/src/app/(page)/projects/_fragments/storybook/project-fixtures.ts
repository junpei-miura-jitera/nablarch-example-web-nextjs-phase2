import type { ApiClientDto, ApiIndustryDto } from ':/app/(page)/projects/_utils/api/client'
import type { ApiProjectFormValues } from ':/app/(page)/projects/_utils/api/project'

export const defaultProjectFormValues: ApiProjectFormValues = {
  projectName: '次世代プロジェクト管理システム',
  projectType: 'development',
  projectClass: 'a',
  projectManager: '山田太郎',
  projectLeader: '佐藤花子',
  clientId: '10000001',
  clientName: 'TIS株式会社',
  projectStartDate: '2026/04/01',
  projectEndDate: '2027/03/31',
  note: 'Storybook 用のサンプルデータです。',
  sales: '120000',
  costOfGoodsSold: '80000',
  sga: '15000',
  allocationOfCorpExpenses: '5000',
}

export const storyIndustries: ApiIndustryDto[] = [
  { industryCode: 'it', industryName: '情報通信' },
  { industryCode: 'finance', industryName: '金融' },
  { industryCode: 'public', industryName: '公共' },
]

export const storyClients: ApiClientDto[] = [
  {
    clientId: 10000001,
    clientName: 'TIS株式会社',
    industryCode: 'it',
    industryName: '情報通信',
  },
  {
    clientId: 10000002,
    clientName: 'サンプル銀行',
    industryCode: 'finance',
    industryName: '金融',
  },
  {
    clientId: 10000003,
    clientName: '公共ソリューション庁',
    industryCode: 'public',
    industryName: '公共',
  },
]
