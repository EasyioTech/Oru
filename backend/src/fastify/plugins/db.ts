import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { db, getAgencyDb } from '../../infrastructure/database/index.js';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../infrastructure/database/schema.js';
import * as fs from 'fs';
import * as path from 'path';

declare module 'fastify' {
    interface FastifyInstance {
        db: typeof db;
        getAgencyDb: (databaseName: string) => Promise<NodePgDatabase<typeof schema>>;
    }

    interface FastifyRequest {
        db: typeof db;
        agencyDb?: typeof db; // Added to support new module architecture
        getAgencyDb: (databaseName: string) => Promise<NodePgDatabase<typeof schema>>;
    }
}

async function runMigrationIfExists(client: any, migrationName: string) {
    const migrationPath = path.join(process.cwd(), 'database', 'migrations', migrationName);

    if (!fs.existsSync(migrationPath)) {
        return false;
    }

    try {
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        await client.query(migrationSQL);
        return true;
    } catch (error) {
        throw error;
    }
}

const dbPlugin: FastifyPluginAsync = async (fastify) => {
    // Initialize main database schema and run migrations
    const migrations = [
        '20_create_blog_schema.sql',
        '21_inventory_schema.sql',
        '22_procurement_schema.sql',
        '23_reports_schema.sql',
        '24_admin_schema.sql',
    ];

    const client = await db.$client;
    for (const migration of migrations) {
        try {
            await runMigrationIfExists(client, migration);
            fastify.log.info(`✅ Migration verified: ${migration}`);
        } catch (error: any) {
            fastify.log.warn(`Migration skipped (${migration}): ${error.message}`);
        }
    }

    // Decorate FastifyInstance with db
    fastify.decorate('db', db);
    fastify.decorate('getAgencyDb', getAgencyDb);

    // Also decorate request for convenience
    fastify.decorateRequest('db', {
        getter: () => db
    });

    fastify.decorateRequest('getAgencyDb', {
        getter: () => getAgencyDb
    });
};

export default fp(dbPlugin);
