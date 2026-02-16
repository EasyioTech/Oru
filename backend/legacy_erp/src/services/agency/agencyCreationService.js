/**
 * Agency Creation Service
 * 
 * Handles the core agency creation logic including:
 * - Creating isolated database
 * - Creating schema
 * - Creating admin user and profile
 * - Registering agency in main database
 * 
 * This is the main service for the agency onboarding flow.
 */

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const { pool } = require('../../config/database');
const { createAgencySchema } = require('../../infrastructure/database/schemaCreator');
const { parseDatabaseUrl, getAgencyPool } = require('../../infrastructure/database/poolManager');
const { validateDatabaseName, quoteIdentifier, validateUUID, setSessionVariable } = require('../../utils/securityUtils');
const { checkDomainAvailability, generateDatabaseName, extractSubdomain } = require('./agencyDomainService');
const logger = require('../../utils/logger');

/**
 * Plan limits for subscription tiers
 */
const PLAN_LIMITS = {
  starter: 5,
  professional: 25,
  enterprise: 1000,
};

/**
 * Create a new agency with isolated database
 * @param {Object} agencyData - Agency creation data
 * @returns {Promise<Object>} Created agency information
 */
async function createAgency(agencyData) {
  const {
    agencyName,
    domain,
    adminName,
    adminEmail,
    adminPassword,
    subscriptionPlan,
    phone,
    industry,
    companySize,
  } = agencyData;

  // Validate required fields
  if (!agencyName || !domain || !adminName || !adminEmail || !adminPassword || !subscriptionPlan) {
    throw new Error('Missing required fields: agencyName, domain, adminName, adminEmail, adminPassword, subscriptionPlan');
  }

  // Generate UUIDs
  const agencyId = crypto.randomUUID();
  const adminUserId = crypto.randomUUID();
  const profileId = crypto.randomUUID();
  const userRoleId = crypto.randomUUID();

  // Hash password
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  // Get max users from plan
  const maxUsers = PLAN_LIMITS[subscriptionPlan] || 25;

  // Generate database name
  const { host, port, user, password } = parseDatabaseUrl();
  const dbName = generateDatabaseName(domain, agencyId);

  const mainClient = await pool.connect();
  let postgresClient = null;
  let postgresPool = null;
  let agencyDbClient = null;
  let agencyPool = null;

  try {
    // Check domain availability before proceeding
    const domainCheck = await checkDomainAvailability(domain);
    if (!domainCheck.available) {
      // Check if agency already exists (idempotent handling)
      const subdomain = extractSubdomain(domain);
      const existingAgency = await mainClient.query(
        `SELECT id, name, domain, database_name, owner_user_id, subscription_plan
         FROM public.agencies
         WHERE domain = $1 OR domain = $2 OR domain LIKE $3
         ORDER BY created_at ASC LIMIT 1`,
        [domain, subdomain, `${subdomain}.%`]
      );

      if (existingAgency.rows.length > 0) {
        const existing = existingAgency.rows[0];
        logger.info('[AgencyCreation] Domain exists, returning existing agency (idempotent)', { domain });
        return {
          agency: {
            id: existing.id,
            name: existing.name,
            domain: existing.domain,
            databaseName: existing.database_name,
            subscriptionPlan: existing.subscription_plan,
          },
          admin: {
            id: existing.owner_user_id,
            email: adminEmail,
            name: adminName,
          },
          reusedExisting: true,
        };
      }

      throw new Error(domainCheck.error || `Domain "${domain}" is already taken`);
    }

    // Create the agency database
    logger.info('[AgencyCreation] Creating database', { dbName });
    postgresPool = new Pool({ host, port, user, password, database: 'postgres' });
    postgresClient = await postgresPool.connect();

    const validatedDbName = validateDatabaseName(dbName);
    const quotedDbName = quoteIdentifier(validatedDbName);

    // Drop if exists (for recovery from failed creations)
    const dbExistsCheck = await postgresClient.query(
      `SELECT EXISTS(SELECT FROM pg_database WHERE datname = $1)`,
      [validatedDbName]
    );

    if (dbExistsCheck.rows[0].exists) {
      console.log(`[AgencyCreation] Database ${validatedDbName} exists, dropping...`);
      await postgresClient.query(`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = $1 AND pid <> pg_backend_pid()
      `, [validatedDbName]);
      await postgresClient.query(`DROP DATABASE IF EXISTS ${quotedDbName}`);
    }

    // Create the database
    await postgresClient.query(`CREATE DATABASE ${quotedDbName}`);
    logger.info('[AgencyCreation] Database created', { dbName });

    // Release postgres connection
    postgresClient.release();
    await postgresPool.end();

    // Connect to the new agency database
    agencyPool = getAgencyPool(validatedDbName);
    agencyDbClient = await agencyPool.connect();

    // Verify connection
    const dbCheck = await agencyDbClient.query('SELECT current_database()');
    if (dbCheck.rows[0].current_database !== dbName) {
      throw new Error(`Database isolation error: expected ${dbName}, got ${dbCheck.rows[0].current_database}`);
    }

    // Create schema (skip auto-sync in provisioning path to avoid runtime DDL)
    logger.info('[AgencyCreation] Creating schema', { dbName });
    await createAgencySchema(agencyDbClient, { skipAutoSync: true });

    // Initialize agency settings
    await initializeAgencySettings(agencyDbClient, {
      agencyName,
      domain,
      industry,
      companySize,
    });

    // Create admin user in agency database
    await createAdminUser(agencyDbClient, {
      userId: adminUserId,
      profileId,
      userRoleId,
      agencyId,
      adminName,
      adminEmail,
      passwordHash,
      phone,
    });

    // Register agency in main database
    await registerAgencyInMainDb(mainClient, {
      agencyId,
      agencyName,
      domain,
      dbName,
      adminUserId,
      subscriptionPlan,
      maxUsers,
    });

    // Assign default pages
    await assignDefaultPages(mainClient, agencyId);

    logger.info('[AgencyCreation] Agency created', { agencyName, domain });

    return {
      agency: {
        id: agencyId,
        name: agencyName,
        domain,
        databaseName: dbName,
        subscriptionPlan,
      },
      admin: {
        id: adminUserId,
        email: adminEmail,
        name: adminName,
      },
    };
  } catch (error) {
    logger.error('[AgencyCreation] Failed', { error: error.message });
    // Cleanup: remove agency from main DB if already registered, then drop agency DB
    await cleanupFailedCreation(dbName, { host, port, user, password }, agencyDbClient, agencyPool, mainClient, agencyId);
    throw error;
  } finally {
    // Release connections
    if (agencyDbClient) try { agencyDbClient.release(); } catch {}
    if (postgresClient) try { postgresClient.release(); } catch {}
    if (postgresPool) try { await postgresPool.end(); } catch {}
    if (mainClient) try { mainClient.release(); } catch {}
  }
}

