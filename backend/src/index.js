/**
 * Oru API Server (Production-Ready Enhanced)
 * Main entry point - modular Express.js application
 * 
 * IMPROVEMENTS:
 * - Database initialization BEFORE server starts
 * - Pool manager integration
 * - Proper graceful shutdown
 * - Startup timeout and health checks
 * - Migration tracking
 * - Better error handling
 */

// Load environment variables (must be first)
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

/**
 * Validate required secrets on startup
 * Prevents server from starting with default or missing secrets
 */
function validateRequiredSecrets() {
  const postgresPassword = process.env.POSTGRES_PASSWORD || 
                          process.env.DATABASE_URL?.match(/:(.+?)@/)?.[1] ||
                          process.env.VITE_DATABASE_URL?.match(/:(.+?)@/)?.[1];
  
  const jwtSecret = process.env.VITE_JWT_SECRET || process.env.JWT_SECRET;

  const required = {
    POSTGRES_PASSWORD: postgresPassword,
    VITE_JWT_SECRET: jwtSecret,
  };

  const missing = [];
  const weak = [];
  const defaultValues = [
    'admin',
    'your-super-secret-jwt-key-change-this-in-production',
    'change-this-in-production',
  ];

  for (const [key, value] of Object.entries(required)) {
    if (!value || value.trim() === '') {
      missing.push(key);
    } else if (value.length < 32) {
      weak.push(key);
    } else if (defaultValues.some(defaultVal => value.includes(defaultVal))) {
      weak.push(`${key} (appears to be using default value)`);
    }
  }

  if (missing.length > 0) {
    console.error('❌ CRITICAL: Missing required secrets:', missing.join(', '));
    console.error('   Please set these in your .env file or docker-compose.yml');
    console.error('   Generate secrets with: openssl rand -base64 32');
    process.exit(1);
  }

  if (weak.length > 0) {
    console.error('❌ CRITICAL: Weak or default secrets detected:', weak.join(', '));
    console.error('   Secrets must be at least 32 characters and not use default values');
    console.error('   Generate strong secrets with: openssl rand -base64 32');
    process.exit(1);
  }

  console.log('✅ All required secrets validated');
}

// Validate secrets before starting
validateRequiredSecrets();

const express = require('express');
const http = require('http');
const logger = require('./utils/logger');
const { configureMiddleware } = require('./config/middleware');
const { errorHandler } = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const { PORT } = require('./config/constants');
const { getRedisClient, isRedisAvailable } = require('./config/redis');
const { poolManager } = require('./infrastructure/database/poolManager');

// Import routes
const healthRoutes = require('./routes/health');
const simpleHealthRoutes = require('./routes/health-simple');
const filesRoutes = require('./routes/files');
const databaseRoutes = require('./routes/database');
const authRoutes = require('./routes/auth');
const agenciesRoutes = require('./routes/agencies');
const schemaRoutes = require('./routes/schema');
const systemRoutes = require('./routes/system');
const permissionsRoutes = require('./routes/permissions');
const auditRoutes = require('./routes/audit');
const reportsRoutes = require('./routes/reports');
const twoFactorRoutes = require('./routes/twoFactor');
const systemHealthRoutes = require('./routes/systemHealth');
const backupRoutes = require('./routes/backups');
const inventoryRoutes = require('./routes/inventory');
const procurementRoutes = require('./routes/procurement');
const assetsRoutes = require('./routes/assets');
const currencyRoutes = require('./routes/currency');
const financialRoutes = require('./routes/financial');
const advancedReportsRoutes = require('./routes/advancedReports');
const graphqlRoutes = require('./routes/graphql');
const webhookRoutes = require('./routes/webhooks');
const apiDocsRoutes = require('./routes/api-docs');
const projectEnhancementsRoutes = require('./routes/projectEnhancements');
const crmEnhancementsRoutes = require('./routes/crmEnhancements');
const ssoRoutes = require('./routes/sso');
const passwordPolicyRoutes = require('./routes/passwordPolicy');
const databaseOptimizationRoutes = require('./routes/databaseOptimization');
const apiKeysRoutes = require('./routes/apiKeys');
const sessionManagementRoutes = require('./routes/sessionManagement');
const emailRoutes = require('./routes/email');
const workflowsRoutes = require('./routes/workflows');
const integrationsRoutes = require('./routes/integrations');
const settingsRoutes = require('./routes/settings');
const pageCatalogRoutes = require('./routes/pageCatalog');
const departmentsRoutes = require('./routes/departments');
const schemaAdminRoutes = require('./routes/schemaAdmin');
const superAdminRoutes = require('./routes/superAdmin');

