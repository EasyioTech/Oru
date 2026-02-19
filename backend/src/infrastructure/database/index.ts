import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as coreSchema from './schema-core.js';
import * as tenantSchema from './schema-tenant.js';
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

// Connection configuration for the Main (Control Plane) Database
const mainPool = new Pool({
    connectionString: process.env.DATABASE_URL || `postgres://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

// The Main Drizzle instance (Used for agencies, settings, etc.)
export const db = drizzle(mainPool, { schema: coreSchema });

// Cache for Agency Database Connections with basic eviction policy
const MAX_AGENCY_POOLS = 50;
const agencyPools = new Map<string, { pool: pg.Pool; db: NodePgDatabase<typeof tenantSchema>; lastUsed: number }>();

/**
 * Get a Drizzle instance for a specific Agency database
 */
export async function getAgencyDb(databaseName: string) {
    // Check cache
    const cached = agencyPools.get(databaseName);
    if (cached) {
        cached.lastUsed = Date.now();
        return cached.db;
    }

    // Eviction policy: if too many pools, close the oldest one
    if (agencyPools.size >= MAX_AGENCY_POOLS) {
        let oldestDb: string | null = null;
        let oldestTime = Infinity;

        for (const [name, entry] of agencyPools.entries()) {
            if (entry.lastUsed < oldestTime) {
                oldestTime = entry.lastUsed;
                oldestDb = name;
            }
        }

        if (oldestDb) {
            const entry = agencyPools.get(oldestDb);
            await entry?.pool.end();
            agencyPools.delete(oldestDb);
        }
    }

    // Create a new pool
    let connectionString: string;
    // ... logic same as before ...
    if (process.env.DATABASE_URL_TEMPLATE) {
        connectionString = process.env.DATABASE_URL_TEMPLATE.replace('{db}', databaseName);
    } else if (process.env.DATABASE_URL) {
        try {
            const url = new URL(process.env.DATABASE_URL);
            url.pathname = `/${databaseName}`;
            connectionString = url.toString();
        } catch (error) {
            connectionString = `postgres://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${databaseName}`;
        }
    } else {
        connectionString = `postgres://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${databaseName}`;
    }

    const pool = new Pool({
        connectionString,
        max: 5,
        idleTimeoutMillis: 30000,
    });

    const agencyDb = drizzle(pool, { schema: tenantSchema });

    agencyPools.set(databaseName, { pool, db: agencyDb, lastUsed: Date.now() });

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
