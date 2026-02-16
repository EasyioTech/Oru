
import { db } from './src/infrastructure/database/index.js';
import { userRoles, users } from './src/infrastructure/database/schema.js';
import { eq, and } from 'drizzle-orm';

async function checkSuperAdmin() {
    try {
        const admins = await db.select()
            .from(userRoles)
            .where(eq(userRoles.role, 'super_admin'));

        console.log('Super Admins found:', admins.length);
        for (const admin of admins) {
            const user = await db.select().from(users).where(eq(users.id, admin.userId));
            console.log(`- User ID: ${admin.userId}, Email: ${user[0]?.email}`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

checkSuperAdmin();
