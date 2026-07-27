import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { createNotificationsQueue } from '../../modules/notifications/jobs.js';
import { createHrQueue } from '../../modules/hr/jobs.js';
import { createReportsQueue } from '../../modules/reports/jobs.js';
import { createFinanceQueue } from '../../modules/finance/jobs.js';

export const queuesPlugin = fp(async (fastify: FastifyInstance) => {
  const { redisConnection } = await import('../../infrastructure/redis/index.js');
  
  const notifications = createNotificationsQueue(redisConnection);
  const hr = createHrQueue(redisConnection);
  const reports = createReportsQueue(redisConnection);
  const finance = createFinanceQueue(redisConnection);

  fastify.decorate('queues', {
    notifications,
    hr,
    reports,
    finance,
  });

  fastify.log.info('Queues registered: notifications, hr, reports, finance');
});

declare module 'fastify' {
  interface FastifyInstance {
    queues: {
      notifications: ReturnType<typeof createNotificationsQueue>;
      hr: ReturnType<typeof createHrQueue>;
      reports: ReturnType<typeof createReportsQueue>;
      finance: ReturnType<typeof createFinanceQueue>;
    };
  }
}
