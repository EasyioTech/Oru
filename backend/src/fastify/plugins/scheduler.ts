import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';

export const schedulerPlugin = fp(async (fastify: FastifyInstance) => {
  fastify.addHook('onReady', async () => {
    const { redisConnection } = await import('../../infrastructure/redis/index.js');
    const db = fastify.db;

    if (!fastify.queues?.core) {
      fastify.log.error('Core queue not initialized');
      return;
    }

    fastify.log.info('Scheduler: Setting up recurring workspace profile recalculation jobs');

    try {
      // Query all workspace IDs from database
      const workspaces = await db.query.workspaceProfiles.findMany();
      if (workspaces.length === 0) {
        fastify.log.info('Scheduler: No workspaces found');
        return;
      }

      // Schedule recalculation for each workspace every 24 hours
      for (const workspace of workspaces) {
        const jobId = `recalc-workspace-${workspace.workspace_id}`;

        // Check if job already exists
        const existingJob = await fastify.queues.core.getJob(jobId);
        if (!existingJob) {
          await fastify.queues.core.add(
            'recalculate-workspace-profile',
            { workspaceId: workspace.workspace_id },
            {
              jobId,
              repeat: { every: 24 * 60 * 60 * 1000 }, // 24 hours in milliseconds
              removeOnComplete: true,
              removeOnFail: false,
            }
          );
          fastify.log.debug({ workspaceId: workspace.workspace_id }, 'Scheduled workspace profile recalculation');
        }
      }

      fastify.log.info(`Scheduler: Configured ${workspaces.length} workspace recalculation jobs`);
    } catch (err) {
      fastify.log.error({ err }, 'Scheduler: Failed to set up recurring jobs');
    }
  });
});
