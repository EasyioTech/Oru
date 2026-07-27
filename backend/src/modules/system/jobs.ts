import { Worker } from 'bullmq';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { QUEUES } from '../../jobs/definitions.js';
import type { AgencyProvisioningPayload } from '../../jobs/definitions.js';
import { agencies } from '../../infrastructure/database/schema.js';
import { eq } from 'drizzle-orm';

export function startAgencyProvisioningWorker(redis: any, db: NodePgDatabase<any>) {
  return new Worker<AgencyProvisioningPayload>(
    QUEUES.AGENCY_PROVISIONING,
    async (job) => {
      try {
        const { agencyId, dbName, adminEmail, plan } = job.data;

        console.log(`[agency-provisioning] Starting workspace setup for agency: ${agencyId}`);

        // Update agency status to active
        await db
          .update(agencies)
          .set({
            status: 'active',
            metadata: {
              provisionedAt: new Date().toISOString(),
              jobId: job.id,
            },
          })
          .where(eq(agencies.id, agencyId));

        console.log(`[agency-provisioning] Successfully provisioned workspace for agency: ${agencyId}`);

        return {
          success: true,
          agencyId,
          dbName,
          adminEmail,
          plan,
        };
      } catch (err) {
        console.error(`[agency-provisioning] Error in worker for job ${job.id}:`, err);
        throw err;
      }
    },
    { connection: redis, concurrency: 5 }
  );
}
