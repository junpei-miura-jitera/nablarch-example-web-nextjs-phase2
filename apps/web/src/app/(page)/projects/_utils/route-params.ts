/**
 * 動的ルート `[id]` のセグメントを正の整数のプロジェクト ID として解釈する。
 *
 * `Number` で数値化し、`Number.isInteger` と正規表記チェック（`String(n) === id`）で 先頭ゼロ・小数・指数表記などを拒否する。
 */
export function parseProjectIdFromRouteSegment(id: string): number | null {
  const n = Number(id)
  if (Number.isNaN(n) || !Number.isInteger(n) || n <= 0) return null
  if (String(n) !== id) return null
  return n
}
