import { eq } from 'drizzle-orm';
import { leaveTypes } from '../../../infrastructure/database/schemas/hr.js';

export const STANDARD_LEAVE_TYPES = [
  {
    name: 'Privilege Leave / Earned Leave (PL/EL)',
    description: 'Annual statutory paid leave accrued by employees for rest and planned vacations.',
    maxDaysPerYear: 15,
    isPaid: true,
  },
  {
    name: 'Casual Leave (CL)',
    description: 'Short-term paid leave for unexpected personal emergencies and short breaks.',
    maxDaysPerYear: 12,
    isPaid: true,
  },
  {
    name: 'Sick Leave / Medical Leave (SL)',
    description: 'Paid medical leave for recovery from illnesses and medical appointments.',
    maxDaysPerYear: 10,
    isPaid: true,
  },
  {
    name: 'Maternity Leave',
    description: 'Statutory maternity leave for female employees under the Maternity Benefit Act.',
    maxDaysPerYear: 180,
    isPaid: true,
  },
];

/**
 * Seeds standard statutory leave types for a new agency tenant.
 * Guarantees that the HR leave management module works instantly without manual setup.
 */
export async function seedInitialLeaveTypes(
  tx: any,
  agencyId: string,
  logger?: any
): Promise<void> {
  const existingRows = await tx
    .select({ name: leaveTypes.name })
    .from(leaveTypes)
    .where(eq(leaveTypes.agencyId, agencyId));

  const existingNames = new Set(existingRows.map((r: any) => r.name.toLowerCase()));
  const toInsert = STANDARD_LEAVE_TYPES
    .filter((lt) => !existingNames.has(lt.name.toLowerCase()))
    .map((lt) => ({
      agencyId,
      name: lt.name,
      description: lt.description,
      maxDaysPerYear: lt.maxDaysPerYear,
      isPaid: lt.isPaid,
      isActive: true,
    }));

  if (toInsert.length > 0) {
    await tx.insert(leaveTypes).values(toInsert);
    if (logger) {
      logger.info({ agencyId, count: toInsert.length }, 'Seeded initial statutory leave types');
    }
  }
}
