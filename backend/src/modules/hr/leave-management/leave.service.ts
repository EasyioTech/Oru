import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, isNull, SQL, desc } from 'drizzle-orm';
import { leaveTypes, leaveRequests } from '../schema.js';
import { profiles } from '../../../infrastructure/database/schema.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../../../utils/errors.js';
import { CreateLeaveRequestInput, UpdateLeaveRequestInput } from './leave.schemas.js';

export class LeaveService {
  constructor(
    private db: NodePgDatabase<any> | any,
    private agencyId: string
  ) {}

  async getLeaveTypes() {
    return this.db
      .select()
      .from(leaveTypes)
      .where(and(eq(leaveTypes.agencyId, this.agencyId), eq(leaveTypes.isActive, true)));
  }

  async getLeaveRequests(employeeId?: string, isAdminOrHR?: boolean, currentUserId?: string) {
    const conditions: SQL[] = [
      eq(leaveRequests.agencyId, this.agencyId),
      isNull(leaveRequests.deletedAt),
    ];

    if (!isAdminOrHR) {
      if (currentUserId) conditions.push(eq(leaveRequests.employeeId, currentUserId));
    } else if (employeeId) {
      conditions.push(eq(leaveRequests.employeeId, employeeId));
    }

    const rawRequests = await this.db
      .select({
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
      leaveType: r.leaveType ?? null,
      leave_type: r.leaveType ?? null,
      employee: r.employeeProfile
        ? {
            id: r.employeeProfile.id,
            fullName: r.employeeProfile.fullName,
            email: r.employeeProfile.email,
            avatarUrl: r.employeeProfile.avatarUrl,
          }
        : null,
    }));
  }

  async createLeaveRequest(input: CreateLeaveRequestInput, isAdminOrHR: boolean, currentUserId: string) {
    const targetEmployeeId = input.employeeId || currentUserId;

    if (!isAdminOrHR && targetEmployeeId !== currentUserId) {
      throw new ForbiddenError('You can only apply for leave on your own behalf');
    }

    // Verify date order
    const start = new Date(input.startDate);
    const end = new Date(input.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ValidationError('Invalid start or end date');
    }
    if (start > end) {
      throw new ValidationError('Leave start date cannot be after end date');
    }

    // Verify leave type exists for this agency
    const [typeRecord] = await this.db
      .select()
      .from(leaveTypes)
      .where(and(eq(leaveTypes.id, input.leaveTypeId), eq(leaveTypes.agencyId, this.agencyId)))
      .limit(1);

    if (!typeRecord) {
      throw new NotFoundError('Invalid leave type selected');
    }

    const [created] = await this.db
      .insert(leaveRequests)
      .values({
        agencyId: this.agencyId,
        employeeId: targetEmployeeId,
        leaveTypeId: input.leaveTypeId,
        startDate: input.startDate,
        endDate: input.endDate,
        totalDays: input.totalDays,
        reason: input.reason.trim(),
        status: isAdminOrHR ? input.status || 'pending' : 'pending',
      })
      .returning();

    return created;
  }

  async updateLeaveRequest(id: string, input: UpdateLeaveRequestInput, isAdminOrHR: boolean, currentUserId: string) {
    const conditions = [
      eq(leaveRequests.id, id),
      eq(leaveRequests.agencyId, this.agencyId),
      isNull(leaveRequests.deletedAt),
    ];

    const [existing] = await this.db
      .select()
      .from(leaveRequests)
      .where(and(...conditions))
      .limit(1);

    if (!existing) {
      throw new NotFoundError('Leave request not found');
    }

    if (!isAdminOrHR && existing.employeeId !== currentUserId) {
      throw new ForbiddenError('You can only modify your own leave requests');
    }

    if (!isAdminOrHR && existing.status !== 'pending') {
      throw new ValidationError('Only pending leave requests can be modified');
    }

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (input.leaveTypeId) updateData.leaveTypeId = input.leaveTypeId;
    if (input.startDate) updateData.startDate = input.startDate;
    if (input.endDate) updateData.endDate = input.endDate;
    if (input.totalDays !== undefined) updateData.totalDays = input.totalDays;
    if (input.reason) updateData.reason = input.reason.trim();

    if (isAdminOrHR && input.status) {
      updateData.status = input.status;
      if (input.status === 'approved' || input.status === 'rejected') {
        updateData.approvedBy = currentUserId;
        updateData.approvedAt = new Date();
        if (input.rejectionReason) updateData.rejectionReason = input.rejectionReason.trim();
      }
    } else if (!isAdminOrHR && input.status === 'cancelled') {
      updateData.status = 'cancelled';
    }

    const [updated] = await this.db
      .update(leaveRequests)
      .set(updateData)
      .where(and(eq(leaveRequests.id, id), eq(leaveRequests.agencyId, this.agencyId)))
      .returning();

    return updated;
  }
}
