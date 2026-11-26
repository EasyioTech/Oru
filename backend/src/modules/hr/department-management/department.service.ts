import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, ilike, isNull, isNotNull, SQL, not, asc, count } from 'drizzle-orm';
import { departments, employees } from '../schema.js';
import { profiles } from '../../../infrastructure/database/schema.js';
import { AppError, NotFoundError, ValidationError } from '../../../utils/errors.js';
import { CreateDepartmentInput, UpdateDepartmentInput } from './department.schemas.js';

export class DepartmentService {
  constructor(
    private db: NodePgDatabase<any> | any,
    private agencyId: string
  ) {}

  async getDepartmentStats() {
    const [allDepts, activeEmps] = await Promise.all([
      this.db
        .select()
        .from(departments)
        .where(eq(departments.agencyId, this.agencyId)),
      this.db
        .select({ count: count() })
        .from(employees)
        .where(and(eq(employees.agencyId, this.agencyId), isNull(employees.deletedAt))),
    ]);

    const activeDepts = allDepts.filter((d: any) => !d.deletedAt);
    const inactiveDepts = allDepts.filter((d: any) => !!d.deletedAt);

    const totalBudget = activeDepts.reduce((acc: number, d: any) => {
      return acc + (d.budget ? parseFloat(d.budget) : 0);
    }, 0);

    return {
      active: activeDepts.length,
      inactive: inactiveDepts.length,
      totalBudget,
      totalEmployees: activeEmps[0]?.count ?? 0,
    };
  }

  async getDepartments(isActive?: string, search?: string) {
    const conditions: SQL[] = [eq(departments.agencyId, this.agencyId)];

    if (isActive === 'true') {
      conditions.push(isNull(departments.deletedAt));
    } else if (isActive === 'false') {
      conditions.push(isNotNull(departments.deletedAt));
    }

    if (search && search.trim()) {
      conditions.push(ilike(departments.name, `%${search.trim()}%`));
    }

    const deptRows = await this.db
      .select({
        department: departments,
        managerProfile: profiles,
      })
      .from(departments)
      .leftJoin(profiles, eq(departments.managerId, profiles.id))
      .where(and(...conditions))
      .orderBy(asc(departments.name));

    // Get active employee counts per department for this agency
    const empCountRows = await this.db
      .select({
        departmentId: employees.departmentId,
        count: count(),
      })
      .from(employees)
      .where(and(eq(employees.agencyId, this.agencyId), isNull(employees.deletedAt)))
      .groupBy(employees.departmentId);

    const countMap = new Map<string, number>();
    for (const row of empCountRows) {
      if (row.departmentId) {
        countMap.set(row.departmentId, Number(row.count));
      }
    }

    return deptRows.map((r: any) => ({
      ...r.department,
      isActive: !r.department.deletedAt,
      is_active: !r.department.deletedAt,
      employeeCount: countMap.get(r.department.id) || 0,
      employee_count: countMap.get(r.department.id) || 0,
      manager: r.managerProfile
        ? {
            id: r.managerProfile.id,
            fullName: r.managerProfile.fullName,
            email: r.managerProfile.email,
            avatarUrl: r.managerProfile.avatarUrl,
          }
        : null,
    }));
  }

  async getDepartmentById(id: string) {
    const [row] = await this.db
      .select({
        department: departments,
        managerProfile: profiles,
      })
      .from(departments)
      .leftJoin(profiles, eq(departments.managerId, profiles.id))
      .where(and(eq(departments.id, id), eq(departments.agencyId, this.agencyId)))
      .limit(1);

    if (!row) {
      throw new NotFoundError('Department not found');
    }

    const [empCount] = await this.db
      .select({ count: count() })
      .from(employees)
      .where(and(eq(employees.departmentId, id), eq(employees.agencyId, this.agencyId), isNull(employees.deletedAt)));

    return {
      ...row.department,
      isActive: !row.department.deletedAt,
      is_active: !row.department.deletedAt,
      employeeCount: empCount?.count ?? 0,
      employee_count: empCount?.count ?? 0,
      manager: row.managerProfile
        ? {
            id: row.managerProfile.id,
            fullName: row.managerProfile.fullName,
            email: row.managerProfile.email,
            avatarUrl: row.managerProfile.avatarUrl,
          }
        : null,
    };
  }

