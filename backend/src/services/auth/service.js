/**
 * Authentication Service
 * Handles user authentication across main DB (super_admin) and agency DBs (agency users).
 * Used by auth routes; single source of truth for login logic.
 */

const bcrypt = require('bcrypt');
const { pool } = require('../../config/database');
const logger = require('../../utils/logger');

/**
 * Find user: super admin (main DB) or agency user (agency DB by domain).
 * - No domain: check main DB only for super_admin.
 * - With domain: resolve agency, then check that agency's DB only.
 *
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} [domain] - Agency domain for agency login; omit for super admin only
 * @returns {Promise<Object|null>} User data with agency info or null
 */
async function findUserAcrossAgencies(email, password, domain) {
  const mainClient = await pool.connect();

  try {
    // 1) Super admin: main DB only, no domain
    try {
      const superAdminCheck = await mainClient.query(`
        SELECT 
          u.id, u.email, u.password_hash, u.email_confirmed, u.is_active,
          u.created_at, u.updated_at, u.last_sign_in_at,
          ur.role, p.full_name, p.phone, p.avatar_url
        FROM public.users u
        LEFT JOIN public.user_roles ur ON u.id = ur.user_id 
          AND ur.role = 'super_admin' AND ur.agency_id IS NULL
        LEFT JOIN public.profiles p ON u.id = p.user_id
        WHERE u.email = $1 AND ur.role = 'super_admin' AND u.is_active = true
      `, [email]);

      if (superAdminCheck.rows.length > 0) {
        const dbUser = superAdminCheck.rows[0];
        let passwordMatch = false;

        if (dbUser.password_hash) {
          try {
            const cryptResult = await mainClient.query(
              `SELECT ($1 = crypt($2, $1)) as match`,
              [dbUser.password_hash, password]
            );
            passwordMatch = cryptResult.rows[0]?.match || false;
          } catch (_) {
            passwordMatch = false;
          }
          if (!passwordMatch) {
            try {
              passwordMatch = await bcrypt.compare(password, dbUser.password_hash);
            } catch (_) {
              passwordMatch = false;
            }
          }
        }

        if (passwordMatch) {
          try {
            await mainClient.query(
              'UPDATE public.users SET last_sign_in_at = NOW() WHERE id = $1',
              [dbUser.id]
            );
          } catch (e) {
            logger.debug('Auth: could not update last_sign_in_at (main)', { userId: dbUser.id });
          }
          return {
            user: {
              id: dbUser.id,
              email: dbUser.email,
              password_hash: dbUser.password_hash,
              email_confirmed: dbUser.email_confirmed,
              is_active: dbUser.is_active,
              two_factor_enabled: false,
              two_factor_secret: null,
              password_policy_id: null,
              created_at: dbUser.created_at,
              updated_at: dbUser.updated_at,
              last_sign_in_at: dbUser.last_sign_in_at,
            },
            agency: {
              id: null,
              name: 'Oru ERP',
              domain: null,
              database_name: null,
            },
            profile: dbUser.full_name ? {
              id: null,
              user_id: dbUser.id,
              full_name: dbUser.full_name,
              agency_id: null,
              phone: dbUser.phone,
              avatar_url: dbUser.avatar_url,
            } : null,
            roles: ['super_admin'],
          };
        }
      }
    } catch (superAdminError) {
      logger.warn('Auth: super admin check failed', { message: superAdminError.message });
    }

    // 2) Agency users — domain required
    if (!domain || typeof domain !== 'string' || !domain.trim()) {
      return null;
    }

    const subdomain = domain.toLowerCase().trim().split('.')[0];
    const agencyResult = await mainClient.query(
      `SELECT id, name, domain, database_name 
       FROM public.agencies 
       WHERE (domain = $1 OR domain = $2 OR domain LIKE $3) 
         AND is_active = true 
         AND database_name IS NOT NULL 
       LIMIT 1`,
      [domain.trim(), subdomain, subdomain + '.%']
    );

    if (agencyResult.rows.length === 0) {
      return null;
    }

    const agency = agencyResult.rows[0];
    if (agency.database_name.startsWith('test_')) {
      return null;
    }

    try {
      const { getAgencyPool } = require('../../infrastructure/database/poolManager');
      const agencyPool = getAgencyPool(agency.database_name);
      const agencyClient = await agencyPool.connect();

      try {
        const columnCheck = await agencyClient.query(`
          SELECT column_name FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = 'users' 
          AND column_name IN ('two_factor_enabled', 'two_factor_secret', 'password_policy_id', 'last_sign_in_at')
        `);
        const availableColumns = columnCheck.rows.map(row => row.column_name);
        const hasTwoFactorEnabled = availableColumns.includes('two_factor_enabled');
        const hasTwoFactorSecret = availableColumns.includes('two_factor_secret');
        const hasPasswordPolicyId = availableColumns.includes('password_policy_id');
        const hasLastSignInAt = availableColumns.includes('last_sign_in_at');

        if (!hasTwoFactorEnabled) {
          try { await agencyClient.query('ALTER TABLE public.users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false'); } catch (_) {}
        }
        if (!hasTwoFactorSecret) {
          try { await agencyClient.query('ALTER TABLE public.users ADD COLUMN IF NOT EXISTS two_factor_secret TEXT'); } catch (_) {}
        }
        if (!hasPasswordPolicyId) {
          try { await agencyClient.query('ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_policy_id UUID'); } catch (_) {}
        }
        if (!hasLastSignInAt) {
          try { await agencyClient.query('ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMP WITH TIME ZONE'); } catch (_) {}
        }

        const selectColumns = 'id, email, password_hash, email_confirmed, is_active, two_factor_enabled, two_factor_secret, password_policy_id';
        const userResult = await agencyClient.query(
          `SELECT ${selectColumns} FROM public.users WHERE email = $1 AND is_active = true`,
          [email]
        );

        if (userResult.rows.length === 0) {
          return null;
        }

        const dbUser = userResult.rows[0];
        if (!dbUser.password_hash) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(password, dbUser.password_hash);
        if (!passwordMatch) {
          return null;
        }

        const profileResult = await agencyClient.query(
          `SELECT id, user_id, full_name, agency_id, phone, avatar_url FROM public.profiles WHERE user_id = $1`,
          [dbUser.id]
        );
        const rolesResult = await agencyClient.query(
          `SELECT role FROM public.user_roles WHERE user_id = $1 AND (agency_id IS NULL OR agency_id = $2)`,
          [dbUser.id, agency.id]
        );

        try {
          await agencyClient.query('UPDATE public.users SET last_sign_in_at = NOW() WHERE id = $1', [dbUser.id]);
        } catch (e) {
          logger.debug('Auth: could not update last_sign_in_at (agency)', { userId: dbUser.id, database: agency.database_name });
        }

        return {
          user: dbUser,
          agency,
          profile: profileResult.rows[0] || null,
          roles: rolesResult.rows.map(r => r.role),
        };
      } finally {
        agencyClient.release();
      }
    } catch (err) {
      if (err.code !== '3D000') {
        logger.warn('Auth: agency DB error', { database: agency.database_name, message: err.message });
      }
      return null;
    }
  } finally {
    mainClient.release();
  }
}

