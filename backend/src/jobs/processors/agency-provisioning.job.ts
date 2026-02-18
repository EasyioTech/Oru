
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
            .set({ status: 'seeding_data', progressPercentage: 50 })
            .where(eq(agencyProvisioningJobs.id, jobId));

        logger('Running migrations...');

        const agencyDb = await getAgencyDb(dbName);
        if (!agencyDb) throw new Error('Failed to connect to new agency database');

        let migrationsFolder = path.join(process.cwd(), 'drizzle');
        if (!fs.existsSync(migrationsFolder)) {
            migrationsFolder = 'drizzle';
        }

        await migrate(agencyDb, { migrationsFolder });
        logger('Migrations completed.');

        // 3. Seed Admin User & Data in Agency DB
        await job.updateProgress(70);
        logger('Seeding admin user in agency database...');

        // Sync User to Agency DB
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

        // 4. Finalize
        await job.updateProgress(100);

        // Update Main DB Agency Status -> Active
        await db.update(agencies)
            .set({
                status: 'active',
                isActive: true,
                updatedAt: new Date()
            })
            .where(eq(agencies.id, agencyId));

        // Update Job Status -> Completed
        await db.update(agencyProvisioningJobs)
            .set({
                status: 'completed',
                completedAt: new Date(),
                progressPercentage: 100,
                result: { success: true, dbName }
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
