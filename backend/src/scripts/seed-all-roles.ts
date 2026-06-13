/**
 * Seed All Roles — single-DB version
 *
 * Seeds one user per role into the main DATABASE_URL.
 * All users (including agency-level) live in the same postgres DB.
 * Idempotent — safe to run multiple times.
 *
 * Usage: npm run seed:roles
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

const SUPER_ADMIN = {
    email: 'admin@oru.com',
    password: 'OruAdmin2026!',
    fullName: 'Platform Super Admin',
    role: 'super_admin',
};

const AGENCY_USERS = [
    { email: 'agency.admin@demo.oru.com', password: 'AgencyAdmin2026!', fullName: 'Demo Agency Admin', role: 'agency_admin' },
    { email: 'manager@demo.oru.com',      password: 'Manager2026!',     fullName: 'Demo Manager',       role: 'manager'      },
    { email: 'employee@demo.oru.com',     password: 'Employee2026!',    fullName: 'Demo Employee',      role: 'employee'     },
    { email: 'auditor@demo.oru.com',      password: 'Auditor2026!',     fullName: 'Demo Auditor',       role: 'auditor'      },
    { email: 'viewer@demo.oru.com',       password: 'Viewer2026!',      fullName: 'Demo Viewer',        role: 'viewer'       },
    { email: 'custom@demo.oru.com',       password: 'Custom2026!',      fullName: 'Demo Custom',        role: 'custom'       },
] as const;

async function upsertUser(
    client: pg.PoolClient,
    email: string,
    password: string,
    fullName: string,
    role: string,
    agencyId: string | null,
): Promise<string> {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const normalized = email.toLowerCase();

    const existing = await client.query(
        `SELECT id FROM users WHERE email_normalized = $1 AND deleted_at IS NULL`,
        [normalized],
    );

    let userId: string;
    if (existing.rows.length > 0) {
        userId = existing.rows[0].id;
        await client.query(
            `UPDATE users SET password_hash=$1, status='active', email_confirmed=true, updated_at=NOW() WHERE id=$2`,
            [hash, userId],
        );
    } else {
        const res = await client.query(
            `INSERT INTO users (email, email_normalized, password_hash, status, email_confirmed)
             VALUES ($1, $2, $3, 'active', true) RETURNING id`,
            [email, normalized, hash],
        );
        userId = res.rows[0].id;
    }

    // Upsert profile
    const existingProfile = await client.query(
        `SELECT id FROM profiles WHERE user_id=$1 AND deleted_at IS NULL`,
        [userId],
    );
    if (existingProfile.rows.length > 0) {
        await client.query(
            `UPDATE profiles SET full_name=$1, agency_id=$2, updated_at=NOW() WHERE user_id=$3 AND deleted_at IS NULL`,
            [fullName, agencyId, userId],
        );
    } else {
        await client.query(
            `INSERT INTO profiles (user_id, full_name, agency_id) VALUES ($1, $2, $3)`,
            [userId, fullName, agencyId],
        );
    }

    // Upsert user_role
    const existingRole = await client.query(
        `SELECT id FROM user_roles WHERE user_id=$1 AND role=$2 AND (agency_id=$3 OR (agency_id IS NULL AND $3 IS NULL)) AND revoked_at IS NULL`,
        [userId, role, agencyId],
    );
    if (existingRole.rows.length === 0) {
        await client.query(
            `INSERT INTO user_roles (user_id, role, is_active, agency_id) VALUES ($1, $2, true, $3)`,
            [userId, role, agencyId],
        );
    } else {
        await client.query(
            `UPDATE user_roles SET is_active=true, updated_at=NOW() WHERE user_id=$1 AND role=$2 AND (agency_id=$3 OR (agency_id IS NULL AND $3 IS NULL))`,
            [userId, role, agencyId],
        );
    }

    return userId;
}

async function getOrCreateDemoAgency(client: pg.PoolClient): Promise<string> {
    const existing = await client.query(
        `SELECT id FROM agencies WHERE domain='demo.oru.com' AND deleted_at IS NULL LIMIT 1`,
    );
    if (existing.rows.length > 0) return existing.rows[0].id;

    const res = await client.query(
        `INSERT INTO agencies (name, domain, database_name, status, is_active)
         VALUES ('Demo Agency', 'demo.oru.com', 'demo_agency_db', 'active', true) RETURNING id`,
    );
    return res.rows[0].id;
}

async function main(): Promise<void> {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('❌ DATABASE_URL is not defined');
        process.exit(1);
    }

    console.log('🌱 Seeding all roles (single-DB)...\n');

    const pool = new pg.Pool({ connectionString: dbUrl });

    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. super_admin (no agency)
            const superAdminId = await upsertUser(client, SUPER_ADMIN.email, SUPER_ADMIN.password, SUPER_ADMIN.fullName, SUPER_ADMIN.role, null);
            console.log(`✅ super_admin   →  ${SUPER_ADMIN.email}  (id: ${superAdminId})`);

            // 2. Demo agency
            const agencyId = await getOrCreateDemoAgency(client);
            console.log(`\n🏢 Demo agency id: ${agencyId}`);

            // 3. Agency-level users
            for (const u of AGENCY_USERS) {
                const uid = await upsertUser(client, u.email, u.password, u.fullName, u.role, agencyId);
                console.log(`✅ ${u.role.padEnd(12)}  →  ${u.email}  (id: ${uid})`);
            }

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } finally {
        await pool.end();
    }

    console.log('\n📄 See docs/credentials.md for all credentials.');
}

main();
