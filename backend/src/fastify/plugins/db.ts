import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { db, getAgencyDb } from '../../infrastructure/database/index.js';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as coreSchema from '../../infrastructure/database/schema-core.js';
import * as tenantSchema from '../../infrastructure/database/schema-tenant.js';

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

const dbPlugin: FastifyPluginAsync = async (fastify) => {
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
