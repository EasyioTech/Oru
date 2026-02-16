const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { pool } = require('../config/database');
const { authenticate, requireSuperAdmin } = require('../middleware/authMiddleware');
const { query, queryOne, queryMany, transaction } = require('../infrastructure/database/dbQuery');
const { success, notFound, databaseError, send, validationError, error: errorResponse } = require('../utils/responseHelper');
const { validateUUID, requireFields } = require('../middleware/commonMiddleware');
const logger = require('../utils/logger');
const systemSettingsService = require('../services/systemSettingsService');
const { getSystemSettings } = require('../utils/systemSettings');

/**
 * Ensure main-database tables for subscription plans & features exist.
 * This is idempotent and safe to call before plan/feature operations.
 */
async function ensureSubscriptionSchema(client) {
  // subscription_plans
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.subscription_plans (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT,
      price NUMERIC(12,2) NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'usd',
      interval TEXT NOT NULL DEFAULT 'month',
      is_active BOOLEAN NOT NULL DEFAULT true,
      max_users INTEGER,
      max_agencies INTEGER,
      max_storage_gb INTEGER,
      stripe_product_id TEXT,
      stripe_price_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // plan_features
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.plan_features (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT,
      feature_key TEXT NOT NULL UNIQUE,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // plan_feature_mappings
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.plan_feature_mappings (
      plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
      feature_id UUID NOT NULL REFERENCES public.plan_features(id) ON DELETE CASCADE,
      enabled BOOLEAN NOT NULL DEFAULT true,
      PRIMARY KEY (plan_id, feature_id)
    )
  `);
}

/**
 * Determine which department should handle a ticket based on category and priority
 * Escalates to parent departments for high-priority issues
 */
async function determineTicketDepartment(client, agencyId, category, priority) {
  try {
    // Category-based department mapping
    const categoryDepartmentMap = {
      'error': 'IT Support',
      'bug': 'IT Support',
      'technical': 'IT Support',
      'performance': 'IT Support',
      'ui': 'Design',
      'ux': 'Design',
      'feature': 'Product',
      'billing': 'Finance',
      'payment': 'Finance',
      'account': 'Customer Success',
      'general': 'Operations',
    };

    // Find department by name for the agency
    const deptName = categoryDepartmentMap[category?.toLowerCase()] || 'Operations';
    
    let deptResult = await client.query(
      `SELECT id, name, parent_department_id 
       FROM public.departments 
       WHERE agency_id = $1 AND name ILIKE $2 AND is_active = true 
       LIMIT 1`,
      [agencyId, `%${deptName}%`]
    );

    // If department not found, try to find Operations or any active department
    if (deptResult.rows.length === 0) {
      deptResult = await client.query(
        `SELECT id, name, parent_department_id 
         FROM public.departments 
         WHERE agency_id = $1 AND is_active = true 
         ORDER BY name 
         LIMIT 1`,
        [agencyId]
      );
    }

    if (deptResult.rows.length === 0) {
      return null; // No departments found
    }

    let department = deptResult.rows[0];

    // For high-priority tickets, escalate to parent department if exists
    if (priority === 'high' && department.parent_department_id) {
      const parentResult = await client.query(
        `SELECT id, name FROM public.departments WHERE id = $1 AND is_active = true`,
        [department.parent_department_id]
      );
      if (parentResult.rows.length > 0) {
        department = parentResult.rows[0];
      }
    }

    return department.name;
  } catch (error) {
    logger.error('Error determining ticket department', {
      error: error.message,
      code: error.code,
      agencyId,
      category,
      priority,
    });
    return null;
  }
}

/**
 * Ensure main-database tables for support tickets exist.
 */
async function ensureSupportTicketSchema(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.support_tickets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ticket_number TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'open', -- open | in_progress | resolved | closed
      priority TEXT NOT NULL DEFAULT 'medium', -- low | medium | high
      category TEXT NOT NULL DEFAULT 'general',
      user_id UUID,
      agency_id UUID,
      department TEXT,
      console_logs JSONB,
      error_details JSONB,
      browser_info JSONB,
      page_url TEXT,
      screenshot_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      resolved_at TIMESTAMPTZ
    )
  `);
  
  // Add new columns if they don't exist (for existing tables)
  await client.query(`
    DO $$ 
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_schema = 'public' 
                     AND table_name = 'support_tickets' 
                     AND column_name = 'user_id') THEN
        ALTER TABLE public.support_tickets ADD COLUMN user_id UUID;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_schema = 'public' 
                     AND table_name = 'support_tickets' 
                     AND column_name = 'agency_id') THEN
        ALTER TABLE public.support_tickets ADD COLUMN agency_id UUID;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_schema = 'public' 
                     AND table_name = 'support_tickets' 
                     AND column_name = 'department') THEN
        ALTER TABLE public.support_tickets ADD COLUMN department TEXT;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_schema = 'public' 
                     AND table_name = 'support_tickets' 
                     AND column_name = 'console_logs') THEN
        ALTER TABLE public.support_tickets ADD COLUMN console_logs JSONB;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_schema = 'public' 
                     AND table_name = 'support_tickets' 
                     AND column_name = 'error_details') THEN
        ALTER TABLE public.support_tickets ADD COLUMN error_details JSONB;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_schema = 'public' 
                     AND table_name = 'support_tickets' 
                     AND column_name = 'browser_info') THEN
        ALTER TABLE public.support_tickets ADD COLUMN browser_info JSONB;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_schema = 'public' 
                     AND table_name = 'support_tickets' 
                     AND column_name = 'page_url') THEN
        ALTER TABLE public.support_tickets ADD COLUMN page_url TEXT;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_schema = 'public' 
                     AND table_name = 'support_tickets' 
                     AND column_name = 'screenshot_url') THEN
        ALTER TABLE public.support_tickets ADD COLUMN screenshot_url TEXT;
      END IF;
    END $$;
  `);
}

/**
 * GET /api/system/agency-settings/:agencyId
 * Fetch main database agency_settings row for a given agency_id.
 * Used to prefill AgencySetup from onboarding wizard metadata.
 *
 * This endpoint requires authentication but NOT super admin privileges,
 * because it is used by regular agency admins during setup.
 */
router.get(
  '/agency-settings/:agencyId',
  authenticate,
  validateUUID('agencyId'),
  asyncHandler(async (req, res) => {
    const { agencyId } = req.params;

    try {
      // Use queryOne helper - automatic connection management, retry logic, and logging
      const settings = await queryOne(
        `SELECT 
           id,
           agency_id,
           agency_name,
           logo_url,
           primary_focus,
           enable_gst,
           modules,
           industry,
           phone,
           address_street,
           address_city,
           address_state,
           address_zip,
           address_country,
           employee_count
         FROM public.agency_settings
         WHERE agency_id = $1
         LIMIT 1`,
        [agencyId]
      );

      if (!settings) {
        return send(res, notFound('Agency settings', agencyId));
      }

      // Parse modules if it's a string
      let modules = settings.modules;
      if (typeof modules === 'string') {
        try {
          modules = JSON.parse(modules);
        } catch {
          modules = null;
        }
      }

      return send(res, success(
        { settings: { ...settings, modules } },
        'Agency settings fetched successfully',
        { requestId: req.requestId }
      ));
    } catch (error) {
      logger.error('Error fetching agency settings', {
        agencyId,
        error: error.message,
        code: error.code,
        requestId: req.requestId,
      });
      return send(res, databaseError(error, 'Fetch agency settings'));
    }
  })
);

/**
 * GET /api/system/metrics
 * System-wide statistics for the super admin dashboard.
 *
 * Returns:
 * {
 *   success: true,
 *   data: {
 *     metrics: { ... },
 *     agencies: [ ... ]
 *   }
 * }
 */
/**
 * OPTIONS /api/system/metrics
 * Handle CORS preflight requests
 */
router.options('/metrics', (req, res) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
  res.sendStatus(204);
});

