import { z } from 'zod'

/**
 * 編集初期表示 endpoint のクエリパラメータスキーマ。
 */
export const projectEditSearchParamsSchema = z.object({
  projectId: z.coerce.number(),
})

/**
 * 編集初期表示 endpoint のクエリパラメータ型。
 */
export type ProjectEditSearchParams = z.infer<typeof projectEditSearchParamsSchema>
