
import { Job } from 'bullmq';
import { AgencyProvisioningPayload } from '../definitions.js';
import { db } from '../../infrastructure/database/index.js';
import { agencyProvisioningJobs, agencies } from '../../infrastructure/database/schema.js';
import { eq, sql } from 'drizzle-orm';
import { getAgencyDb } from '../../infrastructure/database/index.js';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import path from 'path';
import fs from 'fs';
import os from 'os';

/**
 * Standard currencies to seed in every new tenant DB.
 * These are reference-data rows with stable codes — safe to insert with ON CONFLICT DO NOTHING.
 */
const SEED_CURRENCIES = [
    { code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: '1.0000', isBase: true, isActive: true },
    { code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: '0.9200', isBase: false, isActive: true },
    { code: 'GBP', name: 'British Pound', symbol: '£', exchangeRate: '0.7900', isBase: false, isActive: true },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', exchangeRate: '83.0000', isBase: false, isActive: true },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', exchangeRate: '1.5300', isBase: false, isActive: true },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', exchangeRate: '1.3600', isBase: false, isActive: true },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', exchangeRate: '1.3400', isBase: false, isActive: true },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', exchangeRate: '3.6700', isBase: false, isActive: true },
] as const;

export async function processAgencyProvisioning(job: Job<AgencyProvisioningPayload>) {
    const { jobId, dbName, adminEmail, adminPasswordHash, userId, agencyId } = job.data;
    const logger = job.log.bind(job);

    try {
        await job.updateProgress(10);
        logger(`Starting provisioning for agency: ${job.data.subdomain} (DB: ${dbName})`);

        // ── Step 1: Mark job as validating ──────────────────────────────────────
        await db.update(agencyProvisioningJobs)
            .set({
                status: 'validating',
                startedAt: new Date(),
                workerId: `${os.hostname()}-${process.pid}`,
            })
            .where(eq(agencyProvisioningJobs.id, jobId));

        // ── Step 2: Create Tenant Database ──────────────────────────────────────
        await job.updateProgress(20);
        logger('Checking / creating database...');

        await db.update(agencyProvisioningJobs)
            .set({ status: 'creating_database', progressPercentage: 20 })
            .where(eq(agencyProvisioningJobs.id, jobId));

        const checkDb = await db.execute(sql`SELECT 1 FROM pg_database WHERE datname = ${dbName}`);
        if (checkDb.rows.length === 0) {
            try {
                await db.execute(sql.raw(`CREATE DATABASE "${dbName}"`));
                logger('Database created successfully.');
            } catch (createError: any) {
                throw new Error(`PROVISIONING_ERROR: Failed to create database "${dbName}": ${createError.message}`);
            }
        } else {
            logger('Database already exists — proceeding with migration.');
        }

        // ── Step 3: Connect to Tenant DB ────────────────────────────────────────
        const agencyDb = await getAgencyDb(dbName);
        if (!agencyDb) throw new Error('Failed to connect to tenant database');

        try {
            await agencyDb.execute(sql`SELECT 1`);
            logger('Tenant database connectivity verified.');
        } catch (connError: any) {
            throw new Error(`DATABASE_CONNECTION_LOST: Cannot connect to "${dbName}": ${connError.message}`);
        }

        // ── Step 4: Run Tenant Migrations ────────────────────────────────────────
        await job.updateProgress(40);
        logger('Running tenant migrations...');

        let migrationsFolder = process.env.TENANT_MIGRATIONS_PATH || path.join(process.cwd(), 'drizzle', 'tenant');

        if (!fs.existsSync(migrationsFolder)) {
            const fallbacks = [
                path.join(process.cwd(), 'backend', 'drizzle', 'tenant'),
                path.join(process.cwd(), '..', 'drizzle', 'tenant'),
                path.join(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..', 'drizzle', 'tenant'),
            ];
            for (const p of fallbacks) {
                if (fs.existsSync(p)) { migrationsFolder = p; break; }
            }
        }

        logger(`Using migrations folder: ${migrationsFolder}`);
        const migrationFiles = fs.readdirSync(migrationsFolder);
        logger(`Found ${migrationFiles.length} files: ${migrationFiles.join(', ')}`);

        await migrate(agencyDb, { migrationsFolder });
        logger('Migrations completed.');

        // ── Step 5: Seed Tenant DB ───────────────────────────────────────────────
        await job.updateProgress(60);
        logger('Seeding tenant database...');

        await db.update(agencyProvisioningJobs)
            .set({ status: 'seeding_data', progressPercentage: 60 })
            .where(eq(agencyProvisioningJobs.id, jobId));

        // Import ONLY tenant-scoped table definitions for agencyDb operations.
        // DO NOT import from schema.js (platform barrel) for tenant DB writes.
        const {
            users: tenantUsers,
            userRoles: tenantUserRoles,
            profiles: tenantProfiles,
            agencies: tenantAgencies,
            agencySettings: tenantAgencySettings,
            currencies: tenantCurrencies,
        } = await import('../../infrastructure/database/schema-tenant.js');

        // 5a. Seed Reference Currencies (ON CONFLICT DO NOTHING — safe for idempotent re-runs)
        logger('Seeding reference currencies...');
        await agencyDb.insert(tenantCurrencies).values(
            SEED_CURRENCIES.map(c => ({
                code: c.code,
                name: c.name,
                symbol: c.symbol,
                exchangeRate: c.exchangeRate,
                isBase: c.isBase,
                isActive: c.isActive,
            }))
        ).onConflictDoNothing();
        logger(`Seeded ${SEED_CURRENCIES.length} currencies.`);

        // 5b. Sync Admin User to Tenant DB
        // MUST be before agencies (agencies.owner_user_id FK → users.id)
        logger('Syncing admin user to tenant DB...');
        await agencyDb.insert(tenantUsers).values({
            id: userId,
            email: adminEmail,
            emailNormalized: adminEmail.toLowerCase(),
            passwordHash: adminPasswordHash,
            status: 'active',
            emailConfirmed: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).onConflictDoNothing();

        // 5c. Sync Agency Record to Tenant DB
        const [agencyRecord] = await db.select().from(agencies).where(eq(agencies.id, agencyId));
        if (!agencyRecord) throw new Error(`Agency ${agencyId} not found in platform DB`);

        logger('Syncing agency record to tenant DB...');
        await agencyDb.insert(tenantAgencies).values(agencyRecord).onConflictDoNothing();

        // 5d. Sync User Roles to Tenant DB
        const { userRoles: platformUserRoles } = await import('../../infrastructure/database/schema.js');
        const mainRoles = await db.select().from(platformUserRoles).where(eq(platformUserRoles.userId, userId));
        if (mainRoles.length > 0) {
            logger(`Syncing ${mainRoles.length} user role(s) to tenant DB...`);
            await agencyDb.insert(tenantUserRoles).values(mainRoles).onConflictDoNothing();
        }

        // 5e. Sync Profile to Tenant DB
        const { profiles: platformProfiles } = await import('../../infrastructure/database/schema.js');
        const [profile] = await db.select().from(platformProfiles).where(eq(platformProfiles.userId, userId));
        if (profile) {
            logger('Syncing user profile to tenant DB...');
            await agencyDb.insert(tenantProfiles).values(profile).onConflictDoNothing();
        }

        // 5f. Seed Agency Settings
        logger('Seeding agency settings...');
        await agencyDb.insert(tenantAgencySettings).values({
            agencyId: agencyRecord.id,
            agencyName: agencyRecord.name,
            domain: agencyRecord.domain,
            timezone: (agencyRecord.settings as Record<string, unknown>)?.timezone as string || 'UTC',
            primaryColor: '#0a6ed1',
            secondaryColor: '#0854a0',
            address: agencyRecord.address,
            city: agencyRecord.city,
            state: agencyRecord.state,
            postalCode: agencyRecord.postalCode,
            country: agencyRecord.country,
        }).onConflictDoNothing();

        // ── Step 6: Finalize ─────────────────────────────────────────────────────
        await job.updateProgress(90);

        await db.update(agencyProvisioningJobs)
            .set({ status: 'assigning_permissions', progressPercentage: 90 })
            .where(eq(agencyProvisioningJobs.id, jobId));

        // Mark agency as active in platform DB
        const [updatedAgency] = await db.update(agencies)
            .set({ status: 'active', isActive: true, updatedAt: new Date() })
            .where(eq(agencies.id, agencyId))
            .returning();

        await job.updateProgress(100);

        await db.update(agencyProvisioningJobs)
            .set({
                status: 'completed',
                completedAt: new Date(),
                progressPercentage: 100,
                result: { success: true, dbName, agency: updatedAgency },
            })
            .where(eq(agencyProvisioningJobs.id, jobId));

        logger('Provisioning completed successfully.');
        return { success: true };

    } catch (error: any) {
        logger(`Provisioning failed: ${error.message}`);

        // Attempt compensation: revert agency status to 'pending' so it can be retried
        try {
            await db.update(agencies)
                .set({ status: 'pending', updatedAt: new Date() })
                .where(eq(agencies.id, agencyId));
        } catch (compensationError: any) {
            logger(`Compensation failed: ${compensationError.message}`);
        }

        await db.update(agencyProvisioningJobs)
            .set({
                status: 'failed',
                errorMessage: error.message,
                stackTrace: error.stack,
                errorDetails: { step: 'provisioning', dbName },
                completedAt: new Date(),
            })
            .where(eq(agencyProvisioningJobs.id, jobId));

        throw error;
    }
}
