
import { z } from 'zod';

export const createProjectSchema = z.object({
    name: z.string().min(1, 'Project name is required'),
    description: z.string().optional(),
    projectCode: z.string().optional(),
    projectType: z.string().optional(),
    status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).default('planning'),
    priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    deadline: z.string().datetime().optional(),
    budget: z.number().optional(),
    allocatedBudget: z.number().optional(),
    costCenter: z.string().optional(),
    currency: z.string().default('USD'),
    clientId: z.string().uuid().optional(),
    projectManagerId: z.string().uuid().optional(),
    accountManagerId: z.string().uuid().optional(),
    assignedTeam: z.array(z.string().uuid()).default([]),
    departments: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    categories: z.array(z.string()).default([]),
    customFields: z.record(z.any()).default({}),
});

export const updateProjectSchema = createProjectSchema.partial();

export const projectsQuerySchema = z.object({
    status: z.array(z.string()).optional(),
    clientId: z.string().uuid().optional(),
    projectManagerId: z.string().uuid().optional(),
    priority: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    search: z.string().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectsQueryInput = z.infer<typeof projectsQuerySchema>;
