import { z } from 'zod'

const apiProjectTypeSchema = z.enum(['development', 'maintenance'])
const apiProjectClassSchema = z.enum(['ss', 's', 'a', 'b', 'c', 'd'])

export const apiProjectDtoSchema = z.object({
  projectId: z.number().optional(),
  projectName: z.string().optional(),
  projectType: apiProjectTypeSchema.optional(),
  projectClass: apiProjectClassSchema.optional(),
  projectStartDate: z.string().optional(),
  projectEndDate: z.string().optional(),
  clientId: z.number().optional(),
  clientName: z.string().optional(),
  projectManager: z.string().optional(),
  projectLeader: z.string().optional(),
  userId: z.number().optional(),
  note: z.string().optional(),
  sales: z.number().optional(),
  costOfGoodsSold: z.number().optional(),
  sga: z.number().optional(),
  allocationOfCorpExpenses: z.number().optional(),
  version: z.number().optional(),
})

export type ApiProjectDto = z.infer<typeof apiProjectDtoSchema>

export const apiProjectFormSchema = z.object({
  projectName: z.string().min(1, 'プロジェクト名を入力してください。'),
  projectType: apiProjectTypeSchema,
  projectClass: apiProjectClassSchema,
  projectManager: z.string().optional(),
  projectLeader: z.string().optional(),
  clientId: z.string().min(1, '顧客を選択してください。'),
  clientName: z.string().optional(),
  projectStartDate: z.string().optional(),
  projectEndDate: z.string().optional(),
  note: z.string().optional(),
  sales: z.string().optional(),
  costOfGoodsSold: z.string().optional(),
  sga: z.string().optional(),
  allocationOfCorpExpenses: z.string().optional(),
})

export type ApiProjectFormValues = z.infer<typeof apiProjectFormSchema>

export const apiProjectUpdateFormSchema = apiProjectFormSchema

export type ApiProjectUpdateFormValues = z.infer<typeof apiProjectUpdateFormSchema>

export const apiProjectSearchFormSchema = z.object({
  pageNumber: z.string().optional(),
  clientId: z.string().optional(),
  clientName: z.string().optional(),
  projectName: z.string().optional(),
  projectType: z.string().optional(),
  projectClass: z.array(z.string()).optional(),
  projectStartDateBegin: z.string().optional(),
  projectStartDateEnd: z.string().optional(),
  projectEndDateBegin: z.string().optional(),
  projectEndDateEnd: z.string().optional(),
  sortKey: z.string().optional(),
  sortDir: z.string().optional(),
})

export type ApiProjectSearchFormValues = z.infer<typeof apiProjectSearchFormSchema>
