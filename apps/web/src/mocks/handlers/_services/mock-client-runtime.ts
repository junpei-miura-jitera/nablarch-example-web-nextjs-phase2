import type { ApiClientDto, ApiIndustryDto } from ':/shared/api/client'
import { readMockCsvRows } from './mock-csv'

const industryRows = readMockCsvRows(import.meta.url, '../client/_data/INDUSTRY.csv')

export const industryFixtures: ApiIndustryDto[] = industryRows.map((row) => ({
  industryCode: row.INDUSTRY_CODE,
  industryName: row.INDUSTRY_NAME,
}))

const industryNameByCode = new Map(
  industryFixtures.map((industry) => [industry.industryCode, industry.industryName]),
)

const clientRows = readMockCsvRows(import.meta.url, '../client/_data/CLIENT.csv')

export const clientFixtures: ApiClientDto[] = clientRows.map((row) => ({
  clientId: Number(row.CLIENT_ID),
  clientName: row.CLIENT_NAME,
  industryCode: row.INDUSTRY_CODE,
  industryName: industryNameByCode.get(row.INDUSTRY_CODE) ?? '',
}))
