import { z } from 'zod'
import { apiProjectFormSchema } from ':/app/(page)/projects/_utils/api/project'

/**
 * JSON 経由アップロードの入力スキーマ。
 */
export const projectUploadJsonSchema = z.object({
  projectList: z.array(apiProjectFormSchema).optional(),
})

/**
 * JSON 経由アップロードの入力値型。
 */
export type ApiProjectUploadJsonValues = z.infer<typeof projectUploadJsonSchema>
