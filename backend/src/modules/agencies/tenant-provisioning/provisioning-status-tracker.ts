import { eq, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { FastifyBaseLogger } from 'fastify';
import { agencies, agencyProvisioningJobs } from '../../../infrastructure/database/schema.js';
import { NotFoundError, AppError } from '../../../utils/errors.js';
import { redisConnection } from '../../../infrastructure/redis/index.js';

export class ProvisioningStatusTracker {
  constructor(
    private logger: FastifyBaseLogger,
    private db: NodePgDatabase<any>
  ) {}

  async checkSignupPreflight() {
    const results: any = {
      postgres: { status: 'down', latency: 0 },
      redis: { status: 'down', latency: 0 },
    };

    try {
      const pgStart = Date.now();
      await this.db.execute(sql`SELECT 1`);
      results.postgres.status = 'up';
      results.postgres.latency = Date.now() - pgStart;
    } catch (error) {
      this.logger.error({ error, context: 'preflight-postgres' });
    }

    try {
      const redisStart = Date.now();
      await redisConnection.ping();
      results.redis.status = 'up';
      results.redis.latency = Date.now() - redisStart;
    } catch (error) {
      this.logger.error({ error, context: 'preflight-redis' });
    }

    if (results.postgres.status !== 'up') {
      return {
        allowed: false,
        reason: 'DATABASE_UNREACHABLE',
        message: 'The central database is currently unreachable. Please try again later.',
      };
    }

    return {
      allowed: true,
      status: results.redis.status === 'up' ? 'healthy' : 'degraded',
      postgresLatency: results.postgres.latency,
      timestamp: new Date().toISOString(),
    };
  }

  async getJobStatus(jobId: string) {
    try {
      const [job] = await this.db
        .select()
        .from(agencyProvisioningJobs)
        .where(eq(agencyProvisioningJobs.id, jobId));

      if (!job) throw new NotFoundError('Provisioning job not found');

      let agency = null;
      if (job.agencyId) {
        try {
          const [row] = await this.db
            .select()
            .from(agencies)
            .where(eq(agencies.id, job.agencyId));
          agency = row || null;
        } catch (e) {
          this.logger.warn({ agencyId: job.agencyId }, 'Agency not found for job');
        }
      }

      return {
        status: job.status,
        progress: job.progressPercentage,
        error: job.errorMessage,
        result: job.result,
        agency,
        step: job.currentStep,
      };
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error({ error, context: 'getJobStatus', jobId });
      throw new AppError('Failed to fetch provisioning status');
    }
  }
}
