
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Setup dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.join(__dirname, '../../..', '.env') });

const { Client } = pg;

// DB Config
const DB_NAME = process.env.MAIN_DB_NAME || 'oru';

async function runMigration() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL, // Should point to 'oru'
    });

    try {
        await client.connect();
        console.log(`✅ Connected to database: ${client.database}`);

        // Find migration file
        const drizzleDir = path.join(__dirname, '../../drizzle');
        const files = fs.readdirSync(drizzleDir);
        const migrationFile = files.find(f => f.endsWith('.sql'));

        if (!migrationFile) {
            console.error('❌ No SQL migration file found in drizzle directory');
            process.exit(1);
        }

        const filePath = path.join(drizzleDir, migrationFile);
        console.log(`📄 Found migration file: ${migrationFile}`);

        // Read SQL
        const sql = fs.readFileSync(filePath, 'utf-8');

        // Execute SQL
        console.log('🚀 Executing migration...');

        // Drizzle generates SQL with separate statements? Usually one big block or separated by ;
        // pg client can execute multiple statements in one query call usually.
        await client.query(sql);

        console.log('✅ Migration executed successfully!');
    } catch (error: any) {
        console.error('❌ Error executing migration:', error.message);
        if (error.position) {
            console.error(`   at position: ${error.position}`);
        }
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigration();
