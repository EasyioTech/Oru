/**
 * Seed Super Admin Account
 * 
 * Creates a super_admin user for platform-level access via /sauth.
 * Idempotent — safe to run multiple times.
 * 
 * Usage:
 *   npm run seed:admin
 *   SUPER_ADMIN_EMAIL=x@y.com SUPER_ADMIN_PASSWORD=secret npm run seed:admin
 */

import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../..', '.env') });

const SALT_ROUNDS = 12;
const DEFAULT_EMAIL = 'admin@oru.com';
const DEFAULT_PASSWORD = 'OruAdmin2026!';

async function seedSuperAdmin(): Promise<void> {
    const email = process.env.SUPER_ADMIN_EMAIL || DEFAULT_EMAIL;
    const password = process.env.SUPER_ADMIN_PASSWORD || DEFAULT_PASSWORD;
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        console.error('❌ DATABASE_URL is not defined');
        process.exit(1);
    }

    console.log('🔐 Seeding Super Admin Account...');
    console.log(`   Email: ${email}`);
    console.log(`   Database: ${databaseUrl.replace(/:[^:@]+@/, ':***@')}`);

    const pool = new pg.Pool({ connectionString: databaseUrl });

    try {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
            const normalizedEmail = email.toLowerCase();

            // Check if user already exists
            const existingUser = await client.query(
                'SELECT id FROM users WHERE email_normalized = $1 AND deleted_at IS NULL',
                [normalizedEmail]
            );

            let userId: string;

            if (existingUser.rows.length > 0) {
                // Update existing user's password and status
                userId = existingUser.rows[0].id;
                await client.query(
                    `UPDATE users SET
                        password_hash = $1,
                        status = 'active',
                        email_confirmed = true,
                        updated_at = NOW()
                     WHERE id = $2`,
                    [passwordHash, userId]
                );
                console.log('   ℹ️  User already exists, updated password and status');
            } else {
                // Insert new user
                const insertResult = await client.query(
                    `INSERT INTO users (email, email_normalized, password_hash, status, email_confirmed)
                     VALUES ($1, $2, $3, 'active', true)
                     RETURNING id`,
                    [email, normalizedEmail, passwordHash]
                );
                userId = insertResult.rows[0].id;
                console.log('   ✨ Created new user');
            }

            // Upsert profile — check if exists first
            const existingProfile = await client.query(
                'SELECT id FROM profiles WHERE user_id = $1 AND deleted_at IS NULL',
                [userId]
            );

            if (existingProfile.rows.length > 0) {
                await client.query(
                    `UPDATE profiles SET full_name = 'Platform Super Admin', is_active = true, updated_at = NOW()
                     WHERE user_id = $1 AND deleted_at IS NULL`,
                    [userId]
                );
            } else {
                await client.query(
                    `INSERT INTO profiles (user_id, full_name, is_active) VALUES ($1, 'Platform Super Admin', true)`,
                    [userId]
                );
            }

            // Upsert super_admin role — check if exists first
            const existingRole = await client.query(
                `SELECT id FROM user_roles 
                 WHERE user_id = $1 AND role = 'super_admin' AND agency_id IS NULL AND is_active = true AND revoked_at IS NULL`,
                [userId]
            );

            if (existingRole.rows.length === 0) {
                await client.query(
                    `INSERT INTO user_roles (user_id, role, is_active, agency_id) VALUES ($1, 'super_admin', true, NULL)`,
                    [userId]
                );
                console.log('   ✨ Assigned super_admin role');
            } else {
                console.log('   ℹ️  super_admin role already assigned');
            }

            await client.query('COMMIT');

            console.log('');
            console.log('✅ Super Admin seeded successfully!');
            console.log(`   User ID:  ${userId}`);
            console.log(`   Email:    ${email}`);
            console.log(`   Role:     super_admin`);
            console.log('');
            console.log('🔑 Login at /sauth with these credentials.');

        } catch (txError) {
            await client.query('ROLLBACK');
            throw txError;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('❌ Failed to seed super admin:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

seedSuperAdmin();
