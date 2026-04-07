type ProjectProfit = {
  grossProfit: number | null
  profitBeforeAllocation: number | null
  profitRateBeforeAllocation: number | null
  operatingProfit: number | null
  operatingProfitRate: number | null
}

/**
 * プロジェクトの収益指標を計算する。
 *
 * 売上高・原価・販管費・本社配賦から、粗利・配賦前利益・営業利益とその利益率を算出する。 利益率の丸めは Java の RoundingMode.DOWN（ゼロ方向切捨て）に合わせて
 * Math.trunc を使用する。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/detail.jsp:160-197
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/dto/ProjectProfit.java
 */
export function calculateProjectProfit(params: {
  sales: number | null
  costOfGoodsSold: number | null
  sga: number | null
  allocationOfCorpExpenses: number | null
}): ProjectProfit {
  const { sales, costOfGoodsSold, sga, allocationOfCorpExpenses } = params

  if (sales == null || costOfGoodsSold == null) {
    return {
      grossProfit: null,
      profitBeforeAllocation: null,
      profitRateBeforeAllocation: null,
      operatingProfit: null,
      operatingProfitRate: null,
    }
  }

  const grossProfit = sales - costOfGoodsSold
  const profitBeforeAllocation = sga != null ? sales - costOfGoodsSold - sga : null
  // @see ProjectProfit.java: sales=0 のとき ArithmeticException を catch し BigDecimal.ZERO を返す
  const profitRateBeforeAllocation =
    profitBeforeAllocation != null
      ? sales !== 0
        ? Math.trunc((profitBeforeAllocation / sales) * 1000) / 1000
        : 0
      : null
  const operatingProfit =
    sga != null && allocationOfCorpExpenses != null
      ? sales - costOfGoodsSold - sga - allocationOfCorpExpenses
      : null
  const operatingProfitRate =
    operatingProfit != null
      ? sales !== 0
        ? Math.trunc((operatingProfit / sales) * 1000) / 1000
        : 0
      : null

  return {
    grossProfit,
    profitBeforeAllocation,
    profitRateBeforeAllocation,
    operatingProfit,
    operatingProfitRate,
  }
}

/**
 * 金額を千円単位でカンマ区切りフォーマットする。
 */
export function formatMoney(value: number | null): string {
  if (value == null) return ''
  return value.toLocaleString('ja-JP')
}

/**
 * 利益率を百分率（小数点1桁）でフォーマットする。
 */
export function formatRate(value: number | null): string {
  if (value == null) return ''
  // 浮動小数点の * 100 で誤差が出る可能性を排除するため、整数演算で切捨てしてからフォーマット
  // @see detail.jsp: n:format('number', rate, '##0.0 %') — Java DecimalFormat は値を100倍して表示
  return `${Math.trunc(value * 1000) / 10} %`
}
