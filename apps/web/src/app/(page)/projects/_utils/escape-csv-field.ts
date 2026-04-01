/**
 * CSV フィールド値をエスケープする。
 *
 * カンマ・ダブルクォート・改行を含む値をダブルクォートで囲み、
 * 内部のダブルクォートを二重化する。
 */
export function escapeCsvField(value: string | number | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
