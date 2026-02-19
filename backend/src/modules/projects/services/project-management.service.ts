
import { sql, eq, and, desc, ilike, inArray } from 'drizzle-orm';
import { FastifyInstance } from 'fastify';
import { getAgencyDb } from '../../../infrastructure/database/index.js';
import { projects, clients, users } from '../../../infrastructure/database/schema.js';
import { CreateProjectInput, UpdateProjectInput, ProjectsQueryInput } from '../schemas.js';
import { AppError } from '../../../utils/errors.js';

export class ProjectManagementService {
    constructor(private readonly app: FastifyInstance) { }

    async getProjects(agencyId: string, params?: ProjectsQueryInput) {
        const db = await getAgencyDb(agencyId);

        const conditions = [eq(projects.agencyId, agencyId)];

        if (params?.status && params.status.length > 0) {
            conditions.push(inArray(projects.status, params.status));
        }
        if (params?.clientId) {
            conditions.push(eq(projects.clientId, params.clientId));
        }
        if (params?.projectManagerId) {
            conditions.push(eq(projects.projectManagerId, params.projectManagerId));
        }
        if (params?.priority && params.priority.length > 0) {
            conditions.push(inArray(projects.priority, params.priority));
        }
        if (params?.search) {
            conditions.push(ilike(projects.name, `%${params.search}%`));
        }

        const result = await db.select()
            .from(projects)
            .where(and(...conditions))
            .orderBy(desc(projects.createdAt));

        return result;
    }

    async getProject(agencyId: string, id: string) {
        const db = await getAgencyDb(agencyId);
        const [project] = await db.select()
            .from(projects)
            .where(and(eq(projects.id, id), eq(projects.agencyId, agencyId)))
            .limit(1);

        if (!project) {
            throw new AppError('Project not found', 404);
        }

        return project;
    }

    async createProject(agencyId: string, input: CreateProjectInput, userId: string) {
        const db = await getAgencyDb(agencyId);

        const [project] = await db.insert(projects)
            .values({
                ...input,
                agencyId,
                createdBy: userId,
                budget: input.budget?.toString(),
                allocatedBudget: input.allocatedBudget?.toString(),
                startDate: input.startDate ? new Date(input.startDate) : null,
                endDate: input.endDate ? new Date(input.endDate) : null,
                deadline: input.deadline ? new Date(input.deadline) : null,
            })
            .returning();

        return project;
    }

    async updateProject(agencyId: string, id: string, input: UpdateProjectInput) {
        const db = await getAgencyDb(agencyId);

        const updateData: any = { ...input, updatedAt: new Date() };
        if (input.budget) updateData.budget = input.budget.toString();
        if (input.allocatedBudget) updateData.allocatedBudget = input.allocatedBudget.toString();
        if (input.startDate) updateData.startDate = new Date(input.startDate);
        if (input.endDate) updateData.endDate = new Date(input.endDate);
        if (input.deadline) updateData.deadline = new Date(input.deadline);

        const [project] = await db.update(projects)
            .set(updateData)
            .where(and(eq(projects.id, id), eq(projects.agencyId, agencyId)))
            .returning();

        if (!project) {
            throw new AppError('Project not found', 404);
        }

        return project;
    }

    async deleteProject(agencyId: string, id: string) {
        const db = await getAgencyDb(agencyId);
        const [project] = await db.delete(projects)
            .where(and(eq(projects.id, id), eq(projects.agencyId, agencyId)))
            .returning();

        if (!project) {
            throw new AppError('Project not found', 404);
        }

        return { success: true };
    }
}
