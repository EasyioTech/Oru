import { FastifyPluginAsync } from 'fastify';
import { EmployeeService } from './employee.service.js';
import { createEmployeeSchema, updateEmployeeSchema } from './employee.schemas.js';
import { ForbiddenError } from '../../../utils/errors.js';
import { mapToSnakeCase, mapToCamelCase } from '../../../utils/case-transform.js';

export const employeeRoutes: FastifyPluginAsync = async (fastify) => {
  const auth = { onRequest: [fastify.authenticate] };

  const getSvc = (request: any) => {
    const agencyId = request.user?.agencyId;
    const db = request.agencyDb || fastify.db;
    return new EmployeeService(db, agencyId);
  };

  // List Employees
  fastify.get('/employees', auth, async (request) => {
    if (request.ability.cannot('read', 'Employee')) throw new ForbiddenError();
    const { status, departmentId, department_id, search } = request.query as any;
    const deptFilter = departmentId || department_id;
    const data = await getSvc(request).getEmployees(status, deptFilter, search);
    return { success: true, data: data.map((d: any) => mapToSnakeCase(d)) };
  });

  // Get Employee by ID
  fastify.get('/employees/:id', auth, async (request) => {
    if (request.ability.cannot('read', 'Employee')) throw new ForbiddenError();
    const { id } = request.params as { id: string };
    const emp = await getSvc(request).getEmployeeById(id);
    return { success: true, data: mapToSnakeCase(emp) };
  });

  // Create Employee
  fastify.post('/employees', auth, async (request, reply) => {
    if (request.ability.cannot('create', 'Employee')) throw new ForbiddenError();
    const camelBody = mapToCamelCase(request.body || {});
    const validated = createEmployeeSchema.parse(camelBody);
    const emp = await getSvc(request).createEmployee(validated);
    return reply.code(201).send({ success: true, data: mapToSnakeCase(emp) });
  });

  // Update Employee
  fastify.put('/employees/:id', auth, async (request) => {
    if (request.ability.cannot('update', 'Employee')) throw new ForbiddenError();
    const { id } = request.params as { id: string };
    const camelBody = mapToCamelCase(request.body || {});
    const validated = updateEmployeeSchema.parse(camelBody);
    const emp = await getSvc(request).updateEmployee(id, validated);
    return { success: true, data: mapToSnakeCase(emp) };
  });

  // Delete Employee
  fastify.delete('/employees/:id', auth, async (request) => {
    if (request.ability.cannot('delete', 'Employee')) throw new ForbiddenError();
    const { id } = request.params as { id: string };
    await getSvc(request).deleteEmployee(id);
    return { success: true, message: 'Employee deleted successfully' };
  });

  // Employee Projects (placeholder for project assignment)
  fastify.get('/employees/:id/projects', auth, async (request) => {
    if (request.ability.cannot('read', 'Project')) throw new ForbiddenError();
    return { success: true, data: [] };
  });
};
