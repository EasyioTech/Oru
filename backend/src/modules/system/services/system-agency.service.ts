
import { db } from '../../../infrastructure/database/index.js';
import { agencies, users, profiles, userRoles, agencyPageAssignments, pageCatalog } from '../../../infrastructure/database/schema.js';
import { eq, and } from 'drizzle-orm';
import { FastifyInstance } from 'fastify';

export class SystemAgencyService {
    constructor(private readonly app: FastifyInstance) { }

    async getAgencyData(agencyId: string) {
        const agencyUsers = await db.select({
            id: users.id,
            full_name: profiles.fullName,
            email: users.email,
            role: userRoles.role,
            is_active: users.status,
            created_at: users.createdAt,
        }).from(profiles)
            .innerJoin(users, eq(profiles.userId, users.id))
            .leftJoin(userRoles, and(eq(userRoles.userId, profiles.userId), eq(userRoles.agencyId, profiles.agencyId)))
            .where(eq(profiles.agencyId, agencyId));

        return {
            users: agencyUsers.map(u => ({ ...u, is_active: u.is_active === 'active' })),
            clients: [], projects: [], invoices: [], inventory: [],
        };
    }

    async getAgencyPages(agencyId: string) {
        const assignments = await db.select({
            id: agencyPageAssignments.id,
            pageId: agencyPageAssignments.pageId,
            status: agencyPageAssignments.status,
            title: pageCatalog.title,
            path: pageCatalog.path,
        }).from(agencyPageAssignments)
            .innerJoin(pageCatalog, eq(agencyPageAssignments.pageId, pageCatalog.id))
            .where(eq(agencyPageAssignments.agencyId, agencyId));
        return assignments;
    }
}
