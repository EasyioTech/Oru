
import { db } from '../../infrastructure/database/index.js';
import { agencies, users, profiles, tickets, pageCatalog } from '../../infrastructure/database/schema.js';
import { eq, ilike, or, and, desc, sql } from 'drizzle-orm';
import { FastifyBaseLogger } from 'fastify';
import { AppError } from '../../utils/errors.js';
import { SearchQueryInput } from './schemas.js';

export class SearchService {
    constructor(private logger: FastifyBaseLogger) { }

    async search(input: SearchQueryInput, user: { id: string, agencyId?: string, roles: string[] }) {
        try {
            const { q, type, limit } = input;
            const term = `%${q}%`;
            const results: any[] = [];

            // Check permissions
            // Assuming 'super_admin' role exists
            const isSuperAdmin = user.roles.includes('super_admin');

            // 1. Search Pages (Global)
            if (type === 'all' || type === 'pages') {
                const pageResults = await db.select({
                    id: pageCatalog.id,
                    title: pageCatalog.title,
                    description: pageCatalog.description,
                    path: pageCatalog.path
                })
                    .from(pageCatalog)
                    .where(or(ilike(pageCatalog.title, term), ilike(pageCatalog.description || '', term)))
                    .limit(limit);

                pageResults.forEach(p => results.push({
                    id: p.id,
                    type: 'page',
                    title: p.title,
                    subtitle: p.description,
                    url: `/pages/${p.path}`
                }));
            }

            // 2. Search Agencies (Super Admin only usually, or name search)
            if ((type === 'all' || type === 'agencies') && isSuperAdmin) {
                const agencyResults = await db.select({
                    id: agencies.id,
                    name: agencies.name,
                    domain: agencies.domain
                })
                    .from(agencies)
                    .where(or(ilike(agencies.name, term), ilike(agencies.domain, term)))
                    .limit(limit);

                agencyResults.forEach(a => results.push({
                    id: a.id,
                    type: 'agency',
                    title: a.name,
                    subtitle: a.domain,
                    url: `/agencies/${a.id}`
                }));
            }

            // 3. Search Users (via Profiles)
            if (type === 'all' || type === 'users') {
                // Determine scope
                let scopeFilter = undefined;
                if (!isSuperAdmin && user.agencyId) {
                    scopeFilter = eq(profiles.agencyId, user.agencyId);
                }

                const userResults = await db.select({
                    id: profiles.userId,
                    fullName: profiles.fullName,
                    email: users.email,
                    displayName: profiles.displayName
                })
                    .from(profiles)
                    .innerJoin(users, eq(profiles.userId, users.id))
                    .where(and(
                        scopeFilter,
                        or(ilike(profiles.fullName || '', term), ilike(users.email, term))
                    ))
                    .limit(limit);

                userResults.forEach(u => results.push({
                    id: u.id,
                    type: 'user',
                    title: u.fullName || u.displayName || 'Unknown',
                    subtitle: u.email,
                    url: `/users/${u.id}`
                }));
            }

            // 4. Search Tickets
            if (type === 'all' || type === 'tickets') {
                // Determine scope
                let scopeFilter = undefined;
                if (!isSuperAdmin && user.agencyId) {
                    scopeFilter = eq(tickets.agencyId, user.agencyId);
                }

                const ticketResults = await db.select({
                    id: tickets.id,
                    ticketNumber: tickets.ticketNumber,
                    title: tickets.title,
                    status: tickets.status
                })
                    .from(tickets)
                    .where(and(
                        scopeFilter,
                        or(ilike(tickets.title, term), ilike(tickets.ticketNumber, term))
                    ))
                    .limit(limit);

                ticketResults.forEach(t => results.push({
                    id: t.id,
                    type: 'ticket',
                    title: `${t.ticketNumber}: ${t.title}`,
                    subtitle: t.status,
                    url: `/tickets/${t.id}`
                }));
            }

            return { results: results.slice(0, limit) };

        } catch (error) {
            this.logger.error({ error, context: 'search' });
            throw new AppError('Search failed');
        }
    }
}
