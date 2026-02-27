/**
 * Run agency schema on a database (creates agency_settings and related tables)
 *
 * Usage:
 *   node src/scripts/runSchema.js [database_name]
 *
 * If database_name is omitted, uses DATABASE_NAME from env (default: buildflow_db).
 * For agency databases, pass the agency's database name (e.g. from agencies.database_name).
 *
 * Run from backend folder: node src/scripts/runSchema.js
 * Or for specific agency: node src/scripts/runSchema.js buildflow_agency_xxx
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const { Pool } = require('pg');
const path = require('path');

const POSTGRES_PORT = parseInt(process.env.POSTGRES_PORT || process.env.DATABASE_PORT || '5432', 10);
const DB_USER = process.env.PGUSER || process.env.DATABASE_USER || process.env.DATABASE_USERNAME || 'postgres';
const DB_PASSWORD = process.env.PGPASSWORD || process.env.DATABASE_PASSWORD || 'admin';
const DB_HOST = process.env.PGHOST || process.env.DATABASE_HOST || 'localhost';
const DEFAULT_DB = process.env.DATABASE_NAME || 'buildflow_db';

const dbName = process.argv[2] || DEFAULT_DB;
const connectionString = `postgresql://${DB_USER}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:${POSTGRES_PORT}/${dbName}`;

async function runSchema() {
  const pool = new Pool({ connectionString, max: 1 });
  const client = await pool.connect();

  try {
    console.log(`[runSchema] Connecting to database: ${dbName}`);
    const { ensureSharedFunctions } = require('../infrastructure/database/schema/sharedFunctions');
    const { ensureAgencySettingsTable } = require('../infrastructure/database/schema/agenciesSchema');

    console.log('[runSchema] Ensuring shared functions...');
    await ensureSharedFunctions(client);
    console.log('[runSchema] Ensuring agency_settings table...');
    await ensureAgencySettingsTable(client);
    console.log('[runSchema] Done. agency_settings table is ready.');
  } catch (err) {
    console.error('[runSchema] Error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runSchema();