/**
 * Initialize agency settings in the agency database
 */
async function initializeAgencySettings(client, data) {
  const { agencyName, domain, industry, companySize } = data;

  // Check if row exists
  const existing = await client.query('SELECT id FROM public.agency_settings LIMIT 1');
  
  if (existing.rows.length > 0) {
    await client.query(
      `UPDATE public.agency_settings SET
        agency_name = COALESCE($1, agency_name),
        domain = COALESCE($2, domain),
        industry = COALESCE($3, industry),
        company_size = COALESCE($4, company_size),
        updated_at = NOW()
      WHERE id = $5`,
      [agencyName, domain, industry, companySize, existing.rows[0].id]
    );
  } else {
    await client.query(
      `INSERT INTO public.agency_settings (agency_name, domain, industry, company_size, setup_complete)
       VALUES ($1, $2, $3, $4, false)`,
      [agencyName || 'My Agency', domain, industry, companySize]
    );
  }

  logger.info('[AgencyCreation] Agency settings initialized');
}

/**
 * Create admin user in agency database
 */
async function createAdminUser(client, data) {
  const { userId, profileId, userRoleId, agencyId, adminName, adminEmail, passwordHash, phone } = data;

  validateUUID(userId);

  await client.query('BEGIN');
  try {
    await setSessionVariable(client, 'app.current_user_id', userId);

    // Create user
    await client.query(
      `INSERT INTO public.users (id, email, password_hash, email_confirmed, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, true, true, NOW(), NOW())`,
      [userId, adminEmail, passwordHash]
    );

    // Create profile
    await client.query(
      `INSERT INTO public.profiles (id, user_id, full_name, phone, agency_id, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         full_name = EXCLUDED.full_name,
         phone = EXCLUDED.phone,
         agency_id = COALESCE(EXCLUDED.agency_id, public.profiles.agency_id),
         updated_at = NOW()`,
      [profileId, userId, adminName, phone || null, agencyId]
    );

    // Create employee_details
    const nameParts = String(adminName).trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || firstName;

    await client.query(
      `INSERT INTO public.employee_details (id, user_id, employee_id, agency_id, first_name, last_name, employment_type, is_active)
       VALUES (gen_random_uuid(), $1, 'EMP-0001', $2, $3, $4, 'full_time', true)
       ON CONFLICT DO NOTHING`,
      [userId, agencyId, firstName, lastName]
    );

    // Assign admin role
    await client.query(
      `INSERT INTO public.user_roles (id, user_id, role, agency_id, assigned_at)
       VALUES ($1, $2, 'admin', $3, NOW())
       ON CONFLICT (user_id, role, agency_id) DO NOTHING`,
      [userRoleId, userId, agencyId]
    );

    await client.query('COMMIT');
    logger.info('[AgencyCreation] Admin user created', { adminEmail });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

/**
 * Register agency in main database
 */
async function registerAgencyInMainDb(client, data) {
  const { agencyId, agencyName, domain, dbName, adminUserId, subscriptionPlan, maxUsers } = data;

  await client.query('BEGIN');
  try {
    // Ensure columns exist
    await client.query(`ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS database_name TEXT UNIQUE`);
    await client.query(`ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS owner_user_id UUID`);

    // Insert agency
    await client.query(
      `INSERT INTO public.agencies (id, name, domain, database_name, owner_user_id, is_active, subscription_plan, max_users)
       VALUES ($1, $2, $3, $4, $5, true, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         database_name = EXCLUDED.database_name,
         owner_user_id = COALESCE(public.agencies.owner_user_id, EXCLUDED.owner_user_id)`,
      [agencyId, agencyName, domain, dbName, adminUserId, subscriptionPlan, maxUsers]
    );

    await client.query('COMMIT');
    logger.info('[AgencyCreation] Agency registered in main database');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

/**
 * Assign default pages to agency
 */
async function assignDefaultPages(client, agencyId) {
  try {
    // Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'agency_page_assignments'
      )
    `);

    if (!tableCheck.rows[0].exists) {
      logger.warn('[AgencyCreation] agency_page_assignments table not found');
      return;
    }

    // Get all active pages
    const pages = await client.query(
      `SELECT id FROM public.page_catalog WHERE is_active = true`
    );

    // Assign all pages
    for (const page of pages.rows) {
      await client.query(
        `INSERT INTO public.agency_page_assignments (agency_id, page_id, assigned_by, status)
         VALUES ($1, $2, NULL, 'active')
         ON CONFLICT (agency_id, page_id) DO UPDATE SET status = 'active', updated_at = now()`,
        [agencyId, page.id]
      );
    }

    logger.info('[AgencyCreation] Assigned pages to agency', { count: pages.rows.length });
  } catch (error) {
    logger.warn('[AgencyCreation] Page assignment failed (non-fatal)', { error: error.message });
  }
}

/**
 * Cleanup failed agency creation: remove agency row from main DB if already registered, then drop agency DB.
 * @param {string} dbName - Agency database name
 * @param {Object} dbConfig - { host, port, user, password }
 * @param {Object} [agencyDbClient] - Agency DB client to release
 * @param {Object} [agencyPool] - Agency pool to end
 * @param {Object} [mainClient] - Main DB client; if provided with agencyId, removes agency row to avoid orphan
 * @param {string} [agencyId] - Agency UUID; if provided with mainClient, delete from agencies where id = agencyId
 */
async function cleanupFailedCreation(dbName, dbConfig, agencyDbClient, agencyPool, mainClient, agencyId) {
  if (!dbName) return;

  try {
    if (agencyDbClient) try { agencyDbClient.release(); } catch {}
    if (agencyPool) try { await agencyPool.end(); } catch {}

    if (mainClient && agencyId) {
      try {
        await mainClient.query('DELETE FROM public.agencies WHERE id = $1', [agencyId]);
      } catch (e) {
        // Log but continue to drop DB
      }
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    const cleanupPool = new Pool({ ...dbConfig, database: 'postgres' });
    const cleanupClient = await cleanupPool.connect();

    await cleanupClient.query(`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = $1 AND pid <> pg_backend_pid()
    `, [dbName]);

    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      const validatedDbName = validateDatabaseName(dbName);
      const quotedDbName = quoteIdentifier(validatedDbName);
      await cleanupClient.query(`DROP DATABASE IF EXISTS ${quotedDbName}`);
    } catch (dropErr) {
      // dbName invalid or drop failed
    }

    logger.info('[AgencyCreation] Cleaned up database', { dbName });
    cleanupClient.release();
    await cleanupPool.end();
  } catch (cleanupError) {
    logger.error('[AgencyCreation] Cleanup failed', { error: cleanupError.message });
  }
}

module.exports = {
  createAgency,
  PLAN_LIMITS,
};
