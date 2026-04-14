import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { db, getAgencyDb } from '../../infrastructure/database/index.js';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as coreSchema from '../../infrastructure/database/schema-core.js';
import * as tenantSchema from '../../infrastructure/database/schema-tenant.js';
import * as fs from 'fs';
import * as path from 'path';

declare module 'fastify' {
    interface FastifyInstance {
        db: typeof db;
        getAgencyDb: (databaseName: string) => Promise<NodePgDatabase<typeof tenantSchema>>;
    }

    interface FastifyRequest {
        db: typeof db;
        getAgencyDb: (databaseName: string) => Promise<NodePgDatabase<typeof tenantSchema>>;
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
    try {
        const client = await db.$client;

        // Run blog schema migration
        await runMigrationIfExists(client, '20_create_blog_schema.sql');
        fastify.log.info('✅ Blog schema migration verified');
    } catch (error: any) {
        fastify.log.warn(`Blog schema migration skipped or already exists: ${error.message}`);
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
