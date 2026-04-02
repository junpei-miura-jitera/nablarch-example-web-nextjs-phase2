/**
 * プロジェクト収益計算結果の型。
 */
export type ProjectProfit = {
  grossProfit: number | null
  profitBeforeAllocation: number | null
  profitRateBeforeAllocation: number | null
  operatingProfit: number | null
  operatingProfitRate: number | null
}
