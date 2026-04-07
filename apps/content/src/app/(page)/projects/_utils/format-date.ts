/**
 * Date 文字列を Java 側の表示に合わせて yyyy/MM/dd 形式へ整形する。
 *
 * UTC→ローカル変換ズレを避けるため、`new Date()` は使わず手動でパースする。
 *
 * @see apps-legacy/nablarch-example-web/src/main/webapp/WEB-INF/view/project/index.jsp
 * @see apps-legacy/nablarch-example-web/src/main/java/com/nablarch/example/app/entity/core/validation/validator/ExampleDomainType.java
 */
export function formatDate(value: string | null | undefined): string {
  if (!value) return ''
  const match = value.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/)
  if (match) {
    const month = match[2].padStart(2, '0')
    const day = match[3].padStart(2, '0')
    return `${match[1]}/${month}/${day}`
  }
  return value
}

/**
 * 入力や API 送信用に日付を yyyy-MM-dd へ正規化する。
 */
export function normalizeDateForApi(value: string | null | undefined): string {
  if (!value) return ''
  const match = value.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/)
  if (!match) return value
  const month = match[2].padStart(2, '0')
  const day = match[3].padStart(2, '0')
  return `${match[1]}-${month}-${day}`
}
