/**
 * Agency Routes
 * Handles agency management endpoints
 * 
 * Updated to use modular agency services
 */

const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/authMiddleware');
const {
  // Creation (sync - used by provisioning worker)
  createAgency,
  createJob,
  getJobById,
  runProvisioningInBackground,
  JOB_STATUS,
  
  // Domain & Name validation
  checkDomainAvailability,
  validateDomainFormat,
  validateAgencyName,
  generateSlugFromName,
  RESERVED_SUBDOMAINS,
  MIN_SUBDOMAIN_LENGTH,
  MAX_SUBDOMAIN_LENGTH,
  
  // Setup
  checkSetupStatus,
  getSetupProgress,
  completeAgencySetup,
  
  // Repair
  repairAgencyDatabase,
  verifyDatabaseIntegrity,
  fixCommonIssues,

  // Settings
  updateAgencySettings,
} = require('../services/agency');
const { getAgencyPool } = require('../infrastructure/database/poolManager');
const logger = require('../utils/logger');

/**
 * GET /api/agencies/validation-rules
 * Get validation rules for frontend
 */
router.get('/validation-rules', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      domain: {
        minLength: MIN_SUBDOMAIN_LENGTH,
        maxLength: MAX_SUBDOMAIN_LENGTH,
        reservedWords: RESERVED_SUBDOMAINS,
        pattern: '^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$',
        patternDescription: 'Lowercase letters, numbers, and hyphens (not at start/end)',
      },
      agencyName: {
        minLength: 2,
        maxLength: 100,
      },
    },
  });
}));

/**
 * POST /api/agencies/validate-name
 * Validate agency name
 */
router.post('/validate-name', asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.json({
      valid: false,
      error: 'Agency name is required',
    });
  }

  const validation = validateAgencyName(name);
  const suggestedSlug = generateSlugFromName(name);

  res.json({
    ...validation,
    suggestedSlug,
  });
}));

/**
 * GET /api/agencies/check-domain
 * Check if domain is available
 * 
 * The checkDomainAvailability function handles all errors internally
 * and always returns a response object (never throws)
 */
router.get('/check-domain', asyncHandler(async (req, res) => {
  const { domain } = req.query;

  if (!domain || typeof domain !== 'string') {
    return res.json({ 
      available: false, 
      error: 'Domain is required',
      code: 'DOMAIN_REQUIRED',
    });
  }

  // checkDomainAvailability handles all errors internally and returns response object
  const result = await checkDomainAvailability(domain);
  
  // Log database errors for monitoring
  if (result.dbError) {
    logger.warn('Domain check - database unavailable', {
      domain: domain.toLowerCase().trim(),
      requestId: req.requestId,
    });
  }

  res.json({
    available: result.available,
    error: result.error || null,
    code: result.code || null,
    domain: domain.toLowerCase().trim(),
  });
}));

/**
 * GET /api/agencies/check-setup
 * Check agency setup status
 */
router.get('/check-setup', asyncHandler(async (req, res) => {
  const agencyDatabase = req.headers['x-agency-database'] || req.query.database || null;

  if (!agencyDatabase) {
    return res.json({ setupComplete: false });
  }

  try {
    // If detailed progress is requested
    if (req.query.detailed === 'true') {
      const progress = await getSetupProgress(agencyDatabase);
      return res.json({
        setupComplete: progress.setupComplete || false,
        progress: progress.progress || 0,
        completedSteps: progress.completedSteps || [],
        totalSteps: progress.totalSteps || 7,
        lastUpdated: progress.lastUpdated || null,
        agencyName: progress.agencyName || null,
      });
    }

    const setupComplete = await checkSetupStatus(agencyDatabase);
    res.json({ setupComplete });
  } catch (error) {
    logger.error('Check setup error', {
      error: error.message,
      agencyDatabase,
      requestId: req.requestId,
    });
    res.json({ setupComplete: false });
  }
}));

/**
 * GET /api/agencies/agency-settings
 * Fetch agency settings from normalized tables
 */
