import { z } from 'zod'

/**
 * 詳細表示 endpoint のクエリパラメータスキーマ。
 */
export const projectShowSearchParamsSchema = z.object({
  projectId: z.coerce.number(),
})

/**
 * 詳細表示 endpoint のクエリパラメータ型。
 */
export type ProjectShowSearchParams = z.infer<typeof projectShowSearchParamsSchema>
