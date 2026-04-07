import { z } from 'zod'
import { apiProjectUpdateFormSchema } from ':/app/(page)/projects/_utils/api/project'

/**
 * 更新実行 endpoint の入力スキーマ。
 */
export const projectUpdatePostSchema = apiProjectUpdateFormSchema.extend({
  projectId: z.union([z.string(), z.number()]).optional(),
})

/**
 * 更新実行 endpoint の入力値型。
 */
export type ApiProjectUpdatePostValues = z.infer<typeof projectUpdatePostSchema>
