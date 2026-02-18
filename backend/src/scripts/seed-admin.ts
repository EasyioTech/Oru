
import { db } from '../infrastructure/database/index.js';
import { users, userRoles, profiles } from '../infrastructure/database/schema.js';
import { hashPassword } from '../utils/password.js';
import { eq } from 'drizzle-orm';

async function seedSuperAdmin() {
    const email = 'admin@oru.com';
    const password = 'AdminPassword123!';
    const name = 'System Admin';

    console.log(`🌱 Seeding Super Admin: ${email}`);

    try {
        const hashedPassword = await hashPassword(password);

        // 1. Check if user exists
        const [existingUser] = await db.select().from(users).where(eq(users.email, email));

        let userId: string;

        if (existingUser) {
            console.log('User already exists, updating password...');
            await db.update(users)
                .set({ passwordHash: hashedPassword, status: 'active', emailConfirmed: true })
                .where(eq(users.id, existingUser.id));
            userId = existingUser.id;
        } else {
            console.log('Creating new user...');
            const [newUser] = await db.insert(users).values({
                email,
                emailNormalized: email.toLowerCase(),
                passwordHash: hashedPassword,
                emailConfirmed: true,
                status: 'active'
            }).returning();
            userId = newUser.id;
        }

        // 2. Ensure Profile
        const [existingProfile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
        if (!existingProfile) {
            await db.insert(profiles).values({
                userId: userId,
                fullName: name
            });
        }

        // 3. Ensure Role
        try {
            await db.insert(userRoles).values({
                userId: userId,
                role: 'super_admin',
                isActive: true
            }).onConflictDoNothing();
            console.log('Role assigned.');
        } catch (err) {
            console.log('Role might already exist or error:', err);
        }

        console.log('✅ Super Admin seeding completed successfully.');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);

        process.exit(0);
    } catch (e) {
        console.error('❌ Error seeding super admin:', e);
        process.exit(1);
    }
}

seedSuperAdmin();
