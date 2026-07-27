import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { getMeiliClient } from '../../infrastructure/meilisearch/index.js';

declare module 'fastify' {
    interface FastifyInstance {
        meilisearch: {
            query: (indexName: string, term: string, agencyId: string, opts?: any) => Promise<any[]>;
        };
    }
}

export default fp(async (fastify: FastifyInstance) => {
    fastify.decorate('meilisearch', {
        query: async (indexName: string, term: string, agencyId: string, opts?: any) => {
            const client = getMeiliClient();
            if (!client) return [];

            try {
                // Ensure agencyId is always filtered
                const baseFilter = `agencyId = "${agencyId}"`;
                let filter: string | string[] = baseFilter;

                if (opts?.filter) {
                    if (Array.isArray(opts.filter)) {
                        filter = [opts.filter as any, baseFilter];
                    } else if (typeof opts.filter === 'string') {
                        filter = `${opts.filter} AND ${baseFilter}`;
                    }
                }

                const searchRes = await client.index(indexName).search(term, {
                    ...opts,
                    filter,
                });

                return searchRes.hits;
            } catch (error: any) {
                fastify.log.error(`Meilisearch query error: ${error.message || error}`);
                return [];
            }
        },
    });
});
