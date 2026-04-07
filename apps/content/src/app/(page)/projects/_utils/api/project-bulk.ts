import { z } from 'zod'

export const apiProjectBulkItemSchema = z.object({
  projectId: z.string(),
  projectName: z.string().min(1, 'プロジェクト名を入力してください。'),
  projectType: z.enum(['development', 'maintenance']),
  projectStartDate: z.string().optional(),
  projectEndDate: z.string().optional(),
})

export type ApiProjectBulkItemValues = z.infer<typeof apiProjectBulkItemSchema>

export const apiProjectBulkFormSchema = z.object({
  projectList: z.array(apiProjectBulkItemSchema),
})

export type ApiProjectBulkFormValues = z.infer<typeof apiProjectBulkFormSchema>
