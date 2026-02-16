import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { db, getAgencyDb } from '../../infrastructure/database/index.js';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../infrastructure/database/schema.js';

declare module 'fastify' {
    interface FastifyRequest {
        db: typeof db;
        getAgencyDb: (databaseName: string) => Promise<NodePgDatabase<typeof schema>>;
    }
}

const dbPlugin: FastifyPluginAsync = async (fastify) => {
    // Decorate the request object with the Main database instance
    // and the agency database switcher
    fastify.decorateRequest('db', {
        getter: () => db
    });

    fastify.decorateRequest('getAgencyDb', {
        getter: () => getAgencyDb
    });
};

export default fp(dbPlugin);
