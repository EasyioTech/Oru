import { FastifyPluginAsync } from 'fastify';
import { db } from '../../infrastructure/database/index.js';
import { departments, employees, leaveTypes, leaveRequests, profiles } from '../../infrastructure/database/schema.js';
import { eq, and, ilike, or, isNull, isNotNull, SQL, desc } from 'drizzle-orm';
import { ForbiddenError } from '../../utils/errors.js';
import { mapToSnakeCase } from '../../utils/case-transform.js';

interface DepartmentBody {
    name: string;
    description?: string;
    managerId?: string;
}

interface EmployeeBody {
    userId?: string;
    profileId?: string;
    departmentId?: string;
    employeeCode?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    position?: string;
    employmentType?: string;
    status?: string;
    hireDate?: string;
    salary?: string | number;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    address?: string;
    avatarUrl?: string;
    notes?: string;
}

const hrRoutes: FastifyPluginAsync = async (fastify) => {
    // --- DEPARTMENTS ---

    fastify.get('/departments/stats', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('read', 'Department')) throw new ForbiddenError('Insufficient permissions');
        const agencyId = request.user.agencyId as string;
        if (!agencyId) throw new ForbiddenError('No agency context');
        
        const depts = await db.select().from(departments).where(and(eq(departments.agencyId, agencyId), isNull(departments.deletedAt)));
        const active = depts.length;
        const inactive = 0;
        const totalBudget = depts.reduce((acc, d) => acc + (d.budget ? parseFloat(d.budget) : 0), 0);
        
        const emps = await db.select().from(employees).where(and(eq(employees.agencyId, agencyId), isNull(employees.deletedAt)));
        const totalEmployees = emps.length;
        
        return { success: true, data: { active, inactive, totalBudget, totalEmployees } };
    });

    fastify.get('/departments', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('read', 'Department')) throw new ForbiddenError('Insufficient permissions');
        const agencyId = request.user.agencyId as string;
        if (!agencyId) throw new ForbiddenError('No agency context');
        const { is_active, search } = request.query as { is_active?: string; search?: string };
        
        const conditions: SQL[] = [eq(departments.agencyId, agencyId)];
        if (is_active === 'true') conditions.push(isNull(departments.deletedAt));
        if (is_active === 'false') conditions.push(isNotNull(departments.deletedAt));
        if (search) conditions.push(ilike(departments.name, `%${search}%`));
        
        const data = await db.select().from(departments).where(and(...conditions));
        return { success: true, data: data.map(d => ({ ...mapToSnakeCase(d), is_active: !d.deletedAt })) };
    });

    fastify.post('/departments', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        if (request.ability.cannot('create', 'Department')) throw new ForbiddenError('Insufficient permissions');
        const agencyId = request.user.agencyId as string;
        if (!agencyId) throw new ForbiddenError('No agency context');
        const body = request.body as DepartmentBody;
        const [dept] = await db.insert(departments).values({
            agencyId,
            name: body.name,
            description: body.description,
            managerId: body.managerId,
        }).returning();
        return reply.code(201).send({ success: true, data: mapToSnakeCase(dept) });
    });

    fastify.put('/departments/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('update', 'Department')) throw new ForbiddenError('Insufficient permissions');
        const { id } = request.params as { id: string };
        const agencyId = request.user.agencyId as string;
        if (!agencyId) throw new ForbiddenError('No agency context');
        const body = request.body as DepartmentBody;
        const [dept] = await db.update(departments).set({
            name: body.name,
            description: body.description,
            managerId: body.managerId,
            updatedAt: new Date(),
        }).where(and(eq(departments.id, id), eq(departments.agencyId, agencyId))).returning();
        return { success: true, data: mapToSnakeCase(dept) };
    });

    fastify.delete('/departments/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('delete', 'Department')) throw new ForbiddenError('Insufficient permissions');
        const { id } = request.params as { id: string };
        const agencyId = request.user.agencyId as string;
        if (!agencyId) throw new ForbiddenError('No agency context');
        await db.update(departments).set({ deletedAt: new Date() }).where(and(eq(departments.id, id), eq(departments.agencyId, agencyId)));
        return { success: true };
    });

    // --- EMPLOYEES ---

    fastify.get('/employees', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('read', 'Employee')) throw new ForbiddenError('Insufficient permissions');
        const agencyId = request.user.agencyId as string;
        if (!agencyId) throw new ForbiddenError('No agency context');
        const { status, departmentId, search } = request.query as { status?: string; departmentId?: string; search?: string };
        
        const conditions: SQL[] = [eq(employees.agencyId, agencyId)];
        if (status && status !== 'all') conditions.push(eq(employees.status, status));
        conditions.push(isNull(employees.deletedAt)); // Always filter out deleted employees unless explicitly requested
        if (departmentId) conditions.push(eq(employees.departmentId, departmentId));
        if (search) {
            const searchOr = or(
                ilike(employees.firstName, `%${search}%`),
                ilike(employees.lastName, `%${search}%`),
                ilike(employees.email, `%${search}%`)
            );
            if (searchOr) conditions.push(searchOr);
        }

        const data = await db.select().from(employees).where(and(...conditions));
        return { success: true, data: data.map(mapToSnakeCase) };
    });

    fastify.get('/employees/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('read', 'Employee')) throw new ForbiddenError('Insufficient permissions');
        const agencyId = request.user.agencyId as string;
        if (!agencyId) throw new ForbiddenError('No agency context');
        const { id } = request.params as { id: string };
        const [emp] = await db.select().from(employees).where(and(eq(employees.id, id), eq(employees.agencyId, agencyId)));
        if (!emp) throw new Error('Employee not found');
        return { success: true, data: mapToSnakeCase(emp) };
    });

    fastify.post('/employees', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        if (request.ability.cannot('create', 'Employee')) throw new ForbiddenError('Insufficient permissions');
        const agencyId = request.user.agencyId as string;
        if (!agencyId) throw new ForbiddenError('No agency context');
        const body = request.body as EmployeeBody;
        try {
            const [emp] = await db.insert(employees).values({
                agencyId,
                ...body,
                salary: body.salary?.toString(),
            }).returning();
            return reply.code(201).send({ success: true, data: mapToSnakeCase(emp) });
        } catch (error: unknown) {
            console.error('[HR Route Error] Failed to create employee:', error);
            throw new Error(`Failed to create employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    });

    fastify.put('/employees/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('update', 'Employee')) throw new ForbiddenError('Insufficient permissions');
        const { id } = request.params as { id: string };
        const agencyId = request.user.agencyId as string;
        if (!agencyId) throw new ForbiddenError('No agency context');
        const body = request.body as Partial<EmployeeBody>;
        const [emp] = await db.update(employees).set({
            ...body,
            salary: body.salary?.toString(),
            updatedAt: new Date(),
        }).where(and(eq(employees.id, id), eq(employees.agencyId, agencyId))).returning();
        return { success: true, data: mapToSnakeCase(emp) };
    });

    fastify.delete('/employees/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('delete', 'Employee')) throw new ForbiddenError('Insufficient permissions');
        const { id } = request.params as { id: string };
        const agencyId = request.user.agencyId as string;
        if (!agencyId) throw new ForbiddenError('No agency context');
        await db.update(employees).set({ deletedAt: new Date() }).where(and(eq(employees.id, id), eq(employees.agencyId, agencyId)));
        return { success: true };
    });
    
    fastify.get('/employees/:id/projects', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('read', 'Project')) throw new ForbiddenError('Insufficient permissions');
        return { success: true, data: [] };
    });

    // --- LEAVES ---

    fastify.get('/leaves/types', { onRequest: [fastify.authenticate] }, async (request) => {
        const agencyId = request.user.agencyId as string;
        if (!agencyId) throw new ForbiddenError('No agency context');
        const types = await db.select().from(leaveTypes).where(and(eq(leaveTypes.agencyId, agencyId), eq(leaveTypes.isActive, true)));
        return { success: true, data: types.map(mapToSnakeCase) };
    });

    fastify.get('/leaves/requests', { onRequest: [fastify.authenticate] }, async (request) => {
        const agencyId = request.user.agencyId as string;
        if (!agencyId) throw new ForbiddenError('No agency context');
        
        const { employeeId } = request.query as { employeeId?: string };
        const conditions: SQL[] = [eq(leaveRequests.agencyId, agencyId), isNull(leaveRequests.deletedAt)];

        // If user is not admin/manager, they can only see their own requests
        const isAdminOrHR = ['super_admin', 'agency_admin', 'manager'].some(r => request.user.roles.includes(r));
        if (!isAdminOrHR) {
            conditions.push(eq(leaveRequests.employeeId, request.user.id));
        } else if (employeeId) {
            conditions.push(eq(leaveRequests.employeeId, employeeId));
        }

        const rawRequests = await db.select({
            request: leaveRequests,
            leaveType: leaveTypes,
            employeeProfile: profiles,
        })
        .from(leaveRequests)
        .leftJoin(leaveTypes, eq(leaveRequests.leaveTypeId, leaveTypes.id))
        .leftJoin(profiles, eq(leaveRequests.employeeId, profiles.userId))
        .where(and(...conditions))
        .orderBy(desc(leaveRequests.createdAt));

        const data = rawRequests.map(r => ({
            ...mapToSnakeCase(r.request),
            leave_type: r.leaveType ? mapToSnakeCase(r.leaveType) : null,
            employee: r.employeeProfile ? mapToSnakeCase(r.employeeProfile) : null,
        }));

        return { success: true, data };
    });

    fastify.post('/leaves/requests', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const agencyId = request.user.agencyId as string;
        if (!agencyId) throw new ForbiddenError('No agency context');
        
        const body = request.body as any;
        const employeeId = body.employee_id || request.user.id;
        
        // Non-admins can only create requests for themselves
        const isAdminOrHR = ['super_admin', 'agency_admin', 'manager'].some(r => request.user.roles.includes(r));
        if (!isAdminOrHR && employeeId !== request.user.id) {
            throw new ForbiddenError('You can only create leave requests for yourself');
        }

        const [leaveRequest] = await db.insert(leaveRequests).values({
            agencyId,
            employeeId,
            leaveTypeId: body.leave_type_id,
            startDate: body.start_date,
            endDate: body.end_date,
            totalDays: body.total_days,
            reason: body.reason,
            status: isAdminOrHR ? (body.status || 'pending') : 'pending',
        }).returning();

        return reply.code(201).send({ success: true, data: mapToSnakeCase(leaveRequest) });
    });

    fastify.put('/leaves/requests/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        const agencyId = request.user.agencyId as string;
        if (!agencyId) throw new ForbiddenError('No agency context');
        const { id } = request.params as { id: string };
        const body = request.body as any;
        
        const conditions = [eq(leaveRequests.id, id), eq(leaveRequests.agencyId, agencyId)];
        
        const isAdminOrHR = ['super_admin', 'agency_admin', 'manager'].some(r => request.user.roles.includes(r));
        if (!isAdminOrHR) {
            // Employee can only update their own PENDING requests (e.g. to edit reason or dates)
            conditions.push(eq(leaveRequests.employeeId, request.user.id));
            conditions.push(eq(leaveRequests.status, 'pending'));
            
            // They cannot change status to approved
            delete body.status;
            delete body.employee_id;
        }

        const updateData: any = {
            updatedAt: new Date(),
        };

        if (body.leave_type_id) updateData.leaveTypeId = body.leave_type_id;
        if (body.start_date) updateData.startDate = body.start_date;
        if (body.end_date) updateData.endDate = body.end_date;
        if (body.total_days !== undefined) updateData.totalDays = body.total_days;
        if (body.reason) updateData.reason = body.reason;
        
        if (isAdminOrHR && body.status) {
            updateData.status = body.status;
            if (body.status === 'approved' || body.status === 'rejected') {
                updateData.approvedBy = request.user.id;
                updateData.approvedAt = new Date();
                if (body.rejection_reason) updateData.rejectionReason = body.rejection_reason;
            }
        }

        const [leaveRequest] = await db.update(leaveRequests).set(updateData).where(and(...conditions)).returning();
        if (!leaveRequest) throw new Error('Leave request not found or cannot be modified');

        return { success: true, data: mapToSnakeCase(leaveRequest) };
    });
};

export default hrRoutes;
