import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { ProjectService } from './service.js';
import { mapToSnakeCase } from '../../utils/case-transform.js';
import { ForbiddenError } from '../../utils/errors.js';

const projectRoutes: FastifyPluginAsync = async (fastify) => {
    const svc = (req: FastifyRequest) =>
        new ProjectService((req as any).agencyDb || fastify.db, req.user.agencyId as string);

    // --- PROJECTS ---

    fastify.get('/', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('read', 'Project')) throw new ForbiddenError();
        return { success: true, data: (await svc(request).getProjects(request.query as any)).map((d: any) => mapToSnakeCase(d)) };
    });

    fastify.get('/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('read', 'Project')) throw new ForbiddenError();
        const { id } = request.params as { id: string };
        const project = await svc(request).getProject(id);
        const tasks = await svc(request).getTasks(id);
        return { success: true, data: { ...mapToSnakeCase(project), tasks: tasks.map((t: any) => mapToSnakeCase(t)) } };
    });

    fastify.post('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        if (request.ability.cannot('create', 'Project')) throw new ForbiddenError();
        return reply.code(201).send({ success: true, data: mapToSnakeCase(await svc(request).createProject(request.body as any)) });
    });

    fastify.put('/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('update', 'Project')) throw new ForbiddenError();
        const { id } = request.params as { id: string };
        return { success: true, data: mapToSnakeCase(await svc(request).updateProject(id, request.body as any)) };
    });

    fastify.delete('/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('delete', 'Project')) throw new ForbiddenError();
        const { id } = request.params as { id: string };
        await svc(request).deleteProject(id);
        return { success: true };
    });

    // --- TASKS ---

    fastify.get('/:projectId/tasks', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('read', 'Task')) throw new ForbiddenError();
        const { projectId } = request.params as { projectId: string };
        return { success: true, data: (await svc(request).getTasks(projectId)).map((d: any) => mapToSnakeCase(d)) };
    });

    fastify.post('/:projectId/tasks', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        if (request.ability.cannot('create', 'Task')) throw new ForbiddenError();
        const { projectId } = request.params as { projectId: string };
        return reply.code(201).send({ success: true, data: mapToSnakeCase(await svc(request).createTask(projectId, request.body as any)) });
    });

    fastify.put('/tasks/:taskId', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('update', 'Task')) throw new ForbiddenError();
        const { taskId } = request.params as { taskId: string };
        return { success: true, data: mapToSnakeCase(await svc(request).updateTask(taskId, request.body as any)) };
    });

    fastify.delete('/tasks/:taskId', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('delete', 'Task')) throw new ForbiddenError();
        const { taskId } = request.params as { taskId: string };
        await svc(request).deleteTask(taskId);
        return { success: true };
    });
};

export default projectRoutes;
