import { z } from 'zod'

const apiProjectTypeSchema = z.enum(['development', 'maintenance'])
const apiProjectClassSchema = z.enum(['ss', 's', 'a', 'b', 'c', 'd'])
const HALF_WIDTH_CHAR_PATTERN = /[\u0020-\u007E\uFF61-\uFF9F]/

export const PROJECT_REQUIRED_MESSAGE = '入力してください。'
export const PROJECT_NAME_FULLWIDTH_MESSAGE = 'プロジェクト名は64文字以下の全角文字で入力してください。'
export const USER_NAME_FULLWIDTH_MESSAGE = '氏名は64文字以下の全角文字で入力してください。'
export const CLIENT_NAME_FULLWIDTH_MESSAGE = '顧客名は64文字以下の全角文字で入力してください。'

export function isFullWidthText(value: string) {
  return !HALF_WIDTH_CHAR_PATTERN.test(value)
}

function requiredStringSchema() {
  return z.string().superRefine((value, ctx) => {
    if (value.trim() === '') {
      ctx.addIssue({ code: 'custom', message: PROJECT_REQUIRED_MESSAGE })
    }
  })
}

function optionalFullWidthStringSchema(message: string) {
  return z.string().optional().superRefine((value, ctx) => {
    if (!value) return
    if (value.length > 64 || !isFullWidthText(value)) {
      ctx.addIssue({ code: 'custom', message })
    }
  })
}

function requiredProjectNameSchema() {
  return z.string().superRefine((value, ctx) => {
    if (value.trim() === '') {
      ctx.addIssue({ code: 'custom', message: PROJECT_REQUIRED_MESSAGE })
      return
    }
    if (value.length > 64 || !isFullWidthText(value)) {
      ctx.addIssue({ code: 'custom', message: PROJECT_NAME_FULLWIDTH_MESSAGE })
    }
  })
}

function optionalProjectNameSchema() {
  return z.string().optional().superRefine((value, ctx) => {
    if (!value) return
    if (value.length > 64 || !isFullWidthText(value)) {
      ctx.addIssue({ code: 'custom', message: PROJECT_NAME_FULLWIDTH_MESSAGE })
    }
  })
}

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
  projectName: requiredProjectNameSchema(),
  projectType: apiProjectTypeSchema,
  projectClass: apiProjectClassSchema,
  projectManager: optionalFullWidthStringSchema(USER_NAME_FULLWIDTH_MESSAGE),
  projectLeader: optionalFullWidthStringSchema(USER_NAME_FULLWIDTH_MESSAGE),
  clientId: requiredStringSchema(),
  clientName: optionalFullWidthStringSchema(CLIENT_NAME_FULLWIDTH_MESSAGE),
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
  projectName: optionalProjectNameSchema(),
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
