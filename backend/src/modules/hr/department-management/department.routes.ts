import { FastifyPluginAsync } from 'fastify';
import { DepartmentService } from './department.service.js';
import { createDepartmentSchema, updateDepartmentSchema } from './department.schemas.js';
import { ForbiddenError } from '../../../utils/errors.js';
import { mapToSnakeCase, mapToCamelCase } from '../../../utils/case-transform.js';

export const departmentRoutes: FastifyPluginAsync = async (fastify) => {
  const auth = { onRequest: [fastify.authenticate] };

  const getSvc = (request: any) => {
    const agencyId = request.user?.agencyId;
    const db = request.agencyDb || fastify.db;
    return new DepartmentService(db, agencyId);
  };

  // Department Stats
  fastify.get('/departments/stats', auth, async (request) => {
    if (request.ability.cannot('read', 'Department')) throw new ForbiddenError();
    const stats = await getSvc(request).getDepartmentStats();
    return { success: true, data: stats };
  });

  // List Departments
  fastify.get('/departments', auth, async (request) => {
    if (request.ability.cannot('read', 'Department')) throw new ForbiddenError();
    const { is_active, search } = request.query as { is_active?: string; search?: string };
    const departments = await getSvc(request).getDepartments(is_active, search);
    return { success: true, data: departments.map((d: any) => mapToSnakeCase(d)) };
  });

  // Get Department by ID
  fastify.get('/departments/:id', auth, async (request) => {
    if (request.ability.cannot('read', 'Department')) throw new ForbiddenError();
    const { id } = request.params as { id: string };
    const department = await getSvc(request).getDepartmentById(id);
    return { success: true, data: mapToSnakeCase(department) };
  });

  // Create Department
  fastify.post('/departments', auth, async (request, reply) => {
    if (request.ability.cannot('create', 'Department')) throw new ForbiddenError();
    const camelBody = mapToCamelCase(request.body || {});
    const validated = createDepartmentSchema.parse(camelBody);
    const department = await getSvc(request).createDepartment(validated);
    return reply.code(201).send({ success: true, data: mapToSnakeCase(department) });
  });

  // Update Department
  fastify.put('/departments/:id', auth, async (request) => {
    if (request.ability.cannot('update', 'Department')) throw new ForbiddenError();
    const { id } = request.params as { id: string };
    const camelBody = mapToCamelCase(request.body || {});
    const validated = updateDepartmentSchema.parse(camelBody);
    const department = await getSvc(request).updateDepartment(id, validated);
    return { success: true, data: mapToSnakeCase(department) };
  });

  // Delete Department
  fastify.delete('/departments/:id', auth, async (request) => {
    if (request.ability.cannot('delete', 'Department')) throw new ForbiddenError();
    const { id } = request.params as { id: string };
    await getSvc(request).deleteDepartment(id);
    return { success: true, message: 'Department deleted successfully' };
  });
};
