import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { HrService } from './service.js';
import { ForbiddenError } from '../../utils/errors.js';
import { mapToSnakeCase, mapToCamelCase } from '../../utils/case-transform.js';
import { DepartmentBody, EmployeeBody } from './types.js';

const hrRoutes: FastifyPluginAsync = async (fastify) => {
    const auth = { onRequest: [fastify.authenticate] };
    const svc = (req: FastifyRequest) =>
        new HrService((req as any).agencyDb || fastify.db, req.user.agencyId as string);
    const isAdminOrHR = (req: FastifyRequest) =>
        ['super_admin', 'agency_admin', 'manager'].some(r => req.user.roles.includes(r));

    fastify.get('/departments/stats', auth, async (request) => {
        if (request.ability.cannot('read', 'Department')) throw new ForbiddenError();
        return { success: true, data: await svc(request).getDepartmentStats() };
    });

    fastify.get('/departments', auth, async (request) => {
        if (request.ability.cannot('read', 'Department')) throw new ForbiddenError();
        const { is_active, search } = request.query as { is_active?: string; search?: string };
        const data = await svc(request).getDepartments(is_active, search);
        return { success: true, data: data.map((d: any) => mapToSnakeCase(d)) };
    });

    fastify.post('/departments', auth, async (request, reply) => {
        if (request.ability.cannot('create', 'Department')) throw new ForbiddenError();
        const dept = await svc(request).createDepartment(mapToCamelCase(request.body) as DepartmentBody);
        return reply.code(201).send({ success: true, data: mapToSnakeCase(dept) });
    });

    fastify.put('/departments/:id', auth, async (request) => {
        if (request.ability.cannot('update', 'Department')) throw new ForbiddenError();
        const { id } = request.params as { id: string };
        const dept = await svc(request).updateDepartment(id, mapToCamelCase(request.body) as DepartmentBody);
        return { success: true, data: mapToSnakeCase(dept) };
    });

    fastify.delete('/departments/:id', auth, async (request) => {
        if (request.ability.cannot('delete', 'Department')) throw new ForbiddenError();
        const { id } = request.params as { id: string };
        await svc(request).deleteDepartment(id);
        return { success: true };
    });

    fastify.get('/employees', auth, async (request) => {
        if (request.ability.cannot('read', 'Employee')) throw new ForbiddenError();
        const { status, departmentId, search } = request.query as { status?: string; departmentId?: string; search?: string };
        const data = await svc(request).getEmployees(status, departmentId, search);
        return { success: true, data: data.map((d: any) => mapToSnakeCase(d)) };
    });

    fastify.get('/employees/:id', auth, async (request) => {
        if (request.ability.cannot('read', 'Employee')) throw new ForbiddenError();
        const { id } = request.params as { id: string };
        return { success: true, data: mapToSnakeCase(await svc(request).getEmployeeById(id)) };
    });

    fastify.post('/employees', auth, async (request, reply) => {
        if (request.ability.cannot('create', 'Employee')) throw new ForbiddenError();
        const emp = await svc(request).createEmployee(mapToCamelCase(request.body) as EmployeeBody);
        return reply.code(201).send({ success: true, data: mapToSnakeCase(emp) });
    });

    fastify.put('/employees/:id', auth, async (request) => {
        if (request.ability.cannot('update', 'Employee')) throw new ForbiddenError();
        const { id } = request.params as { id: string };
        return { success: true, data: mapToSnakeCase(await svc(request).updateEmployee(id, mapToCamelCase(request.body) as Partial<EmployeeBody>)) };
    });

    fastify.delete('/employees/:id', auth, async (request) => {
        if (request.ability.cannot('delete', 'Employee')) throw new ForbiddenError();
        const { id } = request.params as { id: string };
        await svc(request).deleteEmployee(id);
        return { success: true };
    });

    fastify.get('/employees/:id/projects', auth, async (request) => {
        if (request.ability.cannot('read', 'Project')) throw new ForbiddenError();
        return { success: true, data: [] };
    });

    fastify.get('/leaves/types', auth, async (request) => {
        const types = await svc(request).getLeaveTypes();
        return { success: true, data: types.map((t: any) => mapToSnakeCase(t)) };
    });

    fastify.get('/leaves/requests', auth, async (request) => {
        const { employeeId } = request.query as { employeeId?: string };
        const data = await svc(request).getLeaveRequests(employeeId, isAdminOrHR(request), request.user.id);
        return { success: true, data: data.map((r: any) => mapToSnakeCase(r)) };
    });

    fastify.post('/leaves/requests', auth, async (request, reply) => {
        const leaveRequest = await svc(request).createLeaveRequest(request.body, isAdminOrHR(request), request.user.id);
        return reply.code(201).send({ success: true, data: mapToSnakeCase(leaveRequest) });
    });

    fastify.put('/leaves/requests/:id', auth, async (request) => {
        const { id } = request.params as { id: string };
        const leaveRequest = await svc(request).updateLeaveRequest(id, request.body, isAdminOrHR(request), request.user.id);
        return { success: true, data: mapToSnakeCase(leaveRequest) };
    });
};

export default hrRoutes;