router.get('/agency-settings', authenticate, asyncHandler(async (req, res) => {
  const agencyDatabase = req.headers['x-agency-database'] || req.query.database || null;

  if (!agencyDatabase) {
    return res.status(400).json({
      success: false,
      error: 'Agency database not specified',
    });
  }

  try {
    const agencyPool = getAgencyPool(agencyDatabase);
    const client = await agencyPool.connect();

    try {
      // Fetch from normalized tables
      const [settingsResult, brandingResult, addressResult, financialResult, prefsResult] = await Promise.all([
        client.query(`SELECT * FROM public.agency_settings LIMIT 1`),
        client.query(`SELECT * FROM public.agency_branding LIMIT 1`).catch(() => ({ rows: [] })),
        client.query(`SELECT * FROM public.agency_address WHERE address_type = 'primary' LIMIT 1`).catch(() => ({ rows: [] })),
        client.query(`SELECT * FROM public.agency_financial_settings LIMIT 1`).catch(() => ({ rows: [] })),
        client.query(`SELECT * FROM public.agency_preferences LIMIT 1`).catch(() => ({ rows: [] })),
      ]);

      if (settingsResult.rows.length === 0) {
        return res.json({
          success: true,
          data: { settings: null },
          message: 'No agency settings found',
        });
      }

      const settings = settingsResult.rows[0];
      const branding = brandingResult.rows[0] || {};
      const address = addressResult.rows[0] || {};
      const financial = financialResult.rows[0] || {};
      const prefs = prefsResult.rows[0] || {};

      // Compose unified settings object for frontend
      const unifiedSettings = {
        // Core settings
        id: settings.id,
        agency_name: settings.agency_name,
        domain: settings.domain,
        industry: settings.industry,
        company_size: settings.company_size,
        legal_name: settings.legal_name,
        registration_number: settings.registration_number,
        founded_year: settings.founded_year,
        setup_complete: settings.setup_complete,
        
        // Branding
        logo_url: branding.logo_url,
        company_tagline: branding.company_tagline,
        description: branding.company_description,
        primary_color: branding.primary_color,
        secondary_color: branding.secondary_color,
        
        // Address (composed object)
        address: address.street_line1 || address.city ? {
          street: address.street_line1 || '',
          city: address.city || '',
          state: address.state || '',
          zipCode: address.postal_code || '',
          country: address.country || '',
        } : null,
        
        // Financial
        currency: financial.default_currency,
        default_currency: financial.default_currency,
        tax_rate: financial.default_tax_rate,
        tax_id: financial.tax_id,
        tax_id_type: financial.tax_id_type,
        enable_gst: financial.gst_enabled,
        gst_number: financial.gst_number,
        fiscal_year_start: financial.fiscal_year_start,
        payment_terms: financial.payment_terms,
        invoice_prefix: financial.invoice_prefix,
        bank_name: financial.bank_name,
        bank_account_name: financial.bank_account_name,
        bank_account_number: financial.bank_account_number,
        bank_routing_number: financial.bank_routing_number,
        bank_swift_code: financial.bank_swift_code,
        
        // Preferences
        timezone: prefs.timezone,
        language: prefs.language,
        date_format: prefs.date_format,
        time_format: prefs.time_format,
        week_start: prefs.first_day_of_week,
        working_hours_start: prefs.working_hours_start,
        working_hours_end: prefs.working_hours_end,
        working_days: prefs.working_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        
        // Timestamps
        created_at: settings.created_at,
        updated_at: settings.updated_at,
      };

      return res.json({
        success: true,
        data: { settings: unifiedSettings },
        message: 'Agency settings fetched successfully',
      });
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Error fetching agency settings', {
      error: error.message,
      agencyDatabase,
      requestId: req.requestId,
    });
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch agency settings',
    });
  }
}));

/**
 * PUT /api/agencies/agency-settings
 * Update agency settings across normalized tables
 */