router.get(
  '/metrics',
  authenticate,
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    // Set CORS headers explicitly
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
      res.setHeader('Access-Control-Max-Age', '86400');
    }

    try {
      // Agencies summary
      let agencies = [];
      try {
        agencies = await queryMany(
          `SELECT 
             id,
             name,
             domain,
             subscription_plan,
             max_users,
             is_active,
             created_at
           FROM public.agencies
           ORDER BY created_at DESC`,
          [],
          { requestId: req.requestId }
        );
      } catch (agenciesError) {
        logger.error('Error fetching agencies for system metrics', {
          error: agenciesError.message,
          code: agenciesError.code,
          requestId: req.requestId,
        });
        // Continue with empty agencies array
        agencies = [];
      }

      // Total users - aggregate from all agency databases
      // Note: profiles table exists in agency databases, not main database
      let totalUsers = 0;
      let activeUsers = 0;
      // We'll calculate this by aggregating from agency databases if needed
      // For now, return 0 to avoid errors

      // Subscription plan distribution - count all agencies by plan type
      // Map database plan names to standardized names (starter->basic, professional->pro)
      let subscriptionPlans = {
        basic: 0,
        pro: 0,
        enterprise: 0,
      };
      try {
        const planRows = await queryMany(
          `SELECT 
            subscription_plan,
            COUNT(*)::INTEGER as count
          FROM public.agencies
          WHERE subscription_plan IS NOT NULL
          GROUP BY subscription_plan`,
          [],
          { requestId: req.requestId }
        );
        
        // Map database plan names to display names
        const planMapping = {
          'basic': 'basic',
          'starter': 'basic',
          'pro': 'pro',
          'professional': 'pro',
          'enterprise': 'enterprise',
        };
        
        planRows.forEach((row) => {
          const planName = (row.subscription_plan || '').toLowerCase().trim();
          const mappedPlan = planMapping[planName] || planName;
          
          if (mappedPlan === 'basic') {
            subscriptionPlans.basic += parseInt(row.count, 10) || 0;
          } else if (mappedPlan === 'pro') {
            subscriptionPlans.pro += parseInt(row.count, 10) || 0;
          } else if (mappedPlan === 'enterprise') {
            subscriptionPlans.enterprise += parseInt(row.count, 10) || 0;
          }
        });
      } catch (error) {
        if (error.code !== '42P01') {
          logger.warn('Failed to load subscription plans for system metrics', {
            error: error.message,
            code: error.code,
            requestId: req.requestId,
          });
        }
      }

      // Simplified pricing model for MRR/ARR
      const priceMap = { basic: 29, pro: 79, enterprise: 199 };
      const mrr =
        subscriptionPlans.basic * priceMap.basic +
        subscriptionPlans.pro * priceMap.pro +
        subscriptionPlans.enterprise * priceMap.enterprise;

      // Usage stats – these tables exist in agency databases, not main database
      // Return 0 for now - these would need to be aggregated from all agency databases
      const totalProjects = 0;
      const totalInvoices = 0;
      const totalClients = 0;
      const totalAttendanceRecords = 0;

      // Per-agency statistics - these tables exist in agency databases
      // For now, return 0 counts - would need to query each agency database
      const agenciesWithStats = agencies.map((agency) => ({
        ...agency,
        user_count: 0,
        project_count: 0,
        invoice_count: 0,
      }));

      const metrics = {
        totalAgencies: agencies.length,
        activeAgencies: agencies.filter((a) => a.is_active).length,
        totalUsers,
        activeUsers,
        subscriptionPlans,
        revenueMetrics: {
          mrr,
          arr: mrr * 12,
        },
        usageStats: {
          totalProjects,
          totalInvoices,
          totalClients,
          totalAttendanceRecords,
        },
        systemHealth: {
          // Health metrics are currently synthetic; can be wired to real monitoring later
          uptime: '99.9%',
          responseTime: Math.random() * 100 + 50,
          errorRate: Math.random() * 2,
        },
      };

      return send(res, success(
        {
          metrics,
          agencies: agenciesWithStats,
        },
        'System metrics loaded successfully',
        { requestId: req.requestId }
      ));
    } catch (error) {
      logger.error('Error computing system metrics', {
        error: error.message,
        stack: error.stack,
        code: error.code,
        requestId: req.requestId,
      });
      
      // Set CORS headers even on error
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
      }
      
      return send(res, databaseError(error, 'Load system metrics'));
    }
  })
);

/**
 * GET /api/system/plans
 * List all subscription plans with their mapped features.
 */
router.get(
  '/plans',
  authenticate,
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    try {
      // Ensure schema exists first (using main pool)
      const mainPool = require('../config/database').pool;
      const schemaClient = await mainPool.connect();
      try {
        await ensureSubscriptionSchema(schemaClient);
      } finally {
        schemaClient.release();
      }

      // Fetch plans using queryMany helper
      const plans = await queryMany(
        `SELECT * FROM public.subscription_plans ORDER BY price ASC, created_at DESC`
      );

      // Fetch feature mappings if plans exist
      let mappings = [];
      if (plans.length > 0) {
        const planIds = plans.map((p) => p.id);
        const placeholders = planIds.map((_, i) => `$${i + 1}`).join(',');
        mappings = await queryMany(
          `SELECT 
             pfm.plan_id,
             pfm.feature_id,
             pfm.enabled,
             pf.id,
             pf.name,
             pf.description,
             pf.feature_key
           FROM public.plan_feature_mappings pfm
           INNER JOIN public.plan_features pf ON pfm.feature_id = pf.id
           WHERE pfm.plan_id IN (${placeholders})`,
          planIds
        );
      }

      // Group mappings by plan_id
      const mappingsByPlan = mappings.reduce((acc, mapping) => {
        if (!acc[mapping.plan_id]) {
          acc[mapping.plan_id] = [];
        }
        acc[mapping.plan_id].push({
          id: mapping.id,
          name: mapping.name,
          description: mapping.description,
          feature_key: mapping.feature_key,
          enabled: mapping.enabled,
        });
        return acc;
      }, {});

      // Transform plans with features
      const transformedPlans = plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        description: plan.description || '',
        price: Number(plan.price),
        currency: plan.currency,
        interval: plan.interval,
        is_active: plan.is_active,
        max_users: plan.max_users,
        max_agencies: plan.max_agencies,
        max_storage_gb: plan.max_storage_gb,
        stripe_product_id: plan.stripe_product_id,
        stripe_price_id: plan.stripe_price_id,
        features: mappingsByPlan[plan.id] || [],
      }));

      return send(res, success(
        { plans: transformedPlans },
        'Subscription plans fetched successfully',
        { requestId: req.requestId }
      ));
    } catch (error) {
      logger.error('Error fetching subscription plans', {
        error: error.message,
        code: error.code,
        requestId: req.requestId,
      });
      return send(res, databaseError(error, 'Fetch subscription plans'));
    }
  })
);

/**
 * GET /api/system/features
 * List active plan features.
 */
router.get(
  '/features',
  authenticate,
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    try {
      // Ensure schema exists first (using main pool)
      const mainPool = require('../config/database').pool;
      const schemaClient = await mainPool.connect();
      try {
        await ensureSubscriptionSchema(schemaClient);
      } finally {
        schemaClient.release();
      }

      // Fetch features using queryMany helper
      const featuresRows = await queryMany(
        `SELECT * FROM public.plan_features WHERE is_active = $1 ORDER BY name ASC`,
        [true]
      );

      const features = featuresRows.map((feature) => ({
        id: feature.id,
        name: feature.name,
        description: feature.description || '',
        feature_key: feature.feature_key,
        enabled: false,
      }));

      return send(res, success(
        { features },
        'Features fetched successfully',
        { requestId: req.requestId }
      ));
    } catch (error) {
      // If table doesn't exist yet, return empty array instead of error
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        logger.info('Plan features table does not exist, returning empty array', {
          requestId: req.requestId,
        });
        return send(res, success(
          { features: [] },
          'Features fetched successfully (table not initialized)',
          { requestId: req.requestId }
        ));
      }

      logger.error('Error fetching features', {
        error: error.message,
        code: error.code,
        requestId: req.requestId,
      });
      return send(res, databaseError(error, 'Fetch plan features'));
    }
  })
);

/**
 * POST /api/system/plans
 * Create a new subscription plan.
 */
