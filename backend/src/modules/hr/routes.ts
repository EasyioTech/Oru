import { FastifyPluginAsync } from 'fastify';
import { departmentRoutes } from './department-management/department.routes.js';
import { employeeRoutes } from './employee-management/employee.routes.js';
import { leaveRoutes } from './leave-management/leave.routes.js';

const hrRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(departmentRoutes);
  await fastify.register(employeeRoutes);
  await fastify.register(leaveRoutes);
};

export default hrRoutes;
