import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, ilike, or, isNull, isNotNull, SQL, desc } from 'drizzle-orm';
import { departments, employees, leaveTypes, leaveRequests } from './schema.js';
import { profiles } from '../../infrastructure/database/schema.js';
import { DepartmentBody, EmployeeBody } from './types.js';
import { indexEmployees, removeFromIndex } from '../../infrastructure/meilisearch/indexer.js';

export class HrService {
    constructor(
        private db: NodePgDatabase<any> | any,
        private agencyId: string
    ) { }

    async getDepartmentStats() {
        const depts = await this.db.select().from(departments).where(and(eq(departments.agencyId, this.agencyId), isNull(departments.deletedAt)));
        const active = depts.length;
        const inactive = 0;
        const totalBudget = depts.reduce((acc: number, d: any) => acc + (d.budget ? parseFloat(d.budget) : 0), 0);
        
        const emps = await this.db.select().from(employees).where(and(eq(employees.agencyId, this.agencyId), isNull(employees.deletedAt)));
        const totalEmployees = emps.length;
        
        return { active, inactive, totalBudget, totalEmployees };
    }

    async getDepartments(is_active?: string, search?: string) {
        const conditions: SQL[] = [eq(departments.agencyId, this.agencyId)];
        if (is_active === 'true') conditions.push(isNull(departments.deletedAt));
        if (is_active === 'false') conditions.push(isNotNull(departments.deletedAt));
        if (search) conditions.push(ilike(departments.name, `%${search}%`));
        
        const data = await this.db.select().from(departments).where(and(...conditions));
        return data.map((d: any) => ({ ...d, is_active: !d.deletedAt }));
    }

    async createDepartment(body: DepartmentBody) {
        const [dept] = await this.db.insert(departments).values({
            agencyId: this.agencyId,
            name: body.name,
            description: body.description,
            managerId: body.managerId,
        }).returning();
        return dept;
    }

    async updateDepartment(id: string, body: DepartmentBody) {
        const [dept] = await this.db.update(departments).set({
            name: body.name,
            description: body.description,
            managerId: body.managerId,
            updatedAt: new Date(),
        }).where(and(eq(departments.id, id), eq(departments.agencyId, this.agencyId))).returning();
        return dept;
    }

    async deleteDepartment(id: string) {
        await this.db.update(departments).set({ deletedAt: new Date() }).where(and(eq(departments.id, id), eq(departments.agencyId, this.agencyId)));
    }

    async getEmployees(status?: string, departmentId?: string, search?: string) {
        const conditions: SQL[] = [eq(employees.agencyId, this.agencyId)];
        if (status && status !== 'all') conditions.push(eq(employees.status, status));
        conditions.push(isNull(employees.deletedAt));
        if (departmentId) conditions.push(eq(employees.departmentId, departmentId));
        if (search) {
            const searchOr = or(
                ilike(employees.firstName, `%${search}%`),
                ilike(employees.lastName, `%${search}%`),
                ilike(employees.email, `%${search}%`)
            );
            if (searchOr) conditions.push(searchOr);
        }

        const data = await this.db.select().from(employees).where(and(...conditions));
        return data;
    }

    async getEmployeeById(id: string) {
        const [emp] = await this.db.select().from(employees).where(and(eq(employees.id, id), eq(employees.agencyId, this.agencyId)));
        if (!emp) throw new Error('Employee not found');
        return emp;
    }

    async createEmployee(body: EmployeeBody) {
        try {
            const [emp] = await this.db.insert(employees).values({
                agencyId: this.agencyId,
                ...body,
                salary: body.salary?.toString(),
            }).returning();
            Promise.resolve().then(() => indexEmployees(this.agencyId, [emp]).catch(() => {}));
            return emp;
        } catch (error: unknown) {
            throw new Error(`Failed to create employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async updateEmployee(id: string, body: Partial<EmployeeBody>) {
        const [emp] = await this.db.update(employees).set({
            ...body,
            salary: body.salary?.toString(),
            updatedAt: new Date(),
        }).where(and(eq(employees.id, id), eq(employees.agencyId, this.agencyId))).returning();
        Promise.resolve().then(() => indexEmployees(this.agencyId, [emp]).catch(() => {}));
        return emp;
    }

    async deleteEmployee(id: string) {
        await this.db.update(employees).set({ deletedAt: new Date() }).where(and(eq(employees.id, id), eq(employees.agencyId, this.agencyId)));
        Promise.resolve().then(() => removeFromIndex('employees', id).catch(() => {}));
    }

    async getLeaveTypes() {
        return this.db.select().from(leaveTypes).where(and(eq(leaveTypes.agencyId, this.agencyId), eq(leaveTypes.isActive, true)));
    }

    async getLeaveRequests(employeeId?: string, isAdminOrHR?: boolean, currentUserId?: string) {
        const conditions: SQL[] = [eq(leaveRequests.agencyId, this.agencyId), isNull(leaveRequests.deletedAt)];

        if (!isAdminOrHR) {
            if (currentUserId) conditions.push(eq(leaveRequests.employeeId, currentUserId));
        } else if (employeeId) {
            conditions.push(eq(leaveRequests.employeeId, employeeId));
        }

        const rawRequests = await this.db.select({
            request: leaveRequests,
            leaveType: leaveTypes,
            employeeProfile: profiles,
        })
        .from(leaveRequests)
        .leftJoin(leaveTypes, eq(leaveRequests.leaveTypeId, leaveTypes.id))
        .leftJoin(profiles, eq(leaveRequests.employeeId, profiles.userId))
        .where(and(...conditions))
        .orderBy(desc(leaveRequests.createdAt));

        return rawRequests.map((r: any) => ({
            ...r.request,
            leave_type: r.leaveType ? r.leaveType : null,
            employee: r.employeeProfile ? r.employeeProfile : null,
        }));
    }

    async createLeaveRequest(body: any, isAdminOrHR: boolean, currentUserId: string) {
        const employeeId = body.employee_id || currentUserId;
        
        if (!isAdminOrHR && employeeId !== currentUserId) {
            throw new Error('You can only create leave requests for yourself');
        }

        const [leaveRequest] = await this.db.insert(leaveRequests).values({
            agencyId: this.agencyId,
            employeeId,
            leaveTypeId: body.leave_type_id,
            startDate: body.start_date,
            endDate: body.end_date,
            totalDays: body.total_days,
            reason: body.reason,
            status: isAdminOrHR ? (body.status || 'pending') : 'pending',
        }).returning();

        return leaveRequest;
    }

    async updateLeaveRequest(id: string, body: any, isAdminOrHR: boolean, currentUserId: string) {
        const conditions = [eq(leaveRequests.id, id), eq(leaveRequests.agencyId, this.agencyId)];
        
        if (!isAdminOrHR) {
            conditions.push(eq(leaveRequests.employeeId, currentUserId));
            conditions.push(eq(leaveRequests.status, 'pending'));
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
                updateData.approvedBy = currentUserId;
                updateData.approvedAt = new Date();
                if (body.rejection_reason) updateData.rejectionReason = body.rejection_reason;
            }
        }

        const [leaveRequest] = await this.db.update(leaveRequests).set(updateData).where(and(...conditions)).returning();
        if (!leaveRequest) throw new Error('Leave request not found or cannot be modified');

        return leaveRequest;
    }
}
