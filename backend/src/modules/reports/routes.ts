import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { ReportService } from './service.js';
import { mapToSnakeCase } from '../../utils/case-transform.js';
import { ForbiddenError } from '../../utils/errors.js';

const reportRoutes: FastifyPluginAsync = async (fastify) => {
    const svc = (req: FastifyRequest) =>
        new ReportService((req as any).agencyDb || fastify.db, req.user.agencyId as string);

    fastify.get('/definitions', { onRequest: [fastify.authenticate] }, async (request) => {
        // We rely on casl 'all' subject here as a proxy for basic access
        if (request.ability.cannot('read', 'all')) throw new ForbiddenError();
        return { success: true, data: (await svc(request).getReportDefinitions(request.query as any)).map((d: any) => mapToSnakeCase(d)) };
    });

    fastify.get('/runs', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('read', 'all')) throw new ForbiddenError();
        return { success: true, data: (await svc(request).getReportRuns()).map((d: any) => mapToSnakeCase(d)) };
    });

    fastify.get('/runs/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('read', 'all')) throw new ForbiddenError();
        const { id } = request.params as { id: string };
        return { success: true, data: mapToSnakeCase(await svc(request).getReportRun(id)) };
    });

    fastify.post('/generate', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        if (request.ability.cannot('read', 'all')) throw new ForbiddenError(); // Note: specific report access logic would go here
        const { reportId, parameters, format } = request.body as any;
        return reply.code(201).send({ 
            success: true, 
            data: mapToSnakeCase(await svc(request).generateReport(reportId, parameters, format, request.user.id as string)) 
        });
    });
};

export default reportRoutes;
