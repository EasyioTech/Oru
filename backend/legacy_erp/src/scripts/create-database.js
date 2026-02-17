/**
 * Create oru database for first-time setup
 *
 * Connects to the default 'postgres' database and creates oru.
 * Uses credentials from .cursor/rules: postgres / admin
 *
 * Run from backend folder: npm run db:create  OR  node src/scripts/create-database.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

// Same as config/constants.js - postgres:admin@localhost:5432
const POSTGRES_PORT = parseInt(process.env.POSTGRES_PORT || process.env.DATABASE_PORT || '5432', 10);
const DB_USER = process.env.PGUSER || 'postgres';
const DB_PASSWORD = process.env.PGPASSWORD || process.env.DATABASE_PASSWORD || 'admin';
const DB_HOST = process.env.PGHOST || process.env.DATABASE_HOST || 'localhost';
const TARGET_DB = process.env.DATABASE_NAME || 'oru';

// Connect to default 'postgres' database to create oru
const adminConnectionString = `postgresql://${DB_USER}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:${POSTGRES_PORT}/postgres`;

async function createDatabase() {
  const client = new Client({ connectionString: adminConnectionString });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL (postgres database)');

    // Check if oru already exists
    const check = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [TARGET_DB]
    );

    if (check.rows.length > 0) {
      console.log(`Database "${TARGET_DB}" already exists.`);
      return;
    }

    // Create database (name must be safe - alphanumeric and underscore only)
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(TARGET_DB)) {
      throw new Error('Invalid database name');
    }
    await client.query(`CREATE DATABASE "${TARGET_DB.replace(/"/g, '""')}"`);
    console.log(`Database "${TARGET_DB}" created successfully.`);
  } catch (err) {
    console.error('Error:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('PostgreSQL is not running or not reachable at', DB_HOST + ':' + POSTGRES_PORT);
    }
    if (err.code === '28P01') {
      console.error('Authentication failed. Check user/password (default: postgres/admin).');
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDatabase();
