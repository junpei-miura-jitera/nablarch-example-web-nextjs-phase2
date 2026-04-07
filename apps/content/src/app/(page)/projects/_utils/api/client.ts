import { z } from 'zod'

export const apiClientDtoSchema = z.object({
  clientId: z.number(),
  clientName: z.string(),
  industryCode: z.string(),
  industryName: z.string(),
})

export type ApiClientDto = z.infer<typeof apiClientDtoSchema>

export const apiIndustryDtoSchema = z.object({
  industryCode: z.string(),
  industryName: z.string(),
})

export type ApiIndustryDto = z.infer<typeof apiIndustryDtoSchema>
