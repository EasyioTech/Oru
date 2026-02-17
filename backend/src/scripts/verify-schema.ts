
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from parent directory
dotenv.config({ path: path.join(process.cwd(), '..', '.env') });

const { Client } = pg;

// Use the connection string or construct it
const connectionString = process.env.DATABASE_URL;

async function checkDatabaseSchema() {
    const client = new Client({
        connectionString,
    });

    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL server');

        // Query to get all user tables
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `);

        if (res.rows.length === 0) {
            console.log('❌ No tables found in the database. Schema push failed.');
        } else {
            console.log('✅ Tables found in the database:');
            res.rows.forEach(row => {
                console.log(` - ${row.table_name}`);
            });

            // Check for expected tables
            const expectedTables = [
                'agencies',
                'users',
                'profiles',
                'user_roles',
                'user_sessions',
                'currencies',
                'audit_logs',
                'agency_provisioning_jobs',
                'page_catalog'
            ];

            const missingTables = expectedTables.filter(t => !res.rows.some(r => r.table_name === t));

            if (missingTables.length > 0) {
                console.warn('\n⚠️  Warning: Some expected tables are missing:');
                missingTables.forEach(t => console.warn(` - ${t}`));
            } else {
                console.log('\n✅ All critical tables are present!');
            }
        }

        await client.end();
    } catch (error: any) {
        console.error('❌ Error checking database:', error.message);
        process.exit(1);
    }
}

checkDatabaseSchema();