/**
 * Generate JWT for the given user and agency context.
 */
function generateToken(user, agency) {
  const jwt = require('jsonwebtoken');
  const { JWT_EXPIRY, JWT_ISSUER, JWT_AUDIENCE, JWT_ALGORITHM } = require('./config');
  const jwtSecret = process.env.VITE_JWT_SECRET || process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  const agencyId = (agency && agency.id) ? agency.id : null;
  const agencyDatabase = (agency && agency.database_name) ? agency.database_name : null;

  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      agencyId,
      agencyDatabase,
      isSuperAdmin: !agencyDatabase,
    },
    jwtSecret,
    { expiresIn: JWT_EXPIRY, issuer: JWT_ISSUER, audience: JWT_AUDIENCE, algorithm: JWT_ALGORITHM }
  );
}

/**
 * Format user + agency for login API response.
 */
function formatUserResponse(userData) {
  const { user, agency, profile, roles } = userData;
  const agencyResponse = agency ? {
    id: agency.id || null,
    name: agency.name || null,
    domain: agency.domain || null,
    databaseName: agency.database_name || null,
  } : {
    id: null,
    name: null,
    domain: null,
    databaseName: null,
  };

  return {
    id: user.id,
    email: user.email,
    email_confirmed: user.email_confirmed,
    is_active: user.is_active,
    created_at: user.created_at,
    updated_at: user.updated_at,
    last_sign_in_at: user.last_sign_in_at,
    profile: profile || undefined,
    roles: roles || [],
    agency: agencyResponse,
  };
}

module.exports = {
  findUserAcrossAgencies,
  generateToken,
  formatUserResponse,
};
