import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';
import dotenv from 'dotenv';
import path from 'path';

const isDocker = process.env.NODE_ENV === 'production' || process.env.DOCKER_CONTAINER === 'true';

// Only load .env if not in Docker or if explicitly requested
if (!isDocker) {
    dotenv.config({ path: path.join(process.cwd(), '..', '.env') });
}

const { Pool } = pg;

const dbHost = process.env.POSTGRES_HOST || 'localhost';
const dbPort = process.env.POSTGRES_PORT || '5432';
const dbUser = process.env.POSTGRES_USER || 'postgres';
const dbPass = process.env.POSTGRES_PASSWORD || 'admin';
const dbName = process.env.POSTGRES_DB || 'oru';

const connectionString = process.env.DATABASE_URL || `postgres://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`;

// Global Connection Pool
export const pool = new Pool({
    connectionString,
    max: 50,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

// The Unified Drizzle instance
export const db = drizzle(pool, { schema });

// Keep this export for compatibility where getAgencyDb was used, 
// now it simply returns the shared database instance!
export async function getAgencyDb(databaseName: string) {
    return db;
}

/**
 * Helper to close all pools (Graceful shutdown)
 */
export async function closeAllPools() {
    await pool.end();
}
