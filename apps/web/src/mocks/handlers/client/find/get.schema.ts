/**
 * 顧客検索 endpoint のクエリ schema。
 *
 * 旧 `mocks/handlers/client/handlers.ts` に埋め込まれていた検索パラメータ定義を
 * endpoint 専用ファイルへ切り出している。
 */
import { z } from 'zod'

/**
 * 顧客検索 endpoint のクエリパラメータスキーマ。
 */
export const clientFindSearchParamsSchema = z.object({
  clientName: z.string().optional(),
  industryCode: z.string().optional(),
  sortKey: z.enum(['id', 'name']).optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
})

/**
 * 顧客検索 endpoint のクエリパラメータ型。
 */
export type ClientFindSearchParams = z.infer<typeof clientFindSearchParamsSchema>