router.post(
  '/plans',
  authenticate,
  requireSuperAdmin,
  requireFields(['name', 'price', 'currency', 'interval']),
  asyncHandler(async (req, res) => {
    const {
      name,
      description,
      price,
      currency,
      interval,
      is_active,
      max_users,
      max_agencies,
      max_storage_gb,
      stripe_product_id,
      stripe_price_id,
      features = [],
    } = req.body || {};

    // Additional validation for price type
    if (typeof price !== 'number') {
      return send(res, validationError(
        'price must be a number',
        { price }
      ));
    }

    try {
      // Ensure schema exists first (using main pool)
      const mainPool = require('../config/database').pool;
      const schemaClient = await mainPool.connect();
      try {
        await ensureSubscriptionSchema(schemaClient);
      } finally {
        schemaClient.release();
      }

      // Insert plan first
      const insertResult = await query(
        `INSERT INTO public.subscription_plans 
           (name, description, price, currency, interval, is_active,
            max_users, max_agencies, max_storage_gb, stripe_product_id, stripe_price_id, created_at)
         VALUES ($1, $2, $3, $4, $5, COALESCE($6, true),
                 $7, $8, $9, $10, $11, NOW())
         RETURNING *`,
        [
          name,
          description || '',
          price,
          currency,
          interval,
          is_active,
          max_users,
          max_agencies,
          max_storage_gb,
          stripe_product_id || null,
          stripe_price_id || null,
        ]
      );

      const plan = insertResult.rows[0];
      if (!plan) {
        throw new Error('Failed to create plan - no row returned');
      }

      // Insert feature mappings if provided (using transaction for atomicity)
      if (Array.isArray(features) && features.length > 0) {
        const mappingQueries = features.map((feature) => ({
          sql: `INSERT INTO public.plan_feature_mappings (plan_id, feature_id, enabled)
                VALUES ($1, $2, $3)
                ON CONFLICT (plan_id, feature_id) DO UPDATE SET enabled = $3`,
          params: [plan.id, feature.id, !!feature.enabled],
        }));

        // Execute feature mappings in a transaction
        await transaction(mappingQueries);
      }

      return send(res, success(
        { plan },
        'Plan created successfully',
        { requestId: req.requestId }
      ), 201);
    } catch (error) {
      logger.error('Error creating subscription plan', {
        name,
        price,
        currency,
        interval,
        error: error.message,
        code: error.code,
        requestId: req.requestId,
      });
      return send(res, databaseError(error, 'Create subscription plan'));
    }
  })
);

/**
 * PUT /api/system/plans/:id
 * Update a subscription plan and its feature mappings.
 */
router.put(
  '/plans/:id',
  authenticate,
  requireSuperAdmin,
  validateUUID('id'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body || {};

    try {
      // Ensure schema exists first (using main pool)
      const mainPool = require('../config/database').pool;
      const schemaClient = await mainPool.connect();
      try {
        await ensureSubscriptionSchema(schemaClient);
      } finally {
        schemaClient.release();
      }

      // Build transaction queries
      const queries = [
        {
          sql: `UPDATE public.subscription_plans
                SET name = COALESCE($1, name),
                    description = COALESCE($2, description),
                    price = COALESCE($3, price),
                    currency = COALESCE($4, currency),
                    interval = COALESCE($5, interval),
                    is_active = COALESCE($6, is_active),
                    max_users = COALESCE($7, max_users),
                    max_agencies = COALESCE($8, max_agencies),
                    max_storage_gb = COALESCE($9, max_storage_gb),
                    stripe_product_id = COALESCE($10, stripe_product_id),
                    stripe_price_id = COALESCE($11, stripe_price_id),
                    updated_at = NOW()
                WHERE id = $12
                RETURNING *`,
          params: [
            updates.name,
            updates.description,
            updates.price,
            updates.currency,
            updates.interval,
            updates.is_active,
            updates.max_users,
            updates.max_agencies,
            updates.max_storage_gb,
            updates.stripe_product_id,
            updates.stripe_price_id,
            id,
          ],
        },
      ];

      // Add feature mapping operations if features array provided
      if (Array.isArray(updates.features)) {
        // Delete existing mappings
        queries.push({
          sql: `DELETE FROM public.plan_feature_mappings WHERE plan_id = $1`,
          params: [id],
        });

        // Insert new mappings if provided
        if (updates.features.length > 0) {
          // Build INSERT query with ON CONFLICT
          const mappingQueries = updates.features.map((feature) => ({
            sql: `INSERT INTO public.plan_feature_mappings (plan_id, feature_id, enabled)
                  VALUES ($1, $2, $3)
                  ON CONFLICT (plan_id, feature_id) DO UPDATE SET enabled = EXCLUDED.enabled`,
            params: [id, feature.id, !!feature.enabled],
          }));

          queries.push(...mappingQueries);
        }
      }

      // Execute transaction
      const results = await transaction(queries);
      const plan = results[0].rows[0];

      if (!plan) {
        return send(res, notFound('Plan', id));
      }

      return send(res, success(
        { plan },
        'Plan updated successfully',
        { requestId: req.requestId }
      ));
    } catch (error) {
      logger.error('Error updating subscription plan', {
        planId: id,
        updates: Object.keys(updates),
        error: error.message,
        code: error.code,
        requestId: req.requestId,
      });
      return send(res, databaseError(error, 'Update subscription plan'));
    }
  })
);

/**
 * DELETE /api/system/plans/:id
 * Soft-deactivate a plan.
 */
router.delete(
  '/plans/:id',
  authenticate,
  requireSuperAdmin,
  validateUUID('id'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
      // Ensure schema exists first (using main pool)
      const mainPool = require('../config/database').pool;
      const schemaClient = await mainPool.connect();
      try {
        await ensureSubscriptionSchema(schemaClient);
      } finally {
        schemaClient.release();
      }

      // Soft delete (deactivate) plan
      const updateResult = await query(
        `UPDATE public.subscription_plans
         SET is_active = false, updated_at = NOW()
         WHERE id = $1`,
        [id]
      );

      if (updateResult.rowCount === 0) {
        return send(res, notFound('Plan', id));
      }

      return send(res, success(
        null,
        'Plan deactivated successfully',
        { requestId: req.requestId }
      ));
    } catch (error) {
      logger.error('Error deactivating subscription plan', {
        planId: id,
        error: error.message,
        code: error.code,
        requestId: req.requestId,
      });
      return send(res, databaseError(error, 'Deactivate subscription plan'));
    }
  })
);

/**
 * POST /api/system/features
 * Create a new plan feature.
 */
router.post(
  '/features',
  authenticate,
  requireSuperAdmin,
  requireFields(['name', 'feature_key']),
  asyncHandler(async (req, res) => {
    const { name, description, feature_key } = req.body || {};

    try {
      // Ensure schema exists first (using main pool)
      const mainPool = require('../config/database').pool;
      const schemaClient = await mainPool.connect();
      try {
        await ensureSubscriptionSchema(schemaClient);
      } finally {
        schemaClient.release();
      }

      // Insert feature using query helper
      const insertResult = await query(
        `INSERT INTO public.plan_features
           (name, description, feature_key, is_active, created_at)
         VALUES ($1, $2, $3, true, NOW())
         RETURNING *`,
        [name, description || '', feature_key]
      );

      const feature = insertResult.rows[0];
      if (!feature) {
        throw new Error('Failed to create feature - no row returned');
      }

      return send(res, success(
        { feature },
        'Feature created successfully',
        { requestId: req.requestId }
      ), 201);
    } catch (error) {
      logger.error('Error creating plan feature', {
        name,
        feature_key,
        error: error.message,
        code: error.code,
        requestId: req.requestId,
      });
      return send(res, databaseError(error, 'Create plan feature'));
    }
  })
);

/**
 * PUT /api/system/features/:id
 * Update an existing feature.
 */
