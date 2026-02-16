

import { db } from '../../infrastructure/database/index.js';
import { sql } from 'drizzle-orm';
import { FastifyBaseLogger } from 'fastify';
import { AppError } from '../../utils/errors.js';

export class DatabaseService {
    constructor(private logger: FastifyBaseLogger) { }

    /**
     * Executes a raw SQL query. 
     * WARNING: Extremely dangerous. Only for Super Admin.
     */
    async executeQuery(query: string, params: any[] = []) {
        try {
            // Using Drizzle's sql template for raw queries
            // This is still dangerous but required for admin dashboard
            const result = await db.execute(sql.raw(query));

            // Handle different result types
            if (Array.isArray(result)) {
                return result;
            }

            // PostgreSQL returns result.rows
            if (result && typeof result === 'object' && 'rows' in result) {
                return (result as any).rows || [];
            }

            // Fallback to empty array
            return [];
        } catch (error: any) {
            this.logger.error({
                error: error.message,
                query,
                params,
                context: 'executeQuery',
                stack: error.stack
            });
            // Return empty array instead of throwing to prevent dashboard crash
            return [];
        }
    }
}
