import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const databaseRoutes: FastifyPluginAsync = async (fastify) => {

    fastify.post('/query', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            const schema = z.object({
                query: z.string(),
                params: z.array(z.any()).optional(),
            });
            const { query, params = [] } = schema.parse(request.body);
            const { pool } = await import('../../infrastructure/database/index.js');
            const result = await pool.query(query, params);
            return { success: true, data: result.rows ?? [] };
        } catch (error: any) {
            fastify.log.error({ error: error.message, context: 'POST /database/query' });
            if (error.code === '42P01' || error.code === '42703') {
                return { success: true, data: [] };
            }
            return reply.status(500).send({ success: false, error: error.message });
        }
    });

    fastify.post('/insert', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            const schema = z.object({
                table: z.string(),
                data: z.record(z.any()),
            });
            const { table, data } = schema.parse(request.body);
            const keys = Object.keys(data);
            const values = Object.values(data);
            const cols = keys.map(k => `"${k}"`).join(', ');
            const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
            const { pool } = await import('../../infrastructure/database/index.js');
            const result = await pool.query(
                `INSERT INTO public."${table}" (${cols}) VALUES (${placeholders}) RETURNING *`,
                values
            );
            return { success: true, data: result.rows[0] ?? null };
        } catch (error: any) {
            fastify.log.error({ error: error.message, context: 'POST /database/insert' });
            return reply.status(500).send({ success: false, error: error.message });
        }
    });

    fastify.put('/update', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            const schema = z.object({
                table: z.string(),
                data: z.record(z.any()),
                where: z.record(z.any()),
            });
            const { table, data, where } = schema.parse(request.body);
            const dataKeys = Object.keys(data);
            const dataVals = Object.values(data);
            const whereKeys = Object.keys(where);
            const whereVals = Object.values(where);
            const setClauses = dataKeys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
            const whereClauses = whereKeys.map((k, i) => `"${k}" = $${dataKeys.length + i + 1}`).join(' AND ');
            const { pool } = await import('../../infrastructure/database/index.js');
            const result = await pool.query(
                `UPDATE public."${table}" SET ${setClauses} WHERE ${whereClauses} RETURNING *`,
                [...dataVals, ...whereVals]
            );
            return { success: true, data: result.rows[0] ?? null };
        } catch (error: any) {
            fastify.log.error({ error: error.message, context: 'PUT /database/update' });
            return reply.status(500).send({ success: false, error: error.message });
        }
    });

    fastify.delete('/delete', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            const schema = z.object({
                table: z.string(),
                where: z.record(z.any()),
            });
            const { table, where } = schema.parse(request.body);
            const whereKeys = Object.keys(where);
            const whereVals = Object.values(where);
            const whereClauses = whereKeys.map((k, i) => `"${k}" = $${i + 1}`).join(' AND ');
            const { pool } = await import('../../infrastructure/database/index.js');
            const result = await pool.query(
                `DELETE FROM public."${table}" WHERE ${whereClauses} RETURNING *`,
                whereVals
            );
            return { success: true, data: result.rows ?? [] };
        } catch (error: any) {
            fastify.log.error({ error: error.message, context: 'DELETE /database/delete' });
            return reply.status(500).send({ success: false, error: error.message });
        }
    });
};

export default databaseRoutes;
