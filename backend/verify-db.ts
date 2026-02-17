
import { db } from './src/infrastructure/database/index.js';
import { systemSettings, notifications, tickets } from './src/infrastructure/database/schema.js';

async function verifyDatabase() {
    console.log('🔍 Verifying Database Setup...\n');

    try {
        // Test 1: Check system_settings table
        console.log('1️⃣ Testing system_settings table...');
        const settings = await db.select().from(systemSettings).limit(1);
        console.log('✅ system_settings table accessible');
        console.log(`   Found ${settings.length} settings record(s)\n`);

        // Test 2: Check notifications table
        console.log('2️⃣ Testing notifications table...');
        const notifs = await db.select().from(notifications).limit(1);
        console.log('✅ notifications table accessible');
        console.log(`   Found ${notifs.length} notification(s)\n`);

        // Test 3: Check tickets table
        console.log('3️⃣ Testing tickets table...');
        const ticketsList = await db.select().from(tickets).limit(1);
        console.log('✅ tickets table accessible');
        console.log(`   Found ${ticketsList.length} ticket(s)\n`);

        console.log('✅ All database tables verified successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database verification failed:', error);
        process.exit(1);
    }
}

verifyDatabase();
