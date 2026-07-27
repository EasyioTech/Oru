import { z } from 'zod';

// admin schemas — expand as module is implemented
export const adminFiltersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type AdminFilters = z.infer<typeof adminFiltersSchema>;
