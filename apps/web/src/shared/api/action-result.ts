import { z } from 'zod'

export const apiActionResultSchema = z.object({
  ok: z.boolean(),
  message: z.string().optional(),
})

export type ApiActionResult = z.infer<typeof apiActionResultSchema>
