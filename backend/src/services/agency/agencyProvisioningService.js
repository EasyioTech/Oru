/**
 * Agency Provisioning Service (async jobs)
 *
 * Runs agency creation in the background so the HTTP request returns quickly (202 Accepted).
 * Clients poll GET /api/agencies/provisioning/:jobId for status and result.
 * Supports idempotency via Idempotency-Key header.
 */

const { pool } = require('../../config/database');
const { createAgency } = require('./agencyCreationService');
const logger = require('../../utils/logger');

const JOB_STATUS = { PENDING: 'pending', RUNNING: 'running', COMPLETED: 'completed', FAILED: 'failed' };

/**
 * Create a provisioning job (pending). Call runProvisioningInBackground(jobId) after returning 202.
 * @param {Object} payload - Same as createAgency: agencyName, domain, adminName, adminEmail, adminPassword, subscriptionPlan, phone?, industry?, companySize?
 *   Note: payload is stored in DB (agency_provisioning_jobs.payload); contains adminPassword in plaintext. For production, consider encrypting or not persisting sensitive fields.
 * @param {string} [idempotencyKey] - Optional. If provided and a job with this key exists, return that job.
 * @returns {Promise<{ id: string, status: string, existing?: boolean }>}
 */
async function createJob(payload, idempotencyKey = null) {
  const client = await pool.connect();
  try {
    if (idempotencyKey && idempotencyKey.trim()) {
      const existing = await client.query(
        `SELECT id, status, result, error, completed_at FROM public.agency_provisioning_jobs
         WHERE idempotency_key = $1 LIMIT 1`,
        [idempotencyKey.trim()]
      );
      if (existing.rows.length > 0) {
        const row = existing.rows[0];
        return { id: row.id, status: row.status, result: row.result, error: row.error, completed_at: row.completed_at, existing: true };
      }
    }

    const insert = await client.query(
      `INSERT INTO public.agency_provisioning_jobs (idempotency_key, status, domain, agency_name, payload, updated_at)
       VALUES ($1, $2, $3, $4, $5, now())
       RETURNING id, status, created_at`,
      [
        idempotencyKey && idempotencyKey.trim() ? idempotencyKey.trim() : null,
        JOB_STATUS.PENDING,
        payload.domain,
        payload.agencyName,
        JSON.stringify(payload),
      ]
    );
    const row = insert.rows[0];
    return { id: row.id, status: row.status, created_at: row.created_at, existing: false };
  } finally {
    client.release();
  }
}

/**
 * Get job by id.
 * @param {string} jobId - UUID
 * @returns {Promise<{ id, status, domain, agency_name, payload, result, error, created_at, updated_at, completed_at } | null>}
 */
async function getJobById(jobId) {
  const client = await pool.connect();
  try {
    const r = await client.query(
      `SELECT id, idempotency_key, status, domain, agency_name, payload, result, error, created_at, updated_at, completed_at
       FROM public.agency_provisioning_jobs WHERE id = $1`,
      [jobId]
    );
    if (r.rows.length === 0) return null;
    const row = r.rows[0];
    return {
      id: row.id,
      idempotency_key: row.idempotency_key,
      status: row.status,
      domain: row.domain,
      agency_name: row.agency_name,
      payload: row.payload,
      result: row.result,
      error: row.error,
      created_at: row.created_at,
      updated_at: row.updated_at,
      completed_at: row.completed_at,
    };
  } finally {
    client.release();
  }
}

/**
 * Update job status and optionally result/error. Sets completed_at when status is completed or failed.
 */
async function updateJob(jobId, updates) {
  const client = await pool.connect();
  try {
    const { status, result, error } = updates;
    const setCompletedAt = status === JOB_STATUS.COMPLETED || status === JOB_STATUS.FAILED ? ', completed_at = now()' : '';
    await client.query(
      `UPDATE public.agency_provisioning_jobs
       SET status = $1, result = $2, error = $3, updated_at = now() ${setCompletedAt}
       WHERE id = $4`,
      [status, result != null ? JSON.stringify(result) : null, error ?? null, jobId]
    );
  } finally {
    client.release();
  }
}

/**
 * Run agency creation in the background. Call this after returning 202 to the client.
 * Updates job to running, then completed or failed.
 * @param {string} jobId - UUID from createJob
 */
async function runProvisioningInBackground(jobId) {
  const client = await pool.connect();
  let row;
  try {
    const r = await client.query(
      `SELECT id, payload, status FROM public.agency_provisioning_jobs WHERE id = $1 FOR UPDATE`,
      [jobId]
    );
    if (r.rows.length === 0) {
      logger.warn('Provisioning job not found', { jobId });
      return;
    }
    row = r.rows[0];
    if (row.status !== JOB_STATUS.PENDING) {
      logger.info('Provisioning job already processed', { jobId, status: row.status });
      return;
    }
  } finally {
    client.release();
  }

  await updateJob(jobId, { status: JOB_STATUS.RUNNING });

  const payload = typeof row.payload === 'object' ? row.payload : JSON.parse(row.payload || '{}');
  const agencyData = {
    agencyName: payload.agencyName,
    domain: payload.domain,
    adminName: payload.adminName,
    adminEmail: payload.adminEmail,
    adminPassword: payload.adminPassword,
    subscriptionPlan: payload.subscriptionPlan,
    phone: payload.phone,
    industry: payload.industry,
    companySize: payload.companySize,
  };

  try {
    const result = await createAgency(agencyData);
    await updateJob(jobId, { status: JOB_STATUS.COMPLETED, result });
    logger.info('Agency provisioning completed', { jobId, domain: payload.domain });
  } catch (err) {
    logger.error('Agency provisioning failed', { jobId, error: err.message, domain: payload.domain });
    await updateJob(jobId, { status: JOB_STATUS.FAILED, error: err.message || String(err) });
  }
}

module.exports = {
  createJob,
  getJobById,
  updateJob,
  runProvisioningInBackground,
  JOB_STATUS,
};
