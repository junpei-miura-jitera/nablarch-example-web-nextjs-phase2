/**
 * Date 文字列を yyyy/MM/dd 形式にフォーマットする（元の JSP の n:formatByDefault 相当）。
 * UTC→ローカル変換ズレを避けるため、new Date() を使わず手動パースする。
 *
 * @see _references/nablarch-example-web/src/main/webapp/WEB-INF/view/project/detail.jsp:152-155 — n:formatByDefault('dateTime', ...)
 */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  // "2024-01-15" → "2024/01/15" — UTC→ローカル変換ズレを避けるため手動パース
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[1]}/${match[2]}/${match[3]}`;
  return value;
}