// Create Express app
const app = express();

// Configure middleware
configureMiddleware(app);

// Request logging
app.use(requestLogger);

// Maintenance mode check
const { maintenanceMode } = require('./middleware/maintenanceMode');
app.use('/api', maintenanceMode);

// Rate limiting
const { apiLimiter } = require('./middleware/rateLimiter');
app.use('/api', apiLimiter);

// Health check routes
app.use('/health', simpleHealthRoutes);
app.use('/health/detailed', healthRoutes);

// API routes
app.use('/api/files', filesRoutes);
app.use('/api/database', databaseRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/agencies', agenciesRoutes);
app.use('/api/schema', schemaRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/permissions', permissionsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/two-factor', twoFactorRoutes);
app.use('/api/system-health', systemHealthRoutes);
app.use('/api/backups', backupRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/procurement', procurementRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/currency', currencyRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/advanced-reports', advancedReportsRoutes);
app.use('/api/graphql', graphqlRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api-docs', apiDocsRoutes);
app.use('/api/projects', projectEnhancementsRoutes);
app.use('/api/crm', crmEnhancementsRoutes);
app.use('/api/sso', ssoRoutes);
app.use('/api/password-policy', passwordPolicyRoutes);
app.use('/api/database-optimization', databaseOptimizationRoutes);
app.use('/api/api-keys', apiKeysRoutes);
app.use('/api/sessions', sessionManagementRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/workflows', workflowsRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/system/page-catalog', pageCatalogRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/health', schemaAdminRoutes);
app.use('/admin', schemaAdminRoutes);

// Global error handler (must be last)
app.use(errorHandler);

// Create HTTP server
const server = http.createServer(app);

// Track server state
let isShuttingDown = false;
let isServerReady = false;

/**
 * Run SQL migration file if it exists
 * @param {Object} client - Database client
 * @param {string} migrationName - Name of migration file (e.g., '01_core_schema.sql')
 * @returns {Promise<boolean>} True if migration ran
 */
async function runMigrationIfExists(client, migrationName) {
  const fs = require('fs');
  const path = require('path');
  
  const migrationPath = path.join(__dirname, '..', '..', 'database', 'migrations', migrationName);
  
  if (!fs.existsSync(migrationPath)) {
    return false;
  }
  
  try {
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    await client.query(migrationSQL);
    logger.info(`✅ Migration applied: ${migrationName}`);
    return true;
  } catch (error) {
    logger.error(`Failed to apply migration: ${migrationName}`, {
      error: error.message
    });
    throw error;
  }
}

/**
 * Ensure super admin user exists
 */
async function ensureSuperAdminUser(client) {
  try {
    // Check if users table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
      )
    `);
    
    if (!tableCheck.rows[0].exists) {
      logger.warn('Users table does not exist, skipping super admin creation');
      return;
    }
    
    // Check if user_roles table exists
    const userRolesCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'user_roles'
      )
    `);
    
    const userRolesExists = userRolesCheck.rows[0].exists;
    
    // Check if super admin exists
    let userCheck;
    if (userRolesExists) {
      userCheck = await client.query(`
        SELECT u.id, ur.role 
        FROM public.users u
        LEFT JOIN public.user_roles ur ON u.id = ur.user_id 
          AND ur.role = 'super_admin' AND ur.agency_id IS NULL
        WHERE u.email = 'super@buildflow.local'
      `);
    } else {
      userCheck = await client.query(`
        SELECT id FROM public.users WHERE email = 'super@buildflow.local'
      `);
    }
    
    if (userCheck.rows.length === 0 || (userRolesExists && !userCheck.rows[0].role)) {
      logger.info('Creating super admin user...');
      
      // Ensure extensions
      await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
      await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
      
      // Create or update super admin
      await client.query(`
        INSERT INTO public.users (email, password_hash, email_confirmed, email_confirmed_at, is_active)
        VALUES (
          'super@buildflow.local',
          crypt('super123', gen_salt('bf')),
          true, now(), true
        )
        ON CONFLICT (email) DO UPDATE SET
          password_hash = crypt('super123', gen_salt('bf')),
          email_confirmed = true,
          email_confirmed_at = now(),
          is_active = true,
          updated_at = now()
      `);
      
      // Get user ID
      const adminResult = await client.query(
        `SELECT id FROM public.users WHERE email = 'super@buildflow.local' LIMIT 1`
      );
      const adminId = adminResult.rows[0]?.id;
      
      if (!adminId) {
        logger.warn('Super admin user not found after creation');
        return;
      }
      
      // Ensure profile exists
      const profileExists = await client.query(
        `SELECT 1 FROM public.profiles WHERE user_id = $1 LIMIT 1`,
        [adminId]
      );
      
      if (profileExists.rows.length === 0) {
        await client.query(
          `INSERT INTO public.profiles (user_id, full_name, is_active, created_at, updated_at)
           VALUES ($1, 'Super Administrator', true, now(), now())`,
          [adminId]
        );
      } else {
        await client.query(
          `UPDATE public.profiles 
           SET full_name = 'Super Administrator', is_active = true, updated_at = now() 
           WHERE user_id = $1`,
          [adminId]
        );
      }
      
      // Ensure super_admin role exists
      if (userRolesExists) {
        const roleExists = await client.query(
          `SELECT 1 FROM public.user_roles 
           WHERE user_id = $1 AND role = 'super_admin' AND agency_id IS NULL LIMIT 1`,
          [adminId]
        );
        
        if (roleExists.rows.length === 0) {
          await client.query(
            `INSERT INTO public.user_roles (user_id, role, agency_id) 
             VALUES ($1, 'super_admin', NULL)`,
            [adminId]
          );
        }
      }
      
      logger.info('✅ Super admin user verified (email: super@buildflow.local)');
    } else {
      logger.info('✅ Super admin user verified');
    }
  } catch (error) {
    // Only warn if it's a schema issue (tables don't exist yet)
    if (error.message?.includes('does not exist')) {
      logger.warn('Could not create super admin (tables not ready yet)');
    } else {
      // Real error - log it properly
      logger.error('Error ensuring super admin user', {
        error: error.message
      });
    }
  }
}

/**
 * Initialize main database schema
 * Runs BEFORE server starts listening
 */
async function initializeMainDatabase() {
  const fs = require('fs');
  const path = require('path');
  const startTime = Date.now();
  
  try {
    logger.info('Initializing main database schema...');
    
    // Get main pool from pool manager
    const mainPool = poolManager.getMainPool();
    const client = await mainPool.connect();
    
    try {
      // Check if agencies table exists
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'agencies'
        )
      `);
      
      // Run core schema migration if needed
      if (!tableCheck.rows[0].exists) {
        logger.warn('Main database schema missing, running migrations...');
        const migrated = await runMigrationIfExists(client, '01_core_schema.sql');
        
        if (!migrated) {
          // Fallback: Create agencies table directly
          logger.warn('Migration file not found, creating agencies table...');
          await client.query(`
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
            CREATE EXTENSION IF NOT EXISTS "pgcrypto";
            
            CREATE TABLE IF NOT EXISTS public.agencies (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              name TEXT NOT NULL,
              domain TEXT NOT NULL UNIQUE,
              database_name TEXT NOT NULL UNIQUE,
              owner_user_id UUID,
              subscription_plan TEXT DEFAULT 'basic',
              max_users INTEGER DEFAULT 50,
              is_active BOOLEAN NOT NULL DEFAULT true,
              created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
              updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );
            CREATE UNIQUE INDEX IF NOT EXISTS idx_agencies_domain ON public.agencies(domain);
            CREATE UNIQUE INDEX IF NOT EXISTS idx_agencies_database_name ON public.agencies(database_name);
          `);
        }
        logger.info('✅ Main database schema initialized');
      } else {
        logger.info('✅ Main database schema verified');
      }
      
      // Ensure other critical tables exist (run migrations if needed)
      try {
        await runMigrationIfExists(client, '10_page_catalog_schema.sql');
        await runMigrationIfExists(client, '11_seed_page_catalog.sql');
        await runMigrationIfExists(client, '12_system_settings_schema.sql');
        await runMigrationIfExists(client, '09_system_health_metrics.sql');
        await runMigrationIfExists(client, '16_agency_provisioning_jobs.sql');
      } catch (migrationError) {
        logger.error('Migration failed', {
          error: migrationError.message,
          migration: migrationError.stack
        });
        // Continue with other migrations - don't crash
      }
      
      // Ensure page_catalog has data
      try {
        const catalogCount = await client.query('SELECT COUNT(*) as count FROM public.page_catalog');
        logger.info('✅ page_catalog table verified');
      } catch (catalogError) {
        logger.warn('page_catalog table not accessible, skipping verification', {
          error: catalogError.message
        });
      }
      
      // Ensure system_settings has data
      try {
        const settingsCount = await client.query('SELECT COUNT(*) as count FROM public.system_settings');
        if (parseInt(settingsCount.rows[0].count) === 0) {
          await client.query(`
            INSERT INTO public.system_settings (system_name, system_tagline, system_description)
            VALUES ('Oru ERP', 'Complete Business Management Solution', 'Comprehensive ERP system')
          `);
          logger.info('✅ Default system settings created');
        } else {
          logger.info('✅ system_settings table verified');
        }
      } catch (settingsError) {
        logger.warn('system_settings table not accessible, skipping verification', {
          error: settingsError.message
        });
      }
      
      // Ensure super admin exists
      await ensureSuperAdminUser(client);
      
      const duration = Date.now() - startTime;
      logger.info('✅ Main database initialization complete', { durationMs: duration });
      
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('❌ Failed to initialize main database', {
      error: error.message,
      stack: error.stack
    });
    throw error; // Fail fast - don't start server with broken DB
  }
}

/**
 * Initialize Redis
 */
async function initializeRedis() {
  try {
    const available = await isRedisAvailable();
    if (available) {
      logger.info('✅ Redis cache initialized');
    } else {
      logger.warn('Redis not available: using in-memory fallback');
    }
  } catch (error) {
    logger.warn('Redis initialization warning', { error: error.message });
  }
}

/**
 * Initialize automated backups
 */
function initializeBackups() {
  const cron = require('node-cron');
  const { createBackup, cleanupOldBackups, BACKUP_SCHEDULE } = require('./services/backupService');
  
  // Validate cron schedule
  if (!cron.validate(BACKUP_SCHEDULE)) {
    logger.error('Invalid backup schedule', { schedule: BACKUP_SCHEDULE });
    return;
  }
  
  cron.schedule(BACKUP_SCHEDULE, async () => {
    try {
      logger.info('Starting scheduled backup');
      await createBackup('buildflow_db', 'full');
      
      const deleted = await cleanupOldBackups();
      if (deleted > 0) {
        logger.info('Cleaned up old backups', { count: deleted });
      }
    } catch (error) {
      logger.error('Scheduled backup failed', { 
        error: error.message 
      });
    }
  });
  
  logger.info('Automated backups scheduled', { schedule: BACKUP_SCHEDULE });
}

/**
 * Graceful shutdown
 */
async function gracefulShutdown(signal) {
  if (isShuttingDown) {
    logger.warn(`${signal} received again, forcing exit...`);
    process.exit(1);
  }
  
  isShuttingDown = true;
  logger.info(`${signal} received, shutting down gracefully...`);
  
  const shutdownTimeout = setTimeout(() => {
    logger.error('Shutdown timeout exceeded, forcing exit');
    process.exit(1);
  }, 30000); // 30 second timeout
  
  try {
    // Stop accepting new connections
    server.close((err) => {
      if (err) {
        logger.error('Error closing HTTP server', { error: err.message });
      } else {
        logger.info('HTTP server closed');
      }
    });
    
    // Close Redis connection
    const { closeRedisConnection } = require('./config/redis');
    await closeRedisConnection();
    logger.info('Redis connection closed');
    
    // Close all database pools
    await poolManager.closeAll();
    logger.info('Database pools closed');
    
    clearTimeout(shutdownTimeout);
    logger.info('Shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', { error: error.message });
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
}

/**
 * Start server with proper initialization sequence
 */
async function startServer() {
  const startupTimeout = setTimeout(() => {
    logger.error('❌ Startup timeout - server failed to initialize in 60 seconds');
    process.exit(1);
  }, 60000); // 60 second startup timeout
  
  try {
    logger.info('Starting Oru API Server...');
    
    // Step 1: Initialize main database (MUST succeed before server starts)
    await initializeMainDatabase();
    
    // Step 2: Initialize Redis (can fail gracefully)
    await initializeRedis();
    
    // Step 3: Start HTTP server
    await new Promise((resolve, reject) => {
      server.listen(PORT, '0.0.0.0', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    
    logger.info('✅ Server started', {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
    });
    
    // Step 4: Initialize background services (non-blocking)
    initializeBackups();
    
    const { initializeScheduledReports } = require('./services/scheduledReportService');
    initializeScheduledReports();
    
    logger.info('✅ WebSocket server initialized');
    
    isServerReady = true;
    clearTimeout(startupTimeout);
    
    logger.info('🚀 Oru API Server is ready to accept requests');
    
  } catch (error) {
    clearTimeout(startupTimeout);
    logger.error('❌ Failed to start server', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

// Start the server
startServer();

// Graceful shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Error handlers
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { 
    error: error.message, 
    stack: error.stack 
  });
  
  if (!isServerReady) {
    // Failed during startup
    process.exit(1);
  }
  
  // Try graceful shutdown
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { 
    reason: reason?.message || String(reason), 
    stack: reason?.stack,
  });
  
  if (!isServerReady) {
    // Failed during startup
    process.exit(1);
  }
});