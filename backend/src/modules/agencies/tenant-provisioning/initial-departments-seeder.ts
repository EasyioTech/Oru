import { eq, and, isNull } from 'drizzle-orm';
import { departments } from '../../../infrastructure/database/schemas/hr.js';

export const STANDARD_AGENCY_DEPARTMENTS = [
  { name: 'Executive & Management', description: 'Executive leadership, corporate strategy, and general administration' },
  { name: 'Finance & Accounts', description: 'Statutory compliance, GST filing, billing, and accounting ledger' },
  { name: 'Operations & Delivery', description: 'Core agency operations, project delivery, and client deliverables' },
  { name: 'Sales & Marketing', description: 'Business development, client pipeline, CRM, and marketing' },
  { name: 'Human Resources', description: 'Talent management, payroll processing, and statutory compliance' },
  { name: 'Technology & IT', description: 'Software engineering, infrastructure, security, and internal IT' },
];

/**
 * Seeds core operational departments for a new agency tenant.
 * Skips any departments that already exist to ensure idempotency.
 */
export async function seedInitialDepartments(
  tx: any,
  agencyId: string,
  logger?: any
): Promise<void> {
  const existingRows = await tx
    .select({ name: departments.name })
    .from(departments)
    .where(and(eq(departments.agencyId, agencyId), isNull(departments.deletedAt)));

  const existingNames = new Set(existingRows.map((r: any) => r.name.toLowerCase()));
  const toInsert = STANDARD_AGENCY_DEPARTMENTS
    .filter((d) => !existingNames.has(d.name.toLowerCase()))
    .map((d) => ({
      agencyId,
      name: d.name,
      description: d.description,
    }));

  if (toInsert.length > 0) {
    await tx.insert(departments).values(toInsert);
    if (logger) {
      logger.info({ agencyId, count: toInsert.length }, 'Seeded initial agency departments');
    }
  }
}
