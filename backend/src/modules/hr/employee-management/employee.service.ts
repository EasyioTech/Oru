import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, ilike, or, isNull, SQL, desc, count } from 'drizzle-orm';
import { employees, departments } from '../schema.js';
import { NotFoundError, ValidationError } from '../../../utils/errors.js';
import { indexEmployees, removeFromIndex } from '../../../infrastructure/meilisearch/indexer.js';
import { CreateEmployeeInput, UpdateEmployeeInput } from './employee.schemas.js';

export class EmployeeService {
  constructor(
    private db: NodePgDatabase<any> | any,
    private agencyId: string
  ) {}

  async getEmployees(status?: string, departmentId?: string, search?: string) {
    const conditions: SQL[] = [
      eq(employees.agencyId, this.agencyId),
      isNull(employees.deletedAt),
    ];

    if (status && status !== 'all') {
      conditions.push(eq(employees.status, status));
    }

    if (departmentId && departmentId !== 'all') {
      conditions.push(eq(employees.departmentId, departmentId));
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      const searchOr = or(
        ilike(employees.firstName, term),
        ilike(employees.lastName, term),
        ilike(employees.email, term),
        ilike(employees.position, term),
        ilike(employees.employeeCode, term)
      );
      if (searchOr) conditions.push(searchOr);
    }

    const rows = await this.db
      .select({
        employee: employees,
        department: departments,
      })
      .from(employees)
      .leftJoin(departments, eq(employees.departmentId, departments.id))
      .where(and(...conditions))
      .orderBy(desc(employees.createdAt));

    return rows.map((r: any) => ({
      ...r.employee,
      department: r.department
        ? {
            id: r.department.id,
            name: r.department.name,
          }
        : null,
    }));
  }

  async getEmployeeById(id: string) {
    const [row] = await this.db
      .select({
        employee: employees,
        department: departments,
      })
      .from(employees)
      .leftJoin(departments, eq(employees.departmentId, departments.id))
      .where(
        and(
          eq(employees.id, id),
          eq(employees.agencyId, this.agencyId),
          isNull(employees.deletedAt)
        )
      )
      .limit(1);

    if (!row) {
      throw new NotFoundError('Employee not found');
    }

    return {
      ...row.employee,
      department: row.department
        ? {
            id: row.department.id,
            name: row.department.name,
          }
        : null,
    };
  }

  async createEmployee(input: CreateEmployeeInput) {
    const effectiveAgencyId = input.agencyId || this.agencyId;
    if (!effectiveAgencyId) {
      throw new ValidationError('Agency context is required to create an employee');
    }

    const normalizedEmail = input.email.toLowerCase().trim();

    // Check duplicate email within this agency
    const [existingEmail] = await this.db
      .select({ id: employees.id })
      .from(employees)
      .where(
        and(
          eq(employees.agencyId, effectiveAgencyId),
          eq(employees.email, normalizedEmail),
          isNull(employees.deletedAt)
        )
      )
      .limit(1);

    if (existingEmail) {
      throw new ValidationError(`An employee with email "${normalizedEmail}" already exists in this agency`);
    }

    // Auto-generate employee code if missing or ensure uniqueness
    let code = input.employeeCode?.trim();
    if (!code) {
      const [empCount] = await this.db
        .select({ count: count() })
        .from(employees)
        .where(eq(employees.agencyId, effectiveAgencyId));
      const nextNum = (Number(empCount?.count ?? 0) + 1).toString().padStart(4, '0');
      code = `EMP-${nextNum}`;
    }

    // Check if code is already taken in this agency; if so, generate a unique suffix
    const [codeConflict] = await this.db
      .select({ id: employees.id })
      .from(employees)
      .where(
        and(
          eq(employees.agencyId, effectiveAgencyId),
          eq(employees.employeeCode, code),
          isNull(employees.deletedAt)
        )
      )
      .limit(1);

    if (codeConflict) {
      code = `EMP-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90 + 10)}`;
    }

    // Validate departmentId exists if provided to prevent foreign key violation
    let validDepartmentId: string | null = null;
    if (input.departmentId) {
      try {
        const [dept] = await this.db
          .select({ id: departments.id })
          .from(departments)
          .where(
            and(
              eq(departments.id, input.departmentId),
              isNull(departments.deletedAt)
            )
          )
          .limit(1);
        if (dept) {
          validDepartmentId = dept.id;
        }
      } catch {
        validDepartmentId = null;
      }
    }

    // Check if user/profile already exists with this email to link them
    let linkedUserId: string | null = null;
    let linkedProfileId: string | null = null;
    try {
      const { users, profiles } = await import('../../../infrastructure/database/schema.js');
      const [existingUser] = await this.db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);
      if (existingUser) {
        linkedUserId = existingUser.id;
        const [existingProfile] = await this.db
          .select({ id: profiles.id })
          .from(profiles)
          .where(eq(profiles.userId, existingUser.id))
          .limit(1);
        if (existingProfile) {
          linkedProfileId = existingProfile.id;
        }
      }
    } catch {}

