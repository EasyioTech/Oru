import { z } from 'zod';

export const createEmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.preprocess((val) => (val === '' ? null : val), z.string().max(30).optional().nullable()),
  departmentId: z.preprocess(
    (val) => (val === '' || val === '__no_departments__' ? null : val),
    z.string().uuid().optional().nullable()
  ),
  position: z.preprocess((val) => (val === '' ? null : val), z.string().max(100).optional().nullable()),
  employmentType: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        const clean = val.toLowerCase().replace(/[-\s]/g, '_');
        if (clean === 'full_time' || clean === 'part_time' || clean === 'contract' || clean === 'intern') {
          return clean;
        }
      }
      return val || 'full_time';
    },
    z.enum(['full_time', 'part_time', 'contract', 'intern']).optional().default('full_time')
  ),
  status: z.preprocess(
    (val) => (typeof val === 'string' ? val.toLowerCase() : val),
    z.enum(['active', 'inactive', 'terminated']).optional().default('active')
  ),
  hireDate: z.preprocess((val) => (val === '' ? null : val), z.string().optional().nullable()),
  salary: z.preprocess(
    (val) => (val === '' || val === undefined ? null : val),
    z.union([z.number(), z.string()]).optional().nullable()
  ),
  employeeCode: z.preprocess((val) => (val === '' ? null : val), z.string().max(50).optional().nullable()),
  address: z.preprocess((val) => (val === '' ? null : val), z.string().max(500).optional().nullable()),
  emergencyContactName: z.preprocess((val) => (val === '' ? null : val), z.string().max(100).optional().nullable()),
  emergencyContactPhone: z.preprocess((val) => (val === '' ? null : val), z.string().max(30).optional().nullable()),
  avatarUrl: z.preprocess((val) => (val === '' ? null : val), z.string().optional().nullable()),
  notes: z.preprocess((val) => (val === '' ? null : val), z.string().max(1000).optional().nullable()),
  agencyId: z.preprocess((val) => (val === '' ? null : val), z.string().uuid().optional().nullable()),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