router.put('/agency-settings', authenticate, asyncHandler(async (req, res) => {
  const agencyDatabase = req.headers['x-agency-database'] || req.query.database || req.body.database || null;

  if (!agencyDatabase) {
    return res.status(400).json({
      success: false,
      error: 'Agency database not specified',
    });
  }

  try {
    const payload = req.body.settings ?? req.body;
    await updateAgencySettings(agencyDatabase, payload);

    return res.json({
      success: true,
      message: 'Agency settings updated successfully',
    });
  } catch (error) {
    logger.error('Error updating agency settings', {
      error: error.message,
      agencyDatabase,
      requestId: req.requestId,
    });
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update agency settings',
    });
  }
}));

/**
 * POST /api/agencies/complete-setup
 * Complete agency setup with extended settings
 */
router.post('/complete-setup', asyncHandler(async (req, res) => {
  const agencyDatabase = req.headers['x-agency-database'] || req.body.database;

  if (!agencyDatabase) {
    return res.status(400).json({ error: 'Agency database not specified' });
  }

  try {
    const result = await completeAgencySetup(agencyDatabase, req.body);

    res.json({
      success: true,
      message: 'Agency setup completed successfully',
      teamCredentials: result?.teamCredentials || [],
      teamCredentialsCsv: result?.teamCredentialsCsv || '',
    });
  } catch (error) {
    logger.error('Complete setup error', {
      error: error.message,
      agencyDatabase,
      requestId: req.requestId,
    });
    res.status(500).json({
      error: error.message || 'Failed to complete setup',
      detail: error.detail,
      code: error.code,
    });
  }
}));

/**
 * GET /api/agencies/provisioning/:jobId
 * Poll provisioning job status (async agency creation).
 */
router.get('/provisioning/:jobId', asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const job = await getJobById(jobId);
  if (!job) {
    return res.status(404).json({ success: false, error: 'Job not found', jobId });
  }
  res.json({
    success: true,
    data: {
      id: job.id,
      status: job.status,
      domain: job.domain,
      agency_name: job.agency_name,
      result: job.result,
      error: job.error,
      created_at: job.created_at,
      updated_at: job.updated_at,
      completed_at: job.completed_at,
    },
  });
}));

/**
 * POST /api/agencies/create
 * Create a new agency asynchronously (202 Accepted + poll GET /provisioning/:jobId).
 * Idempotency-Key header: same key returns same job/result.
 */
router.post('/create', asyncHandler(async (req, res) => {
  const {
    agencyName,
    domain,
    industry,
    companySize,
    phone,
    adminName,
    adminEmail,
    adminPassword,
    subscriptionPlan,
  } = req.body;

  // Validate required fields
  if (!agencyName || !domain || !adminName || !adminEmail || !adminPassword || !subscriptionPlan) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields',
      required: ['agencyName', 'domain', 'adminName', 'adminEmail', 'adminPassword', 'subscriptionPlan'],
      message: 'Please fill in all required fields before continuing.',
    });
  }

  // Pre-enqueue domain validation: fail fast instead of enqueueing then failing in worker
  const domainCheck = await checkDomainAvailability(domain);
  if (!domainCheck.available) {
    return res.status(400).json({
      success: false,
      error: domainCheck.error || 'Domain is not available',
      code: domainCheck.code || 'DOMAIN_UNAVAILABLE',
      domain: (domain || '').toLowerCase().trim(),
    });
  }

  const idempotencyKey = req.headers['idempotency-key'] || null;
  const payload = {
    agencyName,
    domain,
    adminName,
    adminEmail,
    adminPassword,
    subscriptionPlan,
    phone,
    industry,
    companySize,
  };

  try {
    logger.info('Agency create request received (async)', {
      agencyName,
      domain,
      subscriptionPlan,
      adminEmail,
      requestId: req.requestId,
    });

    const jobResult = await createJob(payload, idempotencyKey);

    // Idempotency: if existing completed job, return 200 with result
    if (jobResult.existing && jobResult.status === 'completed') {
      if (jobResult.result && typeof jobResult.result === 'object') {
        return res.json({
          success: true,
          ...jobResult.result,
          message: 'Agency already created (idempotent)',
        });
      }
      // Edge case: completed but result missing — return 202 so client can poll
      return res.status(202).json({
        success: true,
        jobId: jobResult.id,
        status: jobResult.status,
        message: 'Poll GET /api/agencies/provisioning/' + jobResult.id,
      });
    }

    // Idempotency: if existing pending/running, return 202 with same job id
    if (jobResult.existing) {
      return res.status(202).json({
        success: true,
        jobId: jobResult.id,
        status: jobResult.status,
        message: 'Agency creation in progress; poll GET /api/agencies/provisioning/' + jobResult.id,
      });
    }

    // New job: run in background (non-blocking) and return 202
    setImmediate(() => {
      runProvisioningInBackground(jobResult.id).catch((err) => {
        logger.error('Provisioning background job error', { jobId: jobResult.id, error: err.message });
      });
    });

    res.status(202).json({
      success: true,
      jobId: jobResult.id,
      status: JOB_STATUS.PENDING,
      message: 'Agency creation started; poll GET /api/agencies/provisioning/' + jobResult.id,
    });
  } catch (error) {
    logger.error('Agency creation (enqueue) failed', {
      error: error.message,
      agencyName,
      domain,
      requestId: req.requestId,
    });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create agency',
      detail: error.detail,
      code: error.code,
      message: 'Failed to create agency. Please try again or contact support.',
    });
  }
}));

