import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '..', '.env') });

const { Pool } = pg;

// Connection configuration for the Main (Control Plane) Database
const mainPool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:admin@localhost:5432/oru',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

// The Main Drizzle instance (Used for agencies, settings, etc.)
export const db = drizzle(mainPool, { schema });

// Cache for Agency Database Connections
// Helps scale to thousands of agencies without exhausting RAM/Connections
const agencyPools = new Map<string, { pool: pg.Pool; db: NodePgDatabase<typeof schema> }>();

/**
 * Get a Drizzle instance for a specific Agency database
 * @param databaseName The name of the PostgreSQL database for the agency
 */
export async function getAgencyDb(databaseName: string) {
    // Check if we already have this agency's pool in cache
    if (agencyPools.has(databaseName)) {
        return agencyPools.get(databaseName)!.db;
    }

    // Create a new pool for this specific agency
    const connectionString = process.env.DATABASE_URL_TEMPLATE
        ? process.env.DATABASE_URL_TEMPLATE.replace('{db}', databaseName)
        : `postgres://postgres:admin@localhost:5432/${databaseName}`;

    const pool = new Pool({
        connectionString,
        max: 10, // Small limit per agency to allow thousands of total pools
        idleTimeoutMillis: 30000,
    });

    const agencyDb = drizzle(pool, { schema });

    // Store in cache
    agencyPools.set(databaseName, { pool, db: agencyDb });

    return agencyDb;
}

/**
 * Helper to close all pools (Graceful shutdown)
 */
export async function closeAllPools() {
    await mainPool.end();
    for (const { pool } of agencyPools.values()) {
        await pool.end();
    }
}
