import { FastifyPluginAsync } from 'fastify';
import { EmployeeService } from './employee.service.js';
import { createEmployeeSchema, updateEmployeeSchema } from './employee.schemas.js';
import { ForbiddenError, ValidationError } from '../../../utils/errors.js';
import { mapToSnakeCase, mapToCamelCase } from '../../../utils/case-transform.js';
import { agencies, profiles, userRoles } from '../../../infrastructure/database/schema.js';
import { eq, and, isNull, isNotNull } from 'drizzle-orm';

export const employeeRoutes: FastifyPluginAsync = async (fastify) => {
  const auth = { onRequest: [fastify.authenticate] };

  const getSvc = async (request: any) => {
    let agencyId = request.user?.agencyId
      || request.headers['x-agency-id']
      || request.headers['agency-id']
      || (request.body as any)?.agencyId
      || (request.body as any)?.agency_id
      || (request.query as any)?.agencyId
      || (request.query as any)?.agency_id;

    const db = request.agencyDb || fastify.db;

    if (!agencyId && request.user?.id) {
      try {
        const [prof] = await db
          .select({ agencyId: profiles.agencyId })
          .from(profiles)
          .where(and(eq(profiles.userId, request.user.id), isNull(profiles.deletedAt)))
          .limit(1);
        if (prof?.agencyId) agencyId = prof.agencyId;
      } catch {}

      if (!agencyId) {
        try {
          const [ur] = await db
            .select({ agencyId: userRoles.agencyId })
            .from(userRoles)
            .where(and(eq(userRoles.userId, request.user.id), isNotNull(userRoles.agencyId)))
            .limit(1);
          if (ur?.agencyId) agencyId = ur.agencyId;
        } catch {}
      }
    }

    if (!agencyId) {
      try {
        const [firstAgency] = await db
          .select({ id: agencies.id })
          .from(agencies)
          .where(isNull(agencies.deletedAt))
          .limit(1);
        if (firstAgency?.id) agencyId = firstAgency.id;
      } catch {}
    }

    if (!agencyId) {
      throw new ValidationError('Agency context is required to access employee management');
    }

    return new EmployeeService(db, agencyId);
  };

  // List Employees
  fastify.get('/employees', auth, async (request) => {
    if (request.ability.cannot('read', 'Employee')) throw new ForbiddenError();
    const { status, departmentId, department_id, search } = request.query as any;
    const deptFilter = departmentId || department_id;
    const svc = await getSvc(request);
    const data = await svc.getEmployees(status, deptFilter, search);
    return { success: true, data: data.map((d: any) => mapToSnakeCase(d)) };
  });

  // Get Employee by ID
  fastify.get('/employees/:id', auth, async (request) => {
    if (request.ability.cannot('read', 'Employee')) throw new ForbiddenError();
    const { id } = request.params as { id: string };
    const svc = await getSvc(request);
    const emp = await svc.getEmployeeById(id);
    return { success: true, data: mapToSnakeCase(emp) };
  });

  // Create Employee
  fastify.post('/employees', auth, async (request, reply) => {
    if (request.ability.cannot('create', 'Employee')) throw new ForbiddenError();
    const camelBody = mapToCamelCase(request.body || {});
    const validated = createEmployeeSchema.parse(camelBody);
    const svc = await getSvc(request);
    const emp = await svc.createEmployee(validated);
    return reply.code(201).send({ success: true, data: mapToSnakeCase(emp) });
  });

  // Update Employee
  fastify.put('/employees/:id', auth, async (request) => {
    if (request.ability.cannot('update', 'Employee')) throw new ForbiddenError();
    const { id } = request.params as { id: string };
    const camelBody = mapToCamelCase(request.body || {});
    const validated = updateEmployeeSchema.parse(camelBody);
    const svc = await getSvc(request);
    const emp = await svc.updateEmployee(id, validated);
    return { success: true, data: mapToSnakeCase(emp) };
  });

  // Delete Employee
  fastify.delete('/employees/:id', auth, async (request) => {
    if (request.ability.cannot('delete', 'Employee')) throw new ForbiddenError();
    const { id } = request.params as { id: string };
    const svc = await getSvc(request);
    await svc.deleteEmployee(id);
    return { success: true, message: 'Employee deleted successfully' };
  });

  // Employee Projects (placeholder for project assignment)
  fastify.get('/employees/:id/projects', auth, async (request) => {
    if (request.ability.cannot('read', 'Project')) throw new ForbiddenError();
    return { success: true, data: [] };
  });
};
