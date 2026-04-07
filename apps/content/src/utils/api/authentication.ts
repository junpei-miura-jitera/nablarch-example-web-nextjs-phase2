import { z } from 'zod'

export const apiLoginFormSchema = z.object({
  loginId: z.string(),
  userPassword: z.string(),
})

export type ApiLoginFormValues = z.infer<typeof apiLoginFormSchema>

export const apiLoginUserSchema = z.object({
  userId: z.number(),
  kanjiName: z.string(),
  admin: z.boolean(),
  lastLoginDateTime: z.string(),
})

export type ApiLoginUser = z.infer<typeof apiLoginUserSchema>
