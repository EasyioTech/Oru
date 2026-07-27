import { z } from 'zod';

// finance schemas — expand as module is implemented
export const financeFiltersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type FinanceFilters = z.infer<typeof financeFiltersSchema>;
