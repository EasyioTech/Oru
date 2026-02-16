
import { z } from 'zod';

export const ticketSchema = z.object({
    id: z.string().uuid(),
    ticketNumber: z.string(),
    title: z.string(),
    description: z.string(),
    status: z.string(),
    priority: z.string(),
    category: z.string().nullable(),
    agencyId: z.string().uuid().nullable(),
    userId: z.string().uuid().nullable(),
    assignedTo: z.string().uuid().nullable(),
    metadata: z.record(z.any()),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const createTicketSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
    category: z.string().optional(),
    agencyId: z.string().uuid().optional(),
});

export const updateTicketSchema = createTicketSchema.partial().extend({
    status: z.enum(['open', 'pending', 'resolved', 'closed']).optional(),
    assignedTo: z.string().uuid().optional(),
});
