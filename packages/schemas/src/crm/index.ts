import { z } from 'zod';

export const clientFiltersSchema = z.object({
  status: z.enum(['active', 'inactive', 'prospect']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const createClientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  status: z.enum(['active', 'inactive', 'prospect']).default('prospect'),
});

export const updateClientSchema = createClientSchema.partial();

export const createLeadSchema = z.object({
  title: z.string().min(1),
  value: z.number().optional(),
  clientId: z.string().uuid().optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'lost', 'won']).default('new'),
});

export type ClientFilters = z.infer<typeof clientFiltersSchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
