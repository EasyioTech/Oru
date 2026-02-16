import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from parent directory
dotenv.config({ path: path.join(process.cwd(), '..', '.env') });

const { Client } = pg;

const DB_NAME = process.env.MAIN_DB_NAME || 'oru';
const DB_USER = process.env.POSTGRES_USER || 'postgres';
const DB_PASSWORD = process.env.POSTGRES_PASSWORD || 'admin';
const DB_HOST = process.env.POSTGRES_HOST || 'localhost';
const DB_PORT = parseInt(process.env.POSTGRES_PORT || '5432');

async function createMainDatabase() {
    // Connect to postgres database to create our main database
    const client = new Client({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
        database: 'postgres', // Connect to default postgres database
    });

    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL server');

        // Check if database exists
        const checkDb = await client.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [DB_NAME]
        );

        if (checkDb.rows.length > 0) {
            console.log(`ℹ️  Database "${DB_NAME}" already exists`);
        } else {
            // Create the database
            await client.query(`CREATE DATABASE ${DB_NAME}`);
            console.log(`✅ Created database "${DB_NAME}"`);
        }

        await client.end();
        console.log('✅ Database setup complete!');
        console.log(`\n📊 Database Details:`);
        console.log(`   Name: ${DB_NAME}`);
        console.log(`   Host: ${DB_HOST}:${DB_PORT}`);
        console.log(`   User: ${DB_USER}`);
        console.log(`\n🚀 Next steps:`);
        console.log(`   1. Run: npm run db:push`);
        console.log(`   2. Run: npm run dev`);

    } catch (error: any) {
        console.error('❌ Error creating database:', error.message);
        if (error.code === '28P01') {
            console.error('\n💡 Hint: Check your PostgreSQL password in .env file');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 Hint: Make sure PostgreSQL is running');
        }
        process.exit(1);
    }
}

// Run the script
createMainDatabase();
