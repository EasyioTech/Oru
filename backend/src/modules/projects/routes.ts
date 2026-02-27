
import { FastifyPluginAsync } from 'fastify';
import { ProjectService } from './service.js';
import { createProjectSchema, updateProjectSchema, projectsQuerySchema } from './schemas.js';
import { ForbiddenError } from '../../utils/errors.js';
import { mapToSnakeCase } from '../../utils/case-transform.js';

const projectRoutes: FastifyPluginAsync = async (fastify) => {
    const service = new ProjectService(fastify);

    // GET /projects
    fastify.get('/', {
        onRequest: [fastify.authenticate],
    }, async (request) => {
        try {
            if (!request.ability.can('read', 'Project')) {
                throw new ForbiddenError();
            }

            const query = projectsQuerySchema.parse(request.query);
            const agencyId = request.user.agencyId;
            if (!agencyId) throw new ForbiddenError('No agency context');

            const data = await service.getProjects(agencyId, query);
            return { success: true, data: mapToSnakeCase(data) };
        } catch (error) {
            fastify.log.error({ error, context: 'GET /projects' });
            throw error;
        }
    });

    // GET /projects/:id
    fastify.get('/:id', {
        onRequest: [fastify.authenticate],
    }, async (request) => {
        try {
            if (!request.ability.can('read', 'Project')) {
                throw new ForbiddenError();
            }

            const { id } = request.params as { id: string };
            const agencyId = request.user.agencyId;
            if (!agencyId) throw new ForbiddenError('No agency context');

            const data = await service.getProjectDetails(agencyId, id);
            return { success: true, data: mapToSnakeCase(data) };
        } catch (error) {
            fastify.log.error({ error, id: (request.params as any).id, context: 'GET /projects/:id' });
            throw error;
        }
    });

    // POST /projects
    fastify.post('/', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            if (!request.ability.can('create', 'Project')) {
                throw new ForbiddenError();
            }

            const validated = createProjectSchema.parse(request.body);
            const agencyId = request.user.agencyId;
            const userId = request.user.id;
            if (!agencyId) throw new ForbiddenError('No agency context');

            const project = await service.createProject(agencyId, validated, userId);
            return reply.code(201).send({ success: true, data: mapToSnakeCase(project) });
        } catch (error) {
            fastify.log.error({ error, context: 'POST /projects' });
            throw error;
        }
    });

    // PATCH /projects/:id
    fastify.patch('/:id', {
        onRequest: [fastify.authenticate],
    }, async (request) => {
        try {
            if (!request.ability.can('update', 'Project')) {
                throw new ForbiddenError();
            }

            const { id } = request.params as { id: string };
            const validated = updateProjectSchema.parse(request.body);
            const agencyId = request.user.agencyId;
            if (!agencyId) throw new ForbiddenError('No agency context');

            const project = await service.updateProject(agencyId, id, validated);
            return { success: true, data: mapToSnakeCase(project) };
        } catch (error) {
            fastify.log.error({ error, id: (request.params as any).id, context: 'PATCH /projects/:id' });
            throw error;
        }
    });

    // DELETE /projects/:id
    fastify.delete('/:id', {
        onRequest: [fastify.authenticate],
    }, async (request) => {
        try {
            if (!request.ability.can('delete', 'Project')) {
                throw new ForbiddenError();
            }

            const { id } = request.params as { id: string };
            const agencyId = request.user.agencyId;
            if (!agencyId) throw new ForbiddenError('No agency context');

            await service.deleteProject(agencyId, id);
            return { success: true };
        } catch (error) {
            fastify.log.error({ error, id: (request.params as any).id, context: 'DELETE /projects/:id' });
            throw error;
        }
    });
};

export default projectRoutes;
