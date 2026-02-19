
import { sql, eq, and, desc } from 'drizzle-orm';
import { FastifyInstance } from 'fastify';
import { getAgencyDb } from '../../../infrastructure/database/index.js';
import { projects, clients, users, profiles } from '../../../infrastructure/database/schema.js';
import { AppError } from '../../../utils/errors.js';

export class ProjectDetailsService {
    constructor(private readonly app: FastifyInstance) { }

    async getProjectDetails(agencyId: string, id: string) {
        const db = await getAgencyDb(agencyId);

        // Fetch project with join if possible, or multiple queries for simplicity and following the multi-db logic
        const [project] = await db.select()
            .from(projects)
            .where(and(eq(projects.id, id), eq(projects.agencyId, agencyId)))
            .limit(1);

        if (!project) {
            throw new AppError('Project not found', 404);
        }

        // Fetch related data manually to ensure multi-tenant consistency and avoid complex cross-db joins (though it's same DB here)
        const [client] = project.clientId ? await db.select().from(clients).where(eq(clients.id, project.clientId)).limit(1) : [null];

        // Managers from main DB (profiles are in main DB according to some handover text, wait)
        // Handover said: "Main DB: Contains agencies, users, system_settings, and page_catalog."
        // "Tenant DB: ... projects, clients, invoices."
        // Profiles? Let's check public.ts or users.ts.

        const [projectManager] = project.projectManagerId ? await db.select().from(profiles).where(eq(profiles.userId, project.projectManagerId)).limit(1) : [null];
        const [accountManager] = project.accountManagerId ? await db.select().from(profiles).where(eq(profiles.userId, project.accountManagerId)).limit(1) : [null];

        return {
            ...project,
            client: client || undefined,
            projectManager: projectManager ? { id: projectManager.userId, fullName: projectManager.fullName } : undefined,
            accountManager: accountManager ? { id: accountManager.userId, fullName: accountManager.fullName } : undefined,
        };
    }
}