    let emp: any;
    try {
      const [created] = await this.db
        .insert(employees)
        .values({
          agencyId: effectiveAgencyId,
          userId: linkedUserId,
          profileId: linkedProfileId,
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          email: normalizedEmail,
          phone: input.phone?.trim() || null,
          departmentId: validDepartmentId,
          position: input.position?.trim() || null,
          employmentType: input.employmentType || 'full_time',
          status: input.status || 'active',
          hireDate: input.hireDate || null,
          salary: input.salary != null ? String(input.salary) : null,
          employeeCode: code,
          address: input.address?.trim() || null,
          emergencyContactName: input.emergencyContactName?.trim() || null,
          emergencyContactPhone: input.emergencyContactPhone?.trim() || null,
          avatarUrl: input.avatarUrl || null,
          notes: input.notes?.trim() || null,
        })
        .returning();
      emp = created;
    } catch (dbError: any) {
      if (dbError?.code === '23505') {
        throw new ValidationError(`An employee with this email or employee code already exists.`);
      }
      if (dbError?.code === '23503') {
        throw new ValidationError(`Referenced entity (e.g. department) does not exist.`);
      }
      throw dbError;
    }

    // Sync into legacy employee_details if table exists (for attendance, payroll compatibility)
    try {
      const { sql } = await import('drizzle-orm');
      await this.db.execute(sql`
        INSERT INTO public.employee_details (
          id, employee_id, agency_id, first_name, last_name, employment_type, is_active, created_at, updated_at
        ) VALUES (
          ${emp.id}, ${emp.employeeCode || emp.id}, ${effectiveAgencyId}, ${emp.firstName}, ${emp.lastName}, ${emp.employmentType || 'full_time'}, true, NOW(), NOW()
        ) ON CONFLICT (id) DO UPDATE SET
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          updated_at = NOW();
      `).catch(() => {});
    } catch {}

    // Index in Meilisearch asynchronously
    Promise.resolve().then(() => indexEmployees(effectiveAgencyId, [emp]).catch(() => {}));

    return emp;
  }

  async updateEmployee(id: string, input: UpdateEmployeeInput) {
    const [existing] = await this.db
      .select()
      .from(employees)
      .where(
        and(
          eq(employees.id, id),
          eq(employees.agencyId, this.agencyId),
          isNull(employees.deletedAt)
        )
      )
      .limit(1);

    if (!existing) {
      throw new NotFoundError('Employee not found');
    }

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (input.email !== undefined) {
      const normalizedEmail = input.email.toLowerCase().trim();
      const [duplicate] = await this.db
        .select({ id: employees.id })
        .from(employees)
        .where(
          and(
            eq(employees.agencyId, this.agencyId),
            eq(employees.email, normalizedEmail),
            isNull(employees.deletedAt)
          )
        )
        .limit(1);

      if (duplicate && duplicate.id !== id) {
        throw new ValidationError(`An employee with email "${normalizedEmail}" already exists`);
      }
      updateData.email = normalizedEmail;
    }

    if (input.firstName !== undefined) updateData.firstName = input.firstName.trim();
    if (input.lastName !== undefined) updateData.lastName = input.lastName.trim();
    if (input.phone !== undefined) updateData.phone = input.phone ? input.phone.trim() : null;
    if (input.departmentId !== undefined) updateData.departmentId = input.departmentId || null;
    if (input.position !== undefined) updateData.position = input.position ? input.position.trim() : null;
    if (input.employmentType !== undefined) updateData.employmentType = input.employmentType;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.hireDate !== undefined) updateData.hireDate = input.hireDate || null;
    if (input.salary !== undefined) updateData.salary = input.salary != null ? String(input.salary) : null;
    if (input.employeeCode !== undefined) updateData.employeeCode = input.employeeCode ? input.employeeCode.trim() : null;
    if (input.address !== undefined) updateData.address = input.address ? input.address.trim() : null;
    if (input.emergencyContactName !== undefined) updateData.emergencyContactName = input.emergencyContactName ? input.emergencyContactName.trim() : null;
    if (input.emergencyContactPhone !== undefined) updateData.emergencyContactPhone = input.emergencyContactPhone ? input.emergencyContactPhone.trim() : null;
    if (input.avatarUrl !== undefined) updateData.avatarUrl = input.avatarUrl || null;
    if (input.notes !== undefined) updateData.notes = input.notes ? input.notes.trim() : null;

    const [updated] = await this.db
      .update(employees)
      .set(updateData)
      .where(and(eq(employees.id, id), eq(employees.agencyId, this.agencyId)))
      .returning();

    // Update index asynchronously
    Promise.resolve().then(() => indexEmployees(this.agencyId, [updated]).catch(() => {}));

    return updated;
  }

  async deleteEmployee(id: string) {
    const [existing] = await this.db
      .select({ id: employees.id })
      .from(employees)
      .where(
        and(
          eq(employees.id, id),
          eq(employees.agencyId, this.agencyId),
          isNull(employees.deletedAt)
        )
      )
      .limit(1);

    if (!existing) {
      throw new NotFoundError('Employee not found');
    }

    await this.db
      .update(employees)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(employees.id, id), eq(employees.agencyId, this.agencyId)));

    Promise.resolve().then(() => removeFromIndex('employees', id).catch(() => {}));
  }
}
