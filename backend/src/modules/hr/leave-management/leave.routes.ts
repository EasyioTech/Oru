import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { LeaveService } from './leave.service.js';
import { createLeaveRequestSchema, updateLeaveRequestSchema } from './leave.schemas.js';
import { mapToSnakeCase, mapToCamelCase } from '../../../utils/case-transform.js';

export const leaveRoutes: FastifyPluginAsync = async (fastify) => {
  const auth = { onRequest: [fastify.authenticate] };

  const getSvc = (req: FastifyRequest) => {
    const agencyId = (req as any).user?.agencyId;
    const db = (req as any).agencyDb || fastify.db;
    return new LeaveService(db, agencyId);
  };

  const isAdminOrHR = (req: FastifyRequest) => {
    const roles = (req as any).user?.roles || [];
    return ['super_admin', 'agency_admin', 'manager', 'hr_manager'].some((r) => roles.includes(r));
  };

  // Leave Types
  fastify.get('/leaves/types', auth, async (request) => {
    const types = await getSvc(request).getLeaveTypes();
    return { success: true, data: types.map((t: any) => mapToSnakeCase(t)) };
  });

  // Leave Requests List
  fastify.get('/leaves/requests', auth, async (request) => {
    const { employeeId, employee_id } = request.query as any;
    const targetEmployeeId = employeeId || employee_id;
    const currentUserId = (request as any).user?.id;
    const data = await getSvc(request).getLeaveRequests(targetEmployeeId, isAdminOrHR(request), currentUserId);
    return { success: true, data: data.map((r: any) => mapToSnakeCase(r)) };
  });

  // Create Leave Request
  fastify.post('/leaves/requests', auth, async (request, reply) => {
    const camelBody = mapToCamelCase(request.body || {});
    const validated = createLeaveRequestSchema.parse(camelBody);
    const currentUserId = (request as any).user?.id;
    const leaveRequest = await getSvc(request).createLeaveRequest(validated, isAdminOrHR(request), currentUserId);
    return reply.code(201).send({ success: true, data: mapToSnakeCase(leaveRequest) });
  });

  // Update Leave Request (Approval / Status / Modification)
  fastify.put('/leaves/requests/:id', auth, async (request) => {
    const { id } = request.params as { id: string };
    const camelBody = mapToCamelCase(request.body || {});
    const validated = updateLeaveRequestSchema.parse(camelBody);
    const currentUserId = (request as any).user?.id;
    const leaveRequest = await getSvc(request).updateLeaveRequest(id, validated, isAdminOrHR(request), currentUserId);
    return { success: true, data: mapToSnakeCase(leaveRequest) };
  });
};
