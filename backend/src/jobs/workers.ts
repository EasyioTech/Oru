import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Redis } from 'ioredis';
import { startNotificationsWorker } from '../modules/notifications/jobs.js';
import { startHrWorker } from '../modules/hr/jobs.js';
import { startReportsWorker } from '../modules/reports/worker.js';
import { startFinanceWorker } from '../modules/finance/jobs.js';
import { startAgencyProvisioningWorker } from '../modules/system/jobs.js';

export function startWorkers(db: NodePgDatabase<any>, redis: Redis) {
  const notificationsWorker = startNotificationsWorker(redis, db);
  const hrWorker = startHrWorker(redis, db);
  const reportsWorker = startReportsWorker(redis, db);
  const financeWorker = startFinanceWorker(redis, db);
  const provisioningWorker = startAgencyProvisioningWorker(redis, db);

  return [notificationsWorker, hrWorker, reportsWorker, financeWorker, provisioningWorker];
}
