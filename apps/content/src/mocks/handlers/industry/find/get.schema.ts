/**
 * 業種検索 endpoint のクエリ schema。
 *
 * 旧 `mocks/handlers/client/handlers.ts` に埋め込まれていた業種検索条件を endpoint 専用ファイルへ切り出している。
 */
import { z } from 'zod'

/**
 * 業種検索 endpoint のクエリパラメータスキーマ。
 */
export const industryFindSearchParamsSchema = z.object({
  industryCode: z.string().optional(),
  industryName: z.string().optional(),
})

/**
 * 業種検索 endpoint のクエリパラメータ型。
 */
export type IndustryFindSearchParams = z.infer<typeof industryFindSearchParamsSchema>