router.put(
  '/features/:id',
  authenticate,
  requireSuperAdmin,
  validateUUID('id'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body || {};

    try {
      // Ensure schema exists first (using main pool)
      const mainPool = require('../config/database').pool;
      const schemaClient = await mainPool.connect();
      try {
        await ensureSubscriptionSchema(schemaClient);
      } finally {
        schemaClient.release();
      }

      // Update feature (using COALESCE for partial updates)
      const updateResult = await query(
        `UPDATE public.plan_features
         SET name = COALESCE($1, name),
             description = COALESCE($2, description),
             feature_key = COALESCE($3, feature_key),
             updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [updates.name, updates.description, updates.feature_key, id]
      );

      if (updateResult.rowCount === 0) {
        return send(res, notFound('Feature', id));
      }

      return send(res, success(
        { feature: updateResult.rows[0] },
        'Feature updated successfully',
        { requestId: req.requestId }
      ));
    } catch (error) {
      logger.error('Error updating plan feature', {
        featureId: id,
        updates,
        error: error.message,
        code: error.code,
        requestId: req.requestId,
      });
      return send(res, databaseError(error, 'Update plan feature'));
    }
  })
);

/**
 * DELETE /api/system/features/:id
 * Deactivate or delete a feature depending on usage.
 */
router.delete(
  '/features/:id',
  authenticate,
  requireSuperAdmin,
  validateUUID('id'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
      // Ensure schema exists first (using main pool)
      const mainPool = require('../config/database').pool;
      const schemaClient = await mainPool.connect();
      try {
        await ensureSubscriptionSchema(schemaClient);
      } finally {
        schemaClient.release();
      }

      // Check if feature is used in any plan mappings
      const usageResult = await queryOne(
        `SELECT COUNT(*) as count FROM public.plan_feature_mappings WHERE feature_id = $1`,
        [id]
      );
      const usageCount = parseInt(usageResult?.count || '0', 10);

      if (usageCount > 0) {
        // Soft delete (deactivate) - feature is still used in plans
        const updateResult = await query(
          `UPDATE public.plan_features
           SET is_active = false, updated_at = NOW()
           WHERE id = $1`,
          [id]
        );

        if (updateResult.rowCount === 0) {
          return send(res, notFound('Feature', id));
        }

        return send(res, success(
          null,
          'Feature deactivated (it is still used in plans)',
          { requestId: req.requestId }
        ));
      }

      // Hard delete - feature is not used in any plans
      const deleteResult = await query(
        `DELETE FROM public.plan_features WHERE id = $1`,
        [id]
      );

      if (deleteResult.rowCount === 0) {
        return send(res, notFound('Feature', id));
      }

      return send(res, success(
        null,
        'Feature deleted successfully',
        { requestId: req.requestId }
      ));
    } catch (error) {
      logger.error('Error deleting plan feature', {
        featureId: id,
        error: error.message,
        code: error.code,
        requestId: req.requestId,
      });
      return send(res, databaseError(error, 'Delete plan feature'));
    }
  })
);

/**
 * GET /api/system/tickets/summary
 * Support ticket stats + recent tickets for the widget.
 */
router.get(
  '/tickets/summary',
  authenticate,
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    try {
      // Ensure schema exists first (using main pool)
      const mainPool = require('../config/database').pool;
      const schemaClient = await mainPool.connect();
      try {
        await ensureSupportTicketSchema(schemaClient);
      } finally {
        schemaClient.release();
      }

      // Execute all queries in parallel for better performance
      const [statsRow, todayRow, resolutionRow, recentTickets] = await Promise.all([
        queryOne(`
          SELECT
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'open') as open,
            COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
            COUNT(*) FILTER (WHERE status = 'resolved') as resolved
          FROM public.support_tickets
        `),
        queryOne(`
          SELECT
            COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE) as new_today,
            COUNT(*) FILTER (WHERE resolved_at::date = CURRENT_DATE) as resolved_today
          FROM public.support_tickets
        `),
        queryOne(`
          SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600.0) as avg_hours
          FROM public.support_tickets
          WHERE resolved_at IS NOT NULL
        `),
        queryMany(
          `SELECT
             id,
             ticket_number,
             title,
             status,
             priority,
             created_at,
             category
           FROM public.support_tickets
           ORDER BY created_at DESC
           LIMIT 20`
        ),
      ]);

      // Transform data
      const stats = {
        total: Number(statsRow?.total || 0),
        open: Number(statsRow?.open || 0),
        inProgress: Number(statsRow?.in_progress || 0),
        resolved: Number(statsRow?.resolved || 0),
        avgResolutionTime: Number(resolutionRow?.avg_hours || 0),
        newToday: Number(todayRow?.new_today || 0),
        resolvedToday: Number(todayRow?.resolved_today || 0),
      };

      return send(res, success(
        {
          stats,
          recentTickets: recentTickets || [],
        },
        'Ticket summary fetched successfully',
        { requestId: req.requestId }
      ));
    } catch (error) {
      logger.error('Error fetching ticket summary', {
        error: error.message,
        code: error.code,
        requestId: req.requestId,
      });
      return send(res, databaseError(error, 'Fetch ticket summary'));
    }
  })
);

/**
 * GET /api/system/tickets
 * List all support tickets with optional filtering
 */
router.get(
  '/tickets',
  authenticate,
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    const { status, priority, category, limit = 50, offset = 0 } = req.query;

    try {
      // Ensure schema exists first (using main pool)
      const mainPool = require('../config/database').pool;
      const schemaClient = await mainPool.connect();
      try {
        await ensureSupportTicketSchema(schemaClient);
      } finally {
        schemaClient.release();
      }

      // Build dynamic query with filters
      let sqlQuery = 'SELECT * FROM public.support_tickets WHERE 1=1';
      const params = [];
      let paramIndex = 1;

      if (status) {
        sqlQuery += ` AND status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (priority) {
        sqlQuery += ` AND priority = $${paramIndex}`;
        params.push(priority);
        paramIndex++;
      }

      if (category) {
        sqlQuery += ` AND category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }

      sqlQuery += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(parseInt(limit, 10), parseInt(offset, 10));

      // Fetch tickets using queryMany helper
      const tickets = await queryMany(sqlQuery, params);

      return send(res, success(
        { tickets },
        'Tickets fetched successfully',
        { 
          requestId: req.requestId,
          pagination: {
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10),
            count: tickets.length,
          },
        }
      ));
    } catch (error) {
      logger.error('Error fetching support tickets', {
        filters: { status, priority, category },
        error: error.message,
        code: error.code,
        requestId: req.requestId,
      });
      return send(res, databaseError(error, 'Fetch support tickets'));
    }
  })
);

/**
 * POST /api/system/tickets/public
 * Create a new support ticket (accessible to all authenticated users)
 * This endpoint allows any user to create tickets with console logs and error details
 * NOTE: This route MUST be defined BEFORE /tickets/:id to avoid route conflicts
 */
router.post(
  '/tickets/public',
  authenticate,
  requireFields(['title', 'description']),
  asyncHandler(async (req, res) => {
    const { 
      title, 
      description, 
      priority = 'medium', 
      category = 'general',
      console_logs,
      error_details,
      browser_info,
      page_url,
      department
    } = req.body;

    // Validate priority
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(priority)) {
      return send(res, validationError(
        `priority must be one of: ${validPriorities.join(', ')}`,
        { priority, validPriorities }
      ));
    }

    try {
      // Ensure schema exists first (using main pool)
      const mainPool = require('../config/database').pool;
      const schemaClient = await mainPool.connect();
      try {
        await ensureSupportTicketSchema(schemaClient);
      } finally {
        schemaClient.release();
      }

      // Get user info from authenticated request
      const userId = req.user?.id || null;
      const agencyId = req.user?.agencyId || null;

      // Determine department escalation based on priority and category
      let assignedDepartment = department || null;
      if (!assignedDepartment && agencyId) {
        // Auto-assign department - need to use a client for this function
        const deptClient = await mainPool.connect();
        try {
          assignedDepartment = await determineTicketDepartment(deptClient, agencyId, category, priority);
        } finally {
          deptClient.release();
        }
      }

      // Generate unique ticket number
      const countResult = await queryOne(
        'SELECT COUNT(*) as count FROM public.support_tickets'
      );
      const count = parseInt(countResult?.count || '0', 10);
      const ticketNumber = `TKT-${String(count + 1).padStart(6, '0')}`;

      // Insert ticket
      const insertResult = await query(
        `INSERT INTO public.support_tickets 
         (ticket_number, title, description, status, priority, category, 
          user_id, agency_id, department, console_logs, error_details, 
          browser_info, page_url, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
         RETURNING *`,
        [
          ticketNumber, 
          title, 
          description, 
          'open', // Always start as open for user-created tickets
          priority, 
          category,
          userId,
          agencyId,
          assignedDepartment,
          console_logs ? JSON.stringify(console_logs) : null,
          error_details ? JSON.stringify(error_details) : null,
          browser_info ? JSON.stringify(browser_info) : null,
          page_url || null
        ]
      );

      const ticket = insertResult.rows[0];
      if (!ticket) {
        throw new Error('Failed to create ticket - no row returned');
      }

      return send(res, success(
        { ticket },
        'Ticket created successfully',
        { requestId: req.requestId }
      ), 201);
    } catch (error) {
      logger.error('Error creating public support ticket', {
        title,
        priority,
        category,
        userId,
        agencyId,
        error: error.message,
        code: error.code,
        requestId: req.requestId,
      });
      return send(res, databaseError(error, 'Create support ticket'));
    }
  })
);

/**
 * GET /api/system/tickets/:id
 * Get a single ticket by ID
 * NOTE: This route MUST be defined AFTER /tickets/public to avoid route conflicts
 */
router.get(
  '/tickets/:id',
  authenticate,
  requireSuperAdmin,
  validateUUID('id'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
      // Ensure schema exists first (using main pool)
      const mainPool = require('../config/database').pool;
      const schemaClient = await mainPool.connect();
      try {
        await ensureSupportTicketSchema(schemaClient);
      } finally {
        schemaClient.release();
      }

      // Fetch ticket using queryOne helper - automatic connection management
      const ticket = await queryOne(
        'SELECT * FROM public.support_tickets WHERE id = $1',
        [id]
      );

      if (!ticket) {
        return send(res, notFound('Support ticket', id));
      }

      return send(res, success(
        { ticket },
        'Ticket fetched successfully',
        { requestId: req.requestId }
      ));
    } catch (error) {
      logger.error('Error fetching support ticket', {
        ticketId: id,
        error: error.message,
        code: error.code,
        requestId: req.requestId,
      });
      return send(res, databaseError(error, 'Fetch support ticket'));
    }
  })
);

/**
 * POST /api/system/tickets
 * Create a new support ticket (super admin only - for admin panel)
 */
router.post(
  '/tickets',
  authenticate,
  requireSuperAdmin,
  requireFields(['title', 'description']),
  asyncHandler(async (req, res) => {
    const { 
      title, 
      description, 
      priority = 'medium', 
      category = 'general', 
      status = 'open',
      user_id,
      agency_id,
      department,
      console_logs,
      error_details,
      browser_info,
      page_url
    } = req.body;

    // Validate status and priority
    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    const validPriorities = ['low', 'medium', 'high'];

    if (!validStatuses.includes(status)) {
      return send(res, validationError(
        `status must be one of: ${validStatuses.join(', ')}`,
        { status, validStatuses }
      ));
    }

    if (!validPriorities.includes(priority)) {
      return send(res, validationError(
        `priority must be one of: ${validPriorities.join(', ')}`,
        { priority, validPriorities }
      ));
    }

    try {
      // Ensure schema exists first (using main pool)
      const mainPool = require('../config/database').pool;
      const schemaClient = await mainPool.connect();
      try {
        await ensureSupportTicketSchema(schemaClient);
      } finally {
        schemaClient.release();
      }

      // Generate unique ticket number
      const countResult = await queryOne(
        'SELECT COUNT(*) as count FROM public.support_tickets'
      );
      const count = parseInt(countResult?.count || '0', 10);
      const ticketNumber = `TKT-${String(count + 1).padStart(6, '0')}`;

      // Insert ticket
      const insertResult = await query(
        `INSERT INTO public.support_tickets 
         (ticket_number, title, description, status, priority, category, 
          user_id, agency_id, department, console_logs, error_details, 
          browser_info, page_url, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
         RETURNING *`,
        [
          ticketNumber, 
          title, 
          description, 
          status, 
          priority, 
          category,
          user_id || null,
          agency_id || null,
          department || null,
          console_logs ? JSON.stringify(console_logs) : null,
          error_details ? JSON.stringify(error_details) : null,
          browser_info ? JSON.stringify(browser_info) : null,
          page_url || null
        ]
      );

      const ticket = insertResult.rows[0];
      if (!ticket) {
        throw new Error('Failed to create ticket - no row returned');
      }

      return send(res, success(
        { ticket },
        'Ticket created successfully',
        { requestId: req.requestId }
      ), 201);
    } catch (error) {
      logger.error('Error creating support ticket', {
        title,
        status,
        priority,
        category,
        error: error.message,
        code: error.code,
        requestId: req.requestId,
      });
      return send(res, databaseError(error, 'Create support ticket'));
    }
  })
);

/**
 * PUT /api/system/tickets/:id
 * Update a support ticket
 */
router.put(
  '/tickets/:id',
  authenticate,
  requireSuperAdmin,
  validateUUID('id'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, status, priority, category } = req.body;

    // Validate status if provided
    if (status !== undefined) {
      const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
      if (!validStatuses.includes(status)) {
        return send(res, validationError(
          `status must be one of: ${validStatuses.join(', ')}`,
          { status, validStatuses }
        ));
      }
    }

    // Validate priority if provided
    if (priority !== undefined) {
      const validPriorities = ['low', 'medium', 'high'];
      if (!validPriorities.includes(priority)) {
        return send(res, validationError(
          `priority must be one of: ${validPriorities.join(', ')}`,
          { priority, validPriorities }
        ));
      }
    }

    try {
      // Ensure schema exists first (using main pool)
      const mainPool = require('../config/database').pool;
      const schemaClient = await mainPool.connect();
      try {
        await ensureSupportTicketSchema(schemaClient);
      } finally {
        schemaClient.release();
      }

      // Build dynamic UPDATE query
      const updates = [];
      const params = [];
      let paramIndex = 1;

      if (title !== undefined) {
        updates.push(`title = $${paramIndex}`);
        params.push(title);
        paramIndex++;
      }

      if (description !== undefined) {
        updates.push(`description = $${paramIndex}`);
        params.push(description);
        paramIndex++;
      }

      if (status !== undefined) {
        updates.push(`status = $${paramIndex}`);
        params.push(status);
        paramIndex++;

        // Auto-set resolved_at based on status
        if (status === 'resolved') {
          updates.push(`resolved_at = NOW()`);
        } else {
          updates.push(`resolved_at = NULL`);
        }
      }

      if (priority !== undefined) {
        updates.push(`priority = $${paramIndex}`);
        params.push(priority);
        paramIndex++;
      }

      if (category !== undefined) {
        updates.push(`category = $${paramIndex}`);
        params.push(category);
        paramIndex++;
      }

      if (updates.length === 0) {
        return send(res, validationError(
          'No fields to update',
          { providedFields: Object.keys(req.body) }
        ));
      }

      updates.push(`updated_at = NOW()`);
      params.push(id);

      const sql = `
        UPDATE public.support_tickets
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await query(sql, params);

      if (result.rowCount === 0) {
        return send(res, notFound('Ticket', id));
      }

      return send(res, success(
        { ticket: result.rows[0] },
        'Ticket updated successfully',
        { requestId: req.requestId }
      ));
    } catch (error) {
      logger.error('Error updating support ticket', {
        ticketId: id,
        updates: { title, description, status, priority, category },
        error: error.message,
        code: error.code,
        requestId: req.requestId,
      });
      return send(res, databaseError(error, 'Update support ticket'));
    }
  })
);

