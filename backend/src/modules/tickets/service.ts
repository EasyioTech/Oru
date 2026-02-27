
import { db } from '../../infrastructure/database/index.js';
import { tickets } from '../../infrastructure/database/schema.js';
import { eq, desc, and, count } from 'drizzle-orm';
import { FastifyBaseLogger } from 'fastify';
import { AppError, NotFoundError } from '../../utils/errors.js';
import { createTicketSchema, updateTicketSchema } from './schemas.js';
import { customAlphabet } from 'nanoid';

const ticketIdGen = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

export class TicketsService {
    constructor(private logger: FastifyBaseLogger) { }

    async listTickets(filters: { limit?: number; offset?: number; status?: string } = {}) {
        try {
            const { limit = 100, offset = 0, status } = filters;

            const conditions = [];
            if (status) {
                conditions.push(eq(tickets.status, status));
            }

            const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

            const ticketsList = await db
                .select()
                .from(tickets)
                .where(whereClause)
                .orderBy(desc(tickets.createdAt))
                .limit(limit)
                .offset(offset);

            return ticketsList || [];
        } catch (error) {
            this.logger.error({ error, context: 'listTickets' });
            return [];
        }
    }

    async getTicketStats() {
        try {
            const [totalResult] = await db.select({ count: count() }).from(tickets);
            const [openResult] = await db.select({ count: count() }).from(tickets).where(eq(tickets.status, 'open'));
            const [pendingResult] = await db.select({ count: count() }).from(tickets).where(eq(tickets.status, 'pending'));
            const [resolvedResult] = await db.select({ count: count() }).from(tickets).where(eq(tickets.status, 'resolved'));
            const [urgentResult] = await db.select({ count: count() }).from(tickets).where(eq(tickets.priority, 'urgent'));

            return {
                total: totalResult?.count || 0,
                open: openResult?.count || 0,
                pending: pendingResult?.count || 0,
                resolved: resolvedResult?.count || 0,
                urgent: urgentResult?.count || 0,
            };
        } catch (error) {
            this.logger.error({ error, context: 'getTicketStats' });
            return { total: 0, open: 0, pending: 0, resolved: 0, urgent: 0 };
        }
    }

    async getTicketSummary() {
        try {
            const stats = await this.getTicketStats();
            const recentTickets = await db.select()
                .from(tickets)
                .orderBy(desc(tickets.createdAt))
                .limit(5);

            return {
                stats,
                recentTickets
            };
        } catch (error) {
            this.logger.error({ error, context: 'getTicketSummary' });
            throw new AppError('Failed to fetch ticket summary');
        }
    }
    async getTicket(id: string) {
        try {
            const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
            if (!ticket) throw new NotFoundError('Ticket not found');
            return ticket;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            this.logger.error({ error, context: 'getTicket', id });
            throw new AppError('Failed to fetch ticket');
        }
    }

    async createTicket(input: any) {
        try {
            const validated = createTicketSchema.parse(input);
            const ticketNumber = `TKT-${ticketIdGen()}`;

            const [ticket] = await db.insert(tickets).values({
                ticketNumber,
                title: validated.title,
                description: validated.description,
                priority: validated.priority,
                category: validated.category,
                agencyId: validated.agencyId as string,
            }).returning();
            return ticket;
        } catch (error) {
            this.logger.error({ error, context: 'createTicket', input });
            throw new AppError('Failed to create ticket');
        }
    }

    async updateTicket(id: string, input: any) {
        try {
            const validated = updateTicketSchema.parse(input);
            const [ticket] = await db.update(tickets)
                .set({ ...validated, updatedAt: new Date() })
                .where(eq(tickets.id, id))
                .returning();

            if (!ticket) throw new NotFoundError('Ticket not found');
            return ticket;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            this.logger.error({ error, context: 'updateTicket', id, input });
            throw new AppError('Failed to update ticket');
        }
    }

    async deleteTicket(id: string) {
        try {
            const [ticket] = await db.delete(tickets)
                .where(eq(tickets.id, id))
                .returning();

            if (!ticket) throw new NotFoundError('Ticket not found');
            return ticket;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            this.logger.error({ error, context: 'deleteTicket', id });
            throw new AppError('Failed to delete ticket');
        }
    }
}
