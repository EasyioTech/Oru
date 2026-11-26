import { z } from 'zod';

export const createEmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(20).optional().nullable(),
  departmentId: z.string().uuid().optional().nullable(),
  position: z.string().max(100).optional().nullable(),
  employmentType: z.enum(['full_time', 'part_time', 'contract', 'intern']).optional().default('full_time'),
  status: z.enum(['active', 'inactive', 'terminated']).optional().default('active'),
  hireDate: z.string().optional().nullable(),
  salary: z.union([z.number(), z.string()]).optional().nullable(),
  employeeCode: z.string().max(50).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  emergencyContactName: z.string().max(100).optional().nullable(),
  emergencyContactPhone: z.string().max(20).optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
