import { z } from 'zod';

// procurement schemas — expand as module is implemented
export const procurementFiltersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type ProcurementFilters = z.infer<typeof procurementFiltersSchema>;
