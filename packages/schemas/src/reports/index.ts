import { z } from 'zod';

// reports schemas — expand as module is implemented
export const reportsFiltersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type ReportsFilters = z.infer<typeof reportsFiltersSchema>;
