import { z } from 'zod';

export const employeeFiltersSchema = z.object({
  departmentId: z.string().uuid().optional(),
  status: z.enum(['active', 'inactive', 'on_leave']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const createDepartmentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().uuid().optional(),
});

export const createLeaveRequestSchema = z.object({
  leaveTypeId: z.string().uuid(),
  startDate: z.string().date(),
  endDate: z.string().date(),
  reason: z.string().optional(),
});

export const updateLeaveRequestSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reviewNote: z.string().optional(),
});

export type EmployeeFilters = z.infer<typeof employeeFiltersSchema>;
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type CreateLeaveRequestInput = z.infer<typeof createLeaveRequestSchema>;
