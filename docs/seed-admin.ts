
import { db } from '../backend/src/infrastructure/database/index.js';
import { users, userRoles, profiles } from '../backend/src/infrastructure/database/schema.js';
import { hashPassword } from '../backend/src/utils/password.js';

async function seedSuperAdmin() {
    const email = 'admin@oru.com';
    const password = 'AdminPassword123!';
    const name = 'System Admin';

    try {
        const hashedPassword = await hashPassword(password);

        const [user] = await db.insert(users).values({
            email,
            emailNormalized: email.toLowerCase(),
            passwordHash: hashedPassword,
            emailConfirmed: true,
            status: 'active'
        }).returning();

        await db.insert(profiles).values({
            userId: user.id,
            fullName: name
        });

        await db.insert(userRoles).values({
            userId: user.id,
            role: 'super_admin',
            isActive: true
        });

        console.log('Super Admin created successfully:');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
    } catch (e) {
        console.error('Error seeding super admin:', e);
    } finally {
        process.exit(0);
    }
}

seedSuperAdmin();
