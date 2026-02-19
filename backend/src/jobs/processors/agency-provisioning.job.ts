
import { Job } from 'bullmq';
import { AgencyProvisioningPayload } from '../definitions.js';
import { db } from '../../infrastructure/database/index.js';
import { agencyProvisioningJobs, agencies, users } from '../../infrastructure/database/schema.js';
import { eq, sql } from 'drizzle-orm';
import { AppError } from '../../utils/errors.js';
import { getAgencyDb } from '../../infrastructure/database/index.js';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { provisioningJobStatusEnum } from '../../infrastructure/database/schemas/enums.js';

export async function processAgencyProvisioning(job: Job<AgencyProvisioningPayload>) {
    const { jobId, dbName, adminEmail, adminPasswordHash, userId, agencyId } = job.data;
    const logger = job.log.bind(job);

    try {
        await job.updateProgress(10);
        logger(`Starting provisioning for agency: ${job.data.subdomain} (DB: ${dbName})`);

        // Update Job Status -> Validating
        await db.update(agencyProvisioningJobs)
            .set({
                status: 'validating',
                startedAt: new Date(),
                workerId: `${os.hostname()}-${process.pid}`,
            })
            .where(eq(agencyProvisioningJobs.id, jobId));


        // 1. Create Database
        await job.updateProgress(30);
        logger('Checking/Creating database...');

        // Check if DB exists
        const checkDb = await db.execute(sql`SELECT 1 FROM pg_database WHERE datname = ${dbName}`);
        if (checkDb.rows.length === 0) {
            await db.execute(sql.raw(`CREATE DATABASE "${dbName}"`));
            logger('Database created successfully.');
        } else {
            logger('Database already exists.');
        }

        // Update Job Status -> creating_database
        await db.update(agencyProvisioningJobs)
            .set({ status: 'creating_database', progressPercentage: 30 })
            .where(eq(agencyProvisioningJobs.id, jobId));


        // 2. Run Migrations
        await job.updateProgress(50);
        await db.update(agencyProvisioningJobs)
            .set({ status: 'creating_database', progressPercentage: 50 })
            .where(eq(agencyProvisioningJobs.id, jobId));

        logger('Running migrations...');

        const agencyDb = await getAgencyDb(dbName);
        if (!agencyDb) throw new Error('Failed to connect to new agency database');

        // Locate migrations folder for TENANTS
        let migrationsFolder = process.env.TENANT_MIGRATIONS_PATH || path.join(process.cwd(), 'drizzle', 'tenant');

        // Fallback for common dev/prod structures
        if (!fs.existsSync(migrationsFolder)) {
            const possiblePaths = [
                path.join(process.cwd(), 'backend', 'drizzle', 'tenant'),
                path.join(process.cwd(), '..', 'drizzle', 'tenant'),
                path.join(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..', 'drizzle', 'tenant')
            ];

            for (const p of possiblePaths) {
                if (fs.existsSync(p)) {
                    migrationsFolder = p;
                    break;
                }
            }
        }

        logger(`Using migrations folder: ${migrationsFolder}`);
        const files = fs.readdirSync(migrationsFolder);
        logger(`Found ${files.length} files in migrations folder: ${files.join(', ')}`);

        await migrate(agencyDb, { migrationsFolder });
        logger('Migrations completed.');

        // 3. Seed Admin User & Data in Agency DB
        await job.updateProgress(70);
        logger('Seeding initial data in agency database...');

        const {
            users,
            userRoles,
            agencies: agencyTable,
            agencySettings: settingsTable,
            pageCatalog: catalogTable,
            agencyPageAssignments: assignmentsTable
        } = await import('../../infrastructure/database/schema.js');

        // 3a. Get Agency Record from Main DB
        const [agencyRecord] = await db.select().from(agencyTable).where(eq(agencyTable.id, agencyId));
        if (!agencyRecord) throw new Error(`Agency ${agencyId} not found in main database`);

        // 3b. Sync User to Agency DB (MUST BE FIRST because agencies table has FK to users)
        await agencyDb.insert(users).values({
            id: userId,
            email: adminEmail,
            emailNormalized: adminEmail.toLowerCase(),
            passwordHash: adminPasswordHash,
            status: 'active',
            emailConfirmed: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).onConflictDoNothing();

        // 3c. Sync Agency Record to Tenant DB
        await agencyDb.insert(agencyTable).values(agencyRecord).onConflictDoNothing();

        // 3d. Sync User Roles to Agency DB
        const mainRoles = await db.select().from(userRoles).where(eq(userRoles.userId, userId));
        if (mainRoles.length > 0) {
            logger(`Syncing ${mainRoles.length} user roles to tenant DB...`);
            await agencyDb.insert(userRoles).values(mainRoles).onConflictDoNothing();
        }

        // 3e. Seed Agency Settings
        await agencyDb.insert(settingsTable).values({
            agencyId: agencyRecord.id,
            agencyName: agencyRecord.name,
            domain: agencyRecord.domain,
            timezone: 'UTC',
            primaryColor: '#0a6ed1',
            secondaryColor: '#0854a0',
        }).onConflictDoNothing();

        // 3f. Sync Page Catalog (Copy from Main DB to Tenant DB)
        const mainCatalog = await db.select().from(catalogTable);
        if (mainCatalog.length > 0) {
            logger(`Syncing ${mainCatalog.length} catalog items to tenant DB...`);
            await agencyDb.insert(catalogTable).values(mainCatalog).onConflictDoNothing();

            // 3g. Auto-assign all active pages for Trial
            logger(`Auto-assigning all detected pages to agency...`);
            const assignments = mainCatalog.map(page => ({
                agencyId: agencyId,
                pageId: page.id,
                status: 'active',
                isTrial: true,
            }));

            // Assign in Main DB
            await db.insert(assignmentsTable).values(assignments as any).onConflictDoNothing();

            // Assign in Tenant DB
            await agencyDb.insert(assignmentsTable).values(assignments as any).onConflictDoNothing();
        }

        // 4. Finalize
        await job.updateProgress(100);

        // Update Main DB Agency Status -> Active
        const [updatedAgency] = await db.update(agencies)
            .set({
                status: 'active',
                isActive: true,
                updatedAt: new Date()
            })
            .where(eq(agencies.id, agencyId))
            .returning();

        // Update Job Status -> Completed
        await db.update(agencyProvisioningJobs)
            .set({
                status: 'completed',
                completedAt: new Date(),
                progressPercentage: 100,
                result: { success: true, dbName, agency: updatedAgency }
            })
            .where(eq(agencyProvisioningJobs.id, jobId));

        logger('Provisioning completed successfully.');
        return { success: true };

    } catch (error: any) {
        logger(`Error: ${error.message}`);

        // Update Job Status -> Failed
        await db.update(agencyProvisioningJobs)
            .set({
                status: 'failed',
                errorMessage: error.message,
                stackTrace: error.stack,
                errorDetails: { step: 'provisioning' },
                completedAt: new Date()
            })
            .where(eq(agencyProvisioningJobs.id, jobId));

        throw error;
    }
}
