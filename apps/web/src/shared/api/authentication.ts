import { z } from 'zod'

export const apiLoginFormSchema = z.object({
  loginId: z
    .string()
    .min(1, 'ログインIDを入力してください。')
    .max(20, 'ログインIDは20文字以内で入力してください。')
    .regex(/^\d+$/, 'ログインIDは半角数字で入力してください。'),
  userPassword: z.string().min(1, 'パスワードを入力してください。'),
})

export type ApiLoginFormValues = z.infer<typeof apiLoginFormSchema>

export const apiLoginUserSchema = z.object({
  userId: z.number(),
  kanjiName: z.string(),
  admin: z.boolean(),
  lastLoginDateTime: z.string(),
})

export type ApiLoginUser = z.infer<typeof apiLoginUserSchema>