/**
 * DELETE /api/system/tickets/:id
 * Delete a support ticket
 */
router.delete(
  '/tickets/:id',
  authenticate,
  requireSuperAdmin,
  validateUUID('id'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
      // Ensure schema exists first (using main pool)
      const mainPool = require('../config/database').pool;
      const schemaClient = await mainPool.connect();
      try {
        await ensureSupportTicketSchema(schemaClient);
      } finally {
        schemaClient.release();
      }

      // Delete ticket
      const deleteResult = await query(
        'DELETE FROM public.support_tickets WHERE id = $1 RETURNING id',
        [id]
      );

      if (deleteResult.rowCount === 0) {
        return send(res, notFound('Ticket', id));
      }

      return send(res, success(
        null,
        'Ticket deleted successfully',
        { requestId: req.requestId }
      ));
    } catch (error) {
      logger.error('Error deleting support ticket', {
        ticketId: id,
        error: error.message,
        code: error.code,
        requestId: req.requestId,
      });
      return send(res, databaseError(error, 'Delete support ticket'));
    }
  })
);

/**
 * POST /api/system/agencies/:id/export-backup
 * Export all agency database tables to CSV and create ZIP archive
 * Requires super_admin role
 * NOTE: This route MUST be defined BEFORE /agencies/:id to avoid route conflicts
 */
