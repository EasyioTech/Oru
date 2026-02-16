const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const dbConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'oru',
    password: process.env.DB_PASSWORD || 'admin',
    port: parseInt(process.env.DB_PORT || '5432'),
};

const migrationsDir = path.join(__dirname, '../../database/migrations/main');

const migrationFiles = [
    '01_core_system.sql',
    '02_system_monitoring.sql',
    '03_catalog_management.sql',
    '04_seed_catalog.sql',
    '05_system_settings.sql',
    '06_super_admin.sql',
    '07_provisioning_logic.sql'
];

async function runMigrations() {
    console.log('🚀 Starting Oru ERP Migration Suite...');
    console.log(`📂 Scanning directory: ${migrationsDir}`);

    const client = new Client(dbConfig);

    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL (oru database)');

        for (const file of migrationFiles) {
            const filePath = path.join(migrationsDir, file);

            if (!fs.existsSync(filePath)) {
                console.warn(`⚠️  Migration file not found: ${file}. Skipping...`);
                continue;
            }

            console.log(`\n📄 Executing: ${file}...`);
            const sql = fs.readFileSync(filePath, 'utf8');

            try {
                // Execute the SQL multi-statement block
                await client.query(sql);
                console.log(`✅ ${file} completed successfully.`);
            } catch (err) {
                console.error(`❌ Error in ${file}:`);
                console.error(err.message);

                // Detailed error info if available
                if (err.position) {
                    const start = Math.max(0, err.position - 50);
                    const end = Math.min(sql.length, err.position + 50);
                    console.error('Context:', sql.substring(start, end));
                }

                process.exit(1); // Stop on first error to prevent inconsistent state
            }
        }

        console.log('\n✨ All migrations completed successfully!');
    } catch (err) {
        console.error('Fatalf error during migration:', err);
    } finally {
        await client.end();
    }
}

runMigrations();
