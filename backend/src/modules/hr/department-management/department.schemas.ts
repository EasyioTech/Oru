import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required').max(100),
  description: z.string().max(500).optional().nullable(),
  managerId: z.string().uuid().optional().nullable(),
  parentDepartmentId: z.string().uuid().optional().nullable(),
  budget: z.union([z.number(), z.string()]).optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  managerId: z.string().uuid().optional().nullable(),
  parentDepartmentId: z.string().uuid().optional().nullable(),
  budget: z.union([z.number(), z.string()]).optional().nullable(),
  isActive: z.boolean().optional(),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
