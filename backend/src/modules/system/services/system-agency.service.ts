import { users, profiles, userRoles } from '../../../infrastructure/database/schema.js';
import { eq, and } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

export class SystemAgencyService {
    constructor(private db: NodePgDatabase<any>) { }

    async getAgencyData(agencyId: string) {
        const agencyUsers = await this.db.select({
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

    async getAgencyPages(_agencyId: string) {
        return [];
    }
}
