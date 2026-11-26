import { z } from 'zod';

export const createLeaveRequestSchema = z.object({
  leaveTypeId: z.string().uuid('Invalid leave type ID'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  totalDays: z.number().positive('Total days must be greater than 0'),
  reason: z.string().min(1, 'Reason is required').max(500),
  employeeId: z.string().uuid().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).optional().default('pending'),
});

export const updateLeaveRequestSchema = z.object({
  leaveTypeId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  totalDays: z.number().positive().optional(),
  reason: z.string().max(500).optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).optional(),
  rejectionReason: z.string().max(500).optional(),
});

export type CreateLeaveRequestInput = z.infer<typeof createLeaveRequestSchema>;
export type UpdateLeaveRequestInput = z.infer<typeof updateLeaveRequestSchema>;