  async createDepartment(input: CreateDepartmentInput) {
    const cleanName = input.name.trim();

    // Check for duplicate department name within this agency (active only)
    const [existing] = await this.db
      .select({ id: departments.id })
      .from(departments)
      .where(
        and(
          eq(departments.agencyId, this.agencyId),
          ilike(departments.name, cleanName),
          isNull(departments.deletedAt)
        )
      )
      .limit(1);

    if (existing) {
      throw new ValidationError(`A department named "${cleanName}" already exists`);
    }

    const [dept] = await this.db
      .insert(departments)
      .values({
        agencyId: this.agencyId,
        name: cleanName,
        description: input.description?.trim() || null,
        managerId: input.managerId || null,
        parentDepartmentId: input.parentDepartmentId || null,
        budget: input.budget != null ? String(input.budget) : null,
        deletedAt: input.isActive === false ? new Date() : null,
      })
      .returning();

    return {
      ...dept,
      isActive: !dept.deletedAt,
      is_active: !dept.deletedAt,
      employeeCount: 0,
      employee_count: 0,
    };
  }

  async updateDepartment(id: string, input: UpdateDepartmentInput) {
    // Verify department exists and belongs to this agency
    const [existing] = await this.db
      .select()
      .from(departments)
      .where(and(eq(departments.id, id), eq(departments.agencyId, this.agencyId)))
      .limit(1);

    if (!existing) {
      throw new NotFoundError('Department not found');
    }

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (input.name !== undefined) {
      const cleanName = input.name.trim();
      // Check collision with another department
      const [duplicate] = await this.db
        .select({ id: departments.id })
        .from(departments)
        .where(
          and(
            eq(departments.agencyId, this.agencyId),
            ilike(departments.name, cleanName),
            isNull(departments.deletedAt),
            not(eq(departments.id, id))
          )
        )
        .limit(1);

      if (duplicate) {
        throw new ValidationError(`A department named "${cleanName}" already exists`);
      }
      updateData.name = cleanName;
    }

    if (input.description !== undefined) {
      updateData.description = input.description ? input.description.trim() : null;
    }

    if (input.managerId !== undefined) {
      updateData.managerId = input.managerId || null;
    }

    if (input.parentDepartmentId !== undefined) {
      if (input.parentDepartmentId === id) {
        throw new ValidationError('Department cannot be its own parent');
      }
      updateData.parentDepartmentId = input.parentDepartmentId || null;
    }

    if (input.budget !== undefined) {
      updateData.budget = input.budget != null ? String(input.budget) : null;
    }

    // Toggle active / inactive state
    if (input.isActive === false) {
      updateData.deletedAt = new Date();
    } else if (input.isActive === true) {
      updateData.deletedAt = null;
    }

    const [updated] = await this.db
      .update(departments)
      .set(updateData)
      .where(and(eq(departments.id, id), eq(departments.agencyId, this.agencyId)))
      .returning();

    const [empCount] = await this.db
      .select({ count: count() })
      .from(employees)
      .where(and(eq(employees.departmentId, id), eq(employees.agencyId, this.agencyId), isNull(employees.deletedAt)));

    return {
      ...updated,
      isActive: !updated.deletedAt,
      is_active: !updated.deletedAt,
      employeeCount: empCount?.count ?? 0,
      employee_count: empCount?.count ?? 0,
    };
  }

  async deleteDepartment(id: string) {
    // Verify department exists
    const [existing] = await this.db
      .select()
      .from(departments)
      .where(and(eq(departments.id, id), eq(departments.agencyId, this.agencyId)))
      .limit(1);

    if (!existing) {
      throw new NotFoundError('Department not found');
    }

    // Guard: Prevent deletion if active employees are assigned
    const [activeEmployees] = await this.db
      .select({ count: count() })
      .from(employees)
      .where(and(eq(employees.departmentId, id), eq(employees.agencyId, this.agencyId), isNull(employees.deletedAt)));

    if (activeEmployees && Number(activeEmployees.count) > 0) {
      throw new ValidationError(
        `Cannot delete department "${existing.name}". It currently has ${activeEmployees.count} assigned active employee(s). Please reassign them first.`
      );
    }

    // Soft delete
    await this.db
      .update(departments)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(departments.id, id), eq(departments.agencyId, this.agencyId)));
  }
}
