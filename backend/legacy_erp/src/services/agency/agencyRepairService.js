/**
 * Agency Repair Service
 * 
 * Handles database repair and maintenance for agency databases.
 * Used to fix missing tables/columns in existing agency databases.
 * 
 * Responsibilities:
 * - Repair agency database schema
 * - Add missing tables and columns
 * - Verify database integrity
 */

const { Pool } = require('pg');
const { parseDatabaseUrl, getAgencyPool } = require('../../infrastructure/database/poolManager');
const { createAgencySchema } = require('../../infrastructure/database/schemaCreator');

/**
 * Repair agency database by running schema creation
 * @param {string} agencyDatabase - Agency database name
 * @returns {Promise<Object>} Repair results
 */
async function repairAgencyDatabase(agencyDatabase) {
  if (!agencyDatabase) {
    throw new Error('Agency database name is required');
  }

  const agencyPool = getAgencyPool(agencyDatabase);
  const client = await agencyPool.connect();

  try {
    // Count tables before repair
    const beforeTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    const beforeCount = beforeTables.rows.length;

    console.log(`[RepairService] Starting repair for: ${agencyDatabase} (${beforeCount} tables)`);

    // Run schema creation (idempotent - only adds missing items)
    await createAgencySchema(client);

    // Count tables after repair
    const afterTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    const afterCount = afterTables.rows.length;
    const addedCount = afterCount - beforeCount;

    console.log(`[RepairService] ✅ Repair complete: ${afterCount} tables (added ${addedCount})`);

    return {
      database: agencyDatabase,
      tablesBefore: beforeCount,
      tablesAfter: afterCount,
      tablesAdded: addedCount,
      allTables: afterTables.rows.map(r => r.table_name),
    };
  } finally {
    client.release();
  }
}

/**
 * Verify agency database integrity
 * @param {string} agencyDatabase - Agency database name
 * @returns {Promise<Object>} Verification results
 */
async function verifyDatabaseIntegrity(agencyDatabase) {
  if (!agencyDatabase) {
    throw new Error('Agency database name is required');
  }

  const agencyPool = getAgencyPool(agencyDatabase);
  const client = await agencyPool.connect();

  try {
    const issues = [];
    
    // Check critical tables exist
    const criticalTables = [
      'users', 'profiles', 'user_roles', 'agency_settings',
      'departments', 'attendance', 'employee_details'
    ];

    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = ANY($1)
    `, [criticalTables]);

    const existingTables = tablesResult.rows.map(r => r.table_name);
    const missingTables = criticalTables.filter(t => !existingTables.includes(t));

    if (missingTables.length > 0) {
      issues.push({
        type: 'missing_tables',
        severity: 'critical',
        details: missingTables,
      });
    }

    // Check agency_settings has at least one row
    const settingsCheck = await client.query(
      `SELECT COUNT(*) as count FROM public.agency_settings`
    );
    if (parseInt(settingsCheck.rows[0].count) === 0) {
      issues.push({
        type: 'missing_agency_settings',
        severity: 'critical',
        details: 'No agency_settings row found',
      });
    }

    // Check for orphaned users (users without profiles)
    const orphanedUsers = await client.query(`
      SELECT u.id, u.email 
      FROM public.users u 
      LEFT JOIN public.profiles p ON u.id = p.user_id 
      WHERE p.id IS NULL
    `);
    if (orphanedUsers.rows.length > 0) {
      issues.push({
        type: 'orphaned_users',
        severity: 'warning',
        details: orphanedUsers.rows.map(r => r.email),
      });
    }

    // Check for duplicate user emails
    const duplicateEmails = await client.query(`
      SELECT email, COUNT(*) as count 
      FROM public.users 
      GROUP BY email 
      HAVING COUNT(*) > 1
    `);
    if (duplicateEmails.rows.length > 0) {
      issues.push({
        type: 'duplicate_emails',
        severity: 'critical',
        details: duplicateEmails.rows.map(r => r.email),
      });
    }

    return {
      database: agencyDatabase,
      isHealthy: issues.filter(i => i.severity === 'critical').length === 0,
      criticalIssues: issues.filter(i => i.severity === 'critical').length,
      warnings: issues.filter(i => i.severity === 'warning').length,
      issues,
    };
  } finally {
    client.release();
  }
}

/**
 * Fix common database issues
 * @param {string} agencyDatabase - Agency database name
 * @returns {Promise<Object>} Fix results
 */
async function fixCommonIssues(agencyDatabase) {
  if (!agencyDatabase) {
    throw new Error('Agency database name is required');
  }

  const agencyPool = getAgencyPool(agencyDatabase);
  const client = await agencyPool.connect();
  const fixes = [];

  try {
    await client.query('BEGIN');

    // Fix orphaned users by creating profiles
    const orphanedUsers = await client.query(`
      SELECT u.id, u.email 
      FROM public.users u 
      LEFT JOIN public.profiles p ON u.id = p.user_id 
      WHERE p.id IS NULL
    `);

    for (const user of orphanedUsers.rows) {
      await client.query(
        `INSERT INTO public.profiles (id, user_id, full_name, is_active)
         VALUES (gen_random_uuid(), $1, $2, true)`,
        [user.id, user.email.split('@')[0]]
      );
      fixes.push(`Created profile for orphaned user: ${user.email}`);
    }

    // Ensure agency_settings has at least one row
    const settingsCheck = await client.query(
      `SELECT COUNT(*) as count FROM public.agency_settings`
    );
    if (parseInt(settingsCheck.rows[0].count) === 0) {
      await client.query(
        `INSERT INTO public.agency_settings (agency_name, setup_complete)
         VALUES ('My Agency', false)`
      );
      fixes.push('Created default agency_settings row');
    }

    // Ensure normalized tables have default rows
    const normalizedTables = [
      'agency_branding',
      'agency_address',
      'agency_preferences',
      'agency_financial_settings',
      'agency_notifications',
    ];

    for (const table of normalizedTables) {
      const check = await client.query(
        `SELECT COUNT(*) as count FROM public.${table}`
      ).catch(() => ({ rows: [{ count: '0' }] }));

      if (parseInt(check.rows[0].count) === 0) {
        await client.query(
          `INSERT INTO public.${table} (id) VALUES (gen_random_uuid())`
        ).catch(() => {});
        fixes.push(`Created default row for ${table}`);
      }
    }

    await client.query('COMMIT');

    return {
      database: agencyDatabase,
      fixesApplied: fixes.length,
      fixes,
    };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  repairAgencyDatabase,
  verifyDatabaseIntegrity,
  fixCommonIssues,
};
