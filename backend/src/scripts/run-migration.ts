
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root if not in container (Optional, as env vars usually exist)
dotenv.config({ path: path.join(__dirname, '../../..', '.env') });

async function runMigration() {
    console.log('🚀 Starting Database Migration...');

    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL is not defined');
        process.exit(1);
    }

    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        const db = drizzle(pool);

        // Path to compiled migrations or source migrations
        // In Prod (Docker), we usually copy 'drizzle' folder to /app/drizzle
        // This script is in /app/dist/scripts/run-migration.js
        // So __dirname is /app/dist/scripts
        // Expected migrations at /app/drizzle
        const migrationsFolder = path.resolve(__dirname, '../../drizzle');

        console.log(`📂 Loading migrations from: ${migrationsFolder}`);

        await migrate(db, { migrationsFolder });

        console.log('✅ Migrations applied successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigration();
