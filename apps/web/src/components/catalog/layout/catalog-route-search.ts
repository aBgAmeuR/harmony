import { z } from 'zod'

export const catalogSearchSchema = z.object({
  details: z.number().optional(),
})