/**
 * POST /api/agencies/repair-database
 * Repair agency database by adding missing tables
 */
router.post('/repair-database', asyncHandler(async (req, res) => {
  const agencyDatabase = req.headers['x-agency-database'] || req.body.database;

  if (!agencyDatabase) {
    return res.status(400).json({
      error: 'Agency database name is required',
    });
  }

  try {
    logger.info('Starting database repair', {
      agencyDatabase,
      requestId: req.requestId,
    });

    const result = await repairAgencyDatabase(agencyDatabase);

    res.json({
      success: true,
      message: 'Database repair completed successfully',
      ...result,
    });
  } catch (error) {
    logger.error('Database repair failed', {
      error: error.message,
      agencyDatabase,
      requestId: req.requestId,
    });
    res.status(500).json({
      error: error.message || 'Failed to repair database',
      detail: error.detail,
      code: error.code,
    });
  }
}));

/**
 * GET /api/agencies/verify-database
 * Verify agency database integrity
 */
router.get('/verify-database', authenticate, asyncHandler(async (req, res) => {
  const agencyDatabase = req.headers['x-agency-database'] || req.query.database;

  if (!agencyDatabase) {
    return res.status(400).json({
      error: 'Agency database name is required',
    });
  }

  try {
    const result = await verifyDatabaseIntegrity(agencyDatabase);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error('Database verification failed', {
      error: error.message,
      agencyDatabase,
      requestId: req.requestId,
    });
    res.status(500).json({
      error: error.message || 'Failed to verify database',
    });
  }
}));

/**
 * POST /api/agencies/fix-issues
 * Fix common database issues
 */
router.post('/fix-issues', authenticate, asyncHandler(async (req, res) => {
  const agencyDatabase = req.headers['x-agency-database'] || req.body.database;

  if (!agencyDatabase) {
    return res.status(400).json({
      error: 'Agency database name is required',
    });
  }

  try {
    logger.info('Fixing database issues', {
      agencyDatabase,
      requestId: req.requestId,
    });

    const result = await fixCommonIssues(agencyDatabase);

    res.json({
      success: true,
      message: 'Database issues fixed successfully',
      ...result,
    });
  } catch (error) {
    logger.error('Fix issues failed', {
      error: error.message,
      agencyDatabase,
      requestId: req.requestId,
    });
    res.status(500).json({
      error: error.message || 'Failed to fix database issues',
    });
  }
}));

module.exports = router;