router.post(
  '/agencies/:id/export-backup',
  authenticate,
  requireSuperAdmin,
  validateUUID,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { exportAgencyToCSV } = require('../services/agencyExportService');

    try {
      // Get agency information
      const agency = await queryOne(
        'SELECT id, name, database_name FROM public.agencies WHERE id = $1',
        [id],
        { requestId: req.requestId }
      );

      if (!agency) {
        return send(res, notFound('Agency not found', 'AGENCY_NOT_FOUND'));
      }
      let databaseName = agency.database_name;

      // If database_name is not set, try to discover it
      if (!databaseName) {
        logger.info('Agency has no database_name, attempting discovery', {
          agencyId: id,
          agencyName: agency.name,
          requestId: req.requestId,
        });
        const { discoverAndUpdateAgencyDatabase } = require('../services/agencyDatabaseDiscovery');
        const discoveredDb = await discoverAndUpdateAgencyDatabase(id);
        
        if (discoveredDb) {
          databaseName = discoveredDb;
          logger.info('Discovered database for agency', {
            agencyId: id,
            databaseName: discoveredDb,
            requestId: req.requestId,
          });
        } else {
          return send(res, errorResponse(
            'Agency database not found. This agency may not have a database assigned.',
            'NO_DATABASE',
            { details: `Agency "${agency.name}" (${id}) does not have a database_name set and no matching database could be found.` },
            400
          ));
        }
      }

      // Verify database exists before attempting export
      try {
        const { parseDatabaseUrl } = require('../infrastructure/database/poolManager');
        const { host, port, user, password } = parseDatabaseUrl();
        const { Pool } = require('pg');
        const postgresPool = new Pool({
          host,
          port,
          user,
          password,
          database: 'postgres',
        });
        const postgresClient = await postgresPool.connect();
        
        try {
          const dbCheck = await postgresClient.query(
            'SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = $1) as exists',
            [databaseName]
          );
          
          if (!dbCheck.rows[0].exists) {
            return send(res, errorResponse(
              `Database "${databaseName}" does not exist`,
              'DATABASE_NOT_EXISTS',
              { details: `The database for agency "${agency.name}" was not found. It may have been deleted.` },
              400
            ));
          }
        } finally {
          postgresClient.release();
          await postgresPool.end();
        }
      } catch (checkError) {
        logger.error('Error checking database existence for export', {
          error: checkError.message,
          code: checkError.code,
          agencyId: id,
          databaseName,
          requestId: req.requestId,
        });
        // Continue with export attempt - connection error will be caught below
      }

      // Export to ZIP
      logger.info('Exporting backup for agency', {
        agencyId: id,
        agencyName: agency.name,
        databaseName,
        requestId: req.requestId,
      });
      const zipBuffer = await exportAgencyToCSV(id, databaseName);

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const safeName = agency.name.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `agency_backup_${safeName}_${timestamp}.zip`;

      // Set response headers
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', zipBuffer.length);

      // Send ZIP file
      res.send(zipBuffer);
      logger.info('Backup exported successfully', {
        agencyId: id,
        filename,
        requestId: req.requestId,
      });
    } catch (error) {
      logger.error('Error exporting agency backup', {
        error: error.message,
        code: error.code,
        agencyId: id,
        requestId: req.requestId,
      });
      return send(res, errorResponse(
        'Failed to export agency backup',
        'EXPORT_FAILED',
        { details: error.message },
        500
      ));
    }
  })
);

/**
 * DELETE /api/system/agencies/:id
 * Delete an agency completely (database and records)
 * Requires super_admin role
 * NOTE: This route MUST be defined BEFORE /agencies/:id to avoid route conflicts
 */
router.delete(
  '/agencies/:id',
  authenticate,
  requireSuperAdmin,
  validateUUID('id'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { deleteAgency, checkAgencyDeletionSafety } = require('../services/agencyDeleteService');

    try {
      // Check deletion safety (optional - for warnings)
      const safetyCheck = await checkAgencyDeletionSafety(id);

      // Delete the agency
      logger.info('Deleting agency', { agencyId: id, requestId: req.requestId });
      const result = await deleteAgency(id);

      return send(res, success(
        {
          agencyId: id,
          agencyName: result.agencyName,
          databaseName: result.databaseName,
          warnings: safetyCheck.warnings || [],
        },
        result.message,
        { requestId: req.requestId }
      ));
    } catch (error) {
      logger.error('Error deleting agency', {
        agencyId: id,
        error: error.message,
        code: error.code,
        requestId: req.requestId,
      });
      
      // Use custom error code for delete failures
      return send(res, errorResponse(
        error.message || 'Failed to delete agency',
        'DELETE_FAILED',
        error.message,
        500,
        { requestId: req.requestId }
      ));
    }
  })
);

/**
 * GET /api/system/agencies/:id
 * Get detailed information about a specific agency
 */
router.get(
  '/agencies/:id',
  authenticate,
  requireSuperAdmin,
  validateUUID('id'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
      // Fetch agency using queryOne helper
      const agency = await queryOne(
        `SELECT 
           id,
           name,
           domain,
           subscription_plan,
           max_users,
           is_active,
           created_at
         FROM public.agencies
         WHERE id = $1`,
        [id]
      );

      if (!agency) {
        return send(res, notFound('Agency', id));
      }

      // Get counts in parallel (with error handling for missing tables)
      const [userCountResult, projectCountResult, invoiceCountResult] = await Promise.allSettled([
        queryOne('SELECT COUNT(*) as count FROM public.profiles WHERE agency_id = $1', [id]),
        queryOne('SELECT COUNT(*) as count FROM public.projects WHERE agency_id = $1', [id]),
        queryOne('SELECT COUNT(*) as count FROM public.invoices WHERE agency_id = $1', [id]),
      ]);

      // Extract counts, defaulting to 0 on error or missing table
      const userCount = userCountResult.status === 'fulfilled' && userCountResult.value
        ? parseInt(userCountResult.value.count || '0', 10)
        : 0;
      
      const projectCount = projectCountResult.status === 'fulfilled' && projectCountResult.value
        ? parseInt(projectCountResult.value.count || '0', 10)
        : 0;
      
      const invoiceCount = invoiceCountResult.status === 'fulfilled' && invoiceCountResult.value
        ? parseInt(invoiceCountResult.value.count || '0', 10)
        : 0;

      // Log warnings for non-table-missing errors
      if (userCountResult.status === 'rejected' && userCountResult.reason?.code !== '42P01') {
        logger.warn('Failed to count users for agency', {
          agencyId: id,
          error: userCountResult.reason?.message,
          requestId: req.requestId,
        });
      }
      if (projectCountResult.status === 'rejected' && projectCountResult.reason?.code !== '42P01') {
        logger.warn('Failed to count projects for agency', {
          agencyId: id,
          error: projectCountResult.reason?.message,
          requestId: req.requestId,
        });
      }
      if (invoiceCountResult.status === 'rejected' && invoiceCountResult.reason?.code !== '42P01') {
        logger.warn('Failed to count invoices for agency', {
          agencyId: id,
          error: invoiceCountResult.reason?.message,
          requestId: req.requestId,
        });
      }

      return send(res, success(
        {
          agency: {
            ...agency,
            user_count: userCount,
            project_count: projectCount,
            invoice_count: invoiceCount,
          },
        },
        'Agency details fetched successfully',
        { requestId: req.requestId }
      ));
    } catch (error) {
      logger.error('Error fetching agency details', {
        agencyId: id,
        error: error.message,
        code: error.code,
        requestId: req.requestId,
      });
      return send(res, databaseError(error, 'Fetch agency details'));
    }
  })
);

