import { z } from 'zod'

/**
 * 削除実行 endpoint の入力スキーマ。
 */
export const projectDeletePostSchema = z.object({
  projectId: z.union([z.string(), z.number()]).optional(),
})

/**
 * 削除実行 endpoint の入力値型。
 */
export type ProjectDeletePostValues = z.infer<typeof projectDeletePostSchema>
