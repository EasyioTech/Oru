import { z } from 'zod';

// inventory schemas — expand as module is implemented
export const inventoryFiltersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type InventoryFilters = z.infer<typeof inventoryFiltersSchema>;