/**
 * PUT /api/system/agencies/:id
 * Update agency information (including activate/deactivate)
 */
router.put(
  '/agencies/:id',
  authenticate,
  requireSuperAdmin,
  validateUUID('id'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, domain, subscription_plan, max_users, is_active } = req.body;

    try {
      // Build dynamic UPDATE query
      const updates = [];
      const params = [];
      let paramIndex = 1;

      if (name !== undefined) {
        updates.push(`name = $${paramIndex}`);
        params.push(name);
        paramIndex++;
      }

      if (domain !== undefined) {
        updates.push(`domain = $${paramIndex}`);
        params.push(domain);
        paramIndex++;
      }

      if (subscription_plan !== undefined) {
        updates.push(`subscription_plan = $${paramIndex}`);
        params.push(subscription_plan);
        paramIndex++;
      }

      if (max_users !== undefined) {
        updates.push(`max_users = $${paramIndex}`);
        params.push(max_users);
        paramIndex++;
      }

      if (is_active !== undefined) {
        updates.push(`is_active = $${paramIndex}`);
        params.push(is_active);
        paramIndex++;
      }

      if (updates.length === 0) {
        return send(res, validationError(
          'No fields to update',
          { providedFields: Object.keys(req.body) }
        ));
      }

      params.push(id);

      const sql = `
        UPDATE public.agencies
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await query(sql, params);

      if (result.rowCount === 0) {
        return send(res, notFound('Agency', id));
      }

      return send(res, success(
        { agency: result.rows[0] },
        'Agency updated successfully',
        { requestId: req.requestId }
      ));
    } catch (error) {
      logger.error('Error updating agency', {
        agencyId: id,
        updates: { name, domain, subscription_plan, max_users, is_active },
        error: error.message,
        code: error.code,
        requestId: req.requestId,
      });
      return send(res, databaseError(error, 'Update agency'));
    }
  })
);

/**
 * GET /api/system/agencies/:id/users
 * Get all users for a specific agency
 */
router.get(
  '/agencies/:id/users',
  authenticate,
  requireSuperAdmin,
  validateUUID('id'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
      // Verify agency exists
      const agency = await queryOne(
        'SELECT id FROM public.agencies WHERE id = $1',
        [id]
      );

      if (!agency) {
        return send(res, notFound('Agency', id));
      }

      // Get users (with error handling for missing table)
      let users = [];
      try {
        users = await queryMany(
          `SELECT 
             id,
             email,
             full_name,
             is_active,
             created_at
           FROM public.profiles
           WHERE agency_id = $1
           ORDER BY created_at DESC`,
          [id]
        );
      } catch (error) {
        // Ignore missing table errors (42P01), log others
        if (error.code !== '42P01') {
          logger.warn('Failed to fetch users for agency', {
            agencyId: id,
            error: error.message,
            code: error.code,
            requestId: req.requestId,
          });
        }
        // Return empty array if table doesn't exist
        users = [];
      }

      return send(res, success(
        { users },
        'Agency users fetched successfully',
        { requestId: req.requestId }
      ));
    } catch (error) {
      logger.error('Error fetching agency users', {
        agencyId: id,
        error: error.message,
        code: error.code,
        requestId: req.requestId,
      });
      return send(res, databaseError(error, 'Fetch agency users'));
    }
  })
);

/**
 * GET /api/system/agencies/:id/usage
 * Get usage statistics for a specific agency
 */
router.get(
  '/agencies/:id/usage',
  authenticate,
  requireSuperAdmin,
  validateUUID('id'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
      // Verify agency exists
      const agency = await queryOne(
        'SELECT id FROM public.agencies WHERE id = $1',
        [id]
      );

      if (!agency) {
        return send(res, notFound('Agency', id));
      }

      // Execute all count queries in parallel with error handling
      const [userCountResult, projectCountResult, invoiceCountResult, clientCountResult, taskCountResult] =
        await Promise.allSettled([
          queryOne('SELECT COUNT(*) as count FROM public.profiles WHERE agency_id = $1', [id]),
          queryOne('SELECT COUNT(*) as count FROM public.projects WHERE agency_id = $1', [id]),
          queryOne('SELECT COUNT(*) as count FROM public.invoices WHERE agency_id = $1', [id]),
          queryOne('SELECT COUNT(*) as count FROM public.clients WHERE agency_id = $1', [id]),
          queryOne('SELECT COUNT(*) as count FROM public.tasks WHERE agency_id = $1', [id]),
        ]);

      // Extract counts, defaulting to 0 on error or missing table
      const extractCount = (result) => {
        if (result.status === 'fulfilled' && result.value) {
          return parseInt(result.value.count || '0', 10);
        }
        // Log warnings for non-table-missing errors
        if (result.status === 'rejected' && result.reason?.code !== '42P01') {
          logger.warn('Usage count query failed', {
            agencyId: id,
            error: result.reason?.message,
            code: result.reason?.code,
            requestId: req.requestId,
          });
        }
        return 0;
      };

      const usage = {
        users: extractCount(userCountResult),
        projects: extractCount(projectCountResult),
        invoices: extractCount(invoiceCountResult),
        clients: extractCount(clientCountResult),
        tasks: extractCount(taskCountResult),
      };

      return send(res, success(
        { usage },
        'Agency usage statistics fetched successfully',
        { requestId: req.requestId }
      ));
    } catch (error) {
      logger.error('Error fetching agency usage', {
        agencyId: id,
        error: error.message,
        code: error.code,
        requestId: req.requestId,
      });
      return send(res, databaseError(error, 'Fetch agency usage'));
    }
  })
);

/**
 * OPTIONS /api/system/usage/realtime
 * Handle CORS preflight requests
 */
router.options('/usage/realtime', (req, res) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
  res.sendStatus(204);
});

/**
 * GET /api/system/usage/realtime
 * Get real-time usage statistics from audit logs and active sessions
 */
router.get(
  '/usage/realtime',
  authenticate,
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    // Set CORS headers explicitly
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
      res.setHeader('Access-Control-Max-Age', '86400');
    }

    try {
      // Get active users (users who have activity in last 15 minutes)
      let activeUsers = 0;
      let recentActions = 0;
      let totalActionsToday = 0;
      let peakHour = '00:00';

      try {
        // Check if audit_logs table exists
        const tableCheck = await queryOne(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'audit_logs'
          ) as exists
        `, [], { requestId: req.requestId });

        if (tableCheck?.exists) {
          // Active users (distinct users with activity in last 15 minutes)
          const activeUsersRow = await queryOne(`
            SELECT COUNT(DISTINCT user_id) as count
            FROM public.audit_logs
            WHERE created_at > NOW() - INTERVAL '15 minutes'
            AND user_id IS NOT NULL
          `, [], { requestId: req.requestId });
          activeUsers = parseInt(activeUsersRow?.count || '0', 10);

          // Recent actions (last 5 minutes)
          const recentActionsRow = await queryOne(`
            SELECT COUNT(*) as count
            FROM public.audit_logs
            WHERE created_at > NOW() - INTERVAL '5 minutes'
          `, [], { requestId: req.requestId });
          recentActions = parseInt(recentActionsRow?.count || '0', 10);

          // Total actions today
          const todayActionsRow = await queryOne(`
            SELECT COUNT(*) as count
            FROM public.audit_logs
            WHERE created_at::date = CURRENT_DATE
          `, [], { requestId: req.requestId });
          totalActionsToday = parseInt(todayActionsRow?.count || '0', 10);

          // Peak hour (hour with most activity today)
          const peakHourRow = await queryOne(`
            SELECT EXTRACT(HOUR FROM created_at) as hour, COUNT(*) as count
            FROM public.audit_logs
            WHERE created_at::date = CURRENT_DATE
            GROUP BY EXTRACT(HOUR FROM created_at)
            ORDER BY count DESC
            LIMIT 1
          `, [], { requestId: req.requestId });
          if (peakHourRow) {
            const hour = parseInt(peakHourRow.hour || '0', 10);
            peakHour = `${String(hour).padStart(2, '0')}:00`;
          }
        }
      } catch (error) {
        if (error.code !== '42P01') {
          logger.warn('Failed to query audit logs for real-time usage', {
            error: error.message,
            code: error.code,
            requestId: req.requestId,
          });
        }
      }

      // Active sessions (estimate based on unique user_ids in last hour)
      let activeSessions = 0;
      try {
        const sessionsRow = await queryOne(`
          SELECT COUNT(DISTINCT user_id) as count
          FROM public.audit_logs
          WHERE created_at > NOW() - INTERVAL '1 hour'
          AND user_id IS NOT NULL
        `, [], { requestId: req.requestId });
        activeSessions = parseInt(sessionsRow?.count || '0', 10);
      } catch (error) {
        if (error.code !== '42P01') {
          logger.warn('Failed to count sessions for real-time usage', {
            error: error.message,
            code: error.code,
            requestId: req.requestId,
          });
        }
      }

      // Recent activity (last 10 actions)
      let recentActivity = [];
      try {
        const activityRows = await queryMany(`
          SELECT 
            id,
            table_name as resource_type,
            action as action_type,
            created_at as timestamp,
            user_id
          FROM public.audit_logs
          WHERE user_id IS NOT NULL
          ORDER BY created_at DESC
          LIMIT 10
        `, [], { requestId: req.requestId });
        recentActivity = activityRows.map(row => ({
          id: row.id,
          action_type: row.action_type,
          resource_type: row.resource_type,
          timestamp: row.timestamp,
          user_count: 1, // Each row represents one user action
        }));
      } catch (error) {
        if (error.code !== '42P01') {
          logger.warn('Failed to fetch recent activity for real-time usage', {
            error: error.message,
            code: error.code,
            requestId: req.requestId,
          });
        }
      }

      // Average response time (synthetic for now, can be enhanced with actual metrics)
      const avgResponseTime = 75 + Math.random() * 25; // 75-100ms range

      return send(res, success(
        {
          metrics: {
            activeUsers,
            activeSessions,
            recentActions,
            peakHour,
            totalActionsToday,
            avgResponseTime,
          },
          recentActivity,
        },
        'Real-time usage data loaded successfully',
        { requestId: req.requestId }
      ));
    } catch (error) {
      logger.error('Error fetching real-time usage', {
        error: error.message,
        code: error.code,
        stack: error.stack,
        requestId: req.requestId,
      });
      
      // Set CORS headers even on error
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
      }
      
      return send(res, databaseError(error, 'Load real-time usage data'));
    }
  })
);

/**
 * POST /api/system/agencies/repair-database-names
 * Discover and update database_name for all agencies that don't have it set
 * Requires super_admin role
 */
router.post(
  '/agencies/repair-database-names',
  authenticate,
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    const { discoverAndUpdateAgencyDatabase } = require('../services/agencyDatabaseDiscovery');

    try {
      // Get all agencies without database_name
      const agencies = await queryMany(
        'SELECT id, name, domain FROM public.agencies WHERE database_name IS NULL OR database_name = \'\'',
        [],
        { requestId: req.requestId }
      );
      logger.info('Found agencies without database_name', {
        count: agencies.length,
        requestId: req.requestId,
      });

      const results = [];
      for (const agency of agencies) {
        try {
          const discoveredDb = await discoverAndUpdateAgencyDatabase(agency.id);
          results.push({
            agencyId: agency.id,
            agencyName: agency.name,
            success: !!discoveredDb,
            databaseName: discoveredDb || null,
          });
        } catch (error) {
          logger.error('Error processing agency during database name repair', {
            error: error.message,
            code: error.code,
            agencyId: agency.id,
            agencyName: agency.name,
            requestId: req.requestId,
          });
          results.push({
            agencyId: agency.id,
            agencyName: agency.name,
            success: false,
            error: error.message,
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      return send(res, success(
        {
          total: agencies.length,
          successful: successCount,
          failed: failCount,
          results,
        },
        `Repaired ${successCount} of ${agencies.length} agencies`,
        { requestId: req.requestId }
      ));
    } catch (error) {
      logger.error('Error repairing database names', {
        error: error.message,
        code: error.code,
        stack: error.stack,
        requestId: req.requestId,
      });
      return send(res, databaseError(error, 'Repair database names'));
    }
  })
);

/**
 * GET /api/system/settings
 * Get system settings (super admin only). Secrets are masked.
 */
router.get(
  '/settings',
  authenticate,
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    try {
      const settings = await systemSettingsService.getSettings({ maskSecrets: true });
      if (!settings) {
        return send(res, notFound('System settings', 'default'));
      }
      return send(res, success(
        { settings },
        'System settings fetched successfully',
        { requestId: req.requestId }
      ));
    } catch (error) {
      logger.error('Error fetching system settings', {
        error: error.message,
        code: error.code,
        requestId: req.requestId,
      });
      return send(res, databaseError(error, 'Fetch system settings'));
    }
  })
);

/**
 * PUT /api/system/settings
 * Update system settings (super admin only). Validates and masks secrets in response.
 */
router.put(
  '/settings',
  authenticate,
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const updates = req.body || {};

    if (!updates || Object.keys(updates).length === 0) {
      return send(res, validationError(
        'No fields to update',
        { providedFields: Object.keys(updates) }
      ));
    }

    try {
      const settings = await systemSettingsService.updateSettings(updates, userId);
      return send(res, success(
        { settings },
        'Settings updated successfully',
        { requestId: req.requestId }
      ));
    } catch (error) {
      if (error.code === 'VALIDATION_ERROR') {
        return send(res, validationError(
          error.message,
          error.details || {}
        ));
      }
      logger.error('Error updating system settings', {
        userId,
        error: error.message,
        code: error.code,
        requestId: req.requestId,
      });
      return send(res, databaseError(error, 'Update system settings'));
    }
  })
);

/**
 * GET /api/system/branding
 * Get public branding assets (logos, favicon). No auth required.
 */
router.get(
  '/branding',
  asyncHandler(async (req, res) => {
    try {
      const settings = await getSystemSettings();
      const branding = {
        logo_url: settings?.logo_url || null,
        favicon_url: settings?.favicon_url || null,
        logo_light_url: settings?.logo_light_url || null,
        logo_dark_url: settings?.logo_dark_url || null,
        login_logo_url: settings?.login_logo_url || null,
        email_logo_url: settings?.email_logo_url || null,
      };
      return send(res, success(
        { branding },
        'Branding fetched successfully',
        { requestId: req.requestId }
      ));
    } catch (error) {
      logger.warn('Error fetching branding, using defaults', {
        error: error.message,
        requestId: req.requestId,
      });
      return send(res, success(
        {
          branding: {
            logo_url: null,
            favicon_url: null,
            logo_light_url: null,
            logo_dark_url: null,
            login_logo_url: null,
            email_logo_url: null,
          },
        },
        'Branding fetched (defaults)',
        { requestId: req.requestId }
      ));
    }
  })
);

/**
 * GET /api/system/maintenance-status
 * Get maintenance mode status (public endpoint, no auth required). Uses shared settings cache.
 */
router.get(
  '/maintenance-status',
  asyncHandler(async (req, res) => {
    try {
      const settings = await getSystemSettings();
      const maintenanceMode = settings?.maintenance_mode || false;
      const maintenanceMessage = settings?.maintenance_message || null;
      return send(res, success(
        {
          maintenance_mode: maintenanceMode,
          maintenance_message: maintenanceMessage,
        },
        'Maintenance status fetched successfully',
        { requestId: req.requestId }
      ));
    } catch (error) {
      logger.warn('Error fetching maintenance status, failing open', {
        error: error.message,
        code: error.code,
        requestId: req.requestId,
      });
      return send(res, success(
        {
          maintenance_mode: false,
          maintenance_message: null,
        },
        'Maintenance status fetched successfully (default)',
        { requestId: req.requestId }
      ));
    }
  })
);

module.exports = router;



