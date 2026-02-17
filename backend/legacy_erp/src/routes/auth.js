/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateRequest, commonRules } = require('../middleware/validation');
const { findUserAcrossAgencies, generateToken, formatUserResponse } = require('../services/auth');
const passwordPolicyService = require('../services/passwordPolicyService');
const { getAgencyPool } = require('../infrastructure/database/poolManager');
const { authenticate } = require('../middleware/authMiddleware');
const { authLimiter, passwordResetLimiter, twoFactorLimiter, sauthLimiter } = require('../middleware/rateLimiter');
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');

/**
 * POST /api/auth/login
 * Login endpoint - searches across all agency databases for the user
 * Protected by rate limiting: 5 attempts per 15 minutes
 * Validates: email (valid email), password (8-128 chars)
 */
router.post('/login', 
  authLimiter,
  [
    commonRules.email,
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 1, max: 128 })
      .withMessage('Password must be between 1 and 128 characters'),
    body('domain')
      .optional()
      .trim()
      .isLength({ min: 2, max: 63 })
      .withMessage('Domain must be 2-63 characters when provided'),
    body('twoFactorToken')
      .optional()
      .trim()
      .isLength({ min: 6, max: 6 })
      .withMessage('2FA token must be 6 digits')
      .isNumeric()
      .withMessage('2FA token must be numeric'),
    body('recoveryCode')
      .optional()
      .trim()
      .isLength({ min: 8, max: 8 })
      .withMessage('Recovery code must be 8 characters'),
    validateRequest,
  ],
  asyncHandler(async (req, res) => {
  const { email, password, domain, twoFactorToken, recoveryCode } = req.body;

  const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  try {
    logger.info('Login attempt', {
      email,
      hasTwoFactorToken: !!twoFactorToken,
      userAgent,
      origin: req.headers.origin,
      ip: ipAddress,
      requestId: req.requestId,
    });

    // Domain-first: agency users must send domain; super admin does not
    const userData = await findUserAcrossAgencies(email, password, domain);

    // Agency database for lockout: from logged-in user, or from domain when recording failed attempt
    let agencyDatabase = null;
    if (userData) {
      agencyDatabase = userData.agency?.database_name ?? null;
    } else if (domain && typeof domain === 'string' && domain.trim()) {
      const subdomain = domain.toLowerCase().trim().split('.')[0];
      const { pool } = require('../config/database');
      const mainClient = await pool.connect();
      try {
        const agencyResult = await mainClient.query(
          `SELECT database_name FROM public.agencies 
           WHERE (domain = $1 OR domain = $2 OR domain LIKE $3) AND is_active = true AND database_name IS NOT NULL 
           LIMIT 1`,
          [domain.trim(), subdomain, subdomain + '.%']
        );
        if (agencyResult.rows.length > 0) {
          agencyDatabase = agencyResult.rows[0].database_name;
        }
      } finally {
        mainClient.release();
      }
    }

    // Check lockout status if we have a user
    if (userData && agencyDatabase) {
      const lockoutStatus = await passwordPolicyService.getLockoutStatus(agencyDatabase, userData.user.id);
      if (lockoutStatus.isLocked) {
        // Record failed attempt
        await passwordPolicyService.recordLoginAttempt(
          agencyDatabase,
          userData.user.id,
          email,
          false,
          ipAddress,
          userAgent
        );
        
        const lockoutMinutes = Math.ceil((lockoutStatus.lockoutUntil - new Date()) / (1000 * 60));
        return res.status(423).json({
          success: false,
          error: 'Account locked',
          message: `Account is locked due to too many failed login attempts. Please try again in ${lockoutMinutes} minutes.`,
          lockoutUntil: lockoutStatus.lockoutUntil,
        });
      }
    }

    if (!userData) {
      // Record failed login attempt (if we have agency database)
      if (agencyDatabase) {
        await passwordPolicyService.recordLoginAttempt(
          agencyDatabase,
          null, // User ID unknown
          email,
          false,
          ipAddress,
          userAgent
        );
      }
      
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        message: 'Invalid email or password',
      });
    }

    // Check if 2FA is enabled for this user
    const twoFactorService = require('../services/twoFactorService');
    
    // Super admins use main database, regular users use agency database
    const isSuperAdmin = !userData.agency.database_name;
    let client;
    
    if (isSuperAdmin) {
      // Super admin - use main database pool
      const { pool } = require('../config/database');
      client = await pool.connect();
    } else {
      // Regular user - use agency database pool
      const agencyPool = getAgencyPool(userData.agency.database_name);
      client = await agencyPool.connect();
    }

    try {
      // First check if 2FA columns exist in the database
      const columnCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'two_factor_enabled'
      `);

      const hasTwoFactorColumns = columnCheck.rows.length > 0;
      let twoFactorEnabled = false;
      let twoFactorSecret = null;
      let recoveryCodes = null;

      if (hasTwoFactorColumns) {
        // Columns exist, query them
        const twoFactorResult = await client.query(
          `SELECT two_factor_enabled, two_factor_secret, recovery_codes 
           FROM public.users WHERE id = $1`,
          [userData.user.id]
        );

        twoFactorEnabled = twoFactorResult.rows[0]?.two_factor_enabled || false;
        twoFactorSecret = twoFactorResult.rows[0]?.two_factor_secret || null;
        recoveryCodes = twoFactorResult.rows[0]?.recovery_codes || null;
      } else {
        // Columns don't exist, 2FA is not available - skip 2FA check
        logger.debug('2FA columns not found in database, skipping 2FA check', {
          agencyDatabase: isSuperAdmin ? null : userData.agency?.database_name,
          requestId: req.requestId,
        });
      }

      // If 2FA is enabled, verify token
      if (twoFactorEnabled) {
        // If no 2FA token provided, return response indicating 2FA verification is required
        if (!twoFactorToken && !recoveryCode) {
          return res.json({
            success: true,
            requiresTwoFactor: true,
            userId: userData.user.id,
            agencyDatabase: isSuperAdmin ? null : userData.agency.database_name,
            message: '2FA verification required',
          });
        }

        // Verify 2FA token
        let isValid = false;
        if (twoFactorToken && twoFactorSecret) {
          isValid = twoFactorService.verifyToken(
            twoFactorToken,
            twoFactorSecret
          );
        } else if (recoveryCode && recoveryCodes) {
          const recoveryResult = twoFactorService.verifyRecoveryCode(
            recoveryCode,
            recoveryCodes
          );
          isValid = recoveryResult.valid;
          
          if (isValid && hasTwoFactorColumns) {
            // Update recovery codes (remove used one)
            await client.query(
              'UPDATE public.users SET recovery_codes = $1 WHERE id = $2',
              [recoveryResult.remainingCodes, userData.user.id]
            );
          }
        }

        if (!isValid) {
          return res.status(401).json({
            success: false,
            error: 'Invalid 2FA token or recovery code',
            message: 'Invalid 2FA token or recovery code',
          });
        }

        // Update last verification time (only if columns exist)
        if (hasTwoFactorColumns) {
          await client.query(
            'UPDATE public.users SET two_factor_verified_at = NOW() WHERE id = $1',
            [userData.user.id]
          );
        }
      }

      // Record successful login attempt (skip for super admins - no agency database)
      if (!isSuperAdmin) {
        await passwordPolicyService.recordLoginAttempt(
          userData.agency.database_name,
          userData.user.id,
          email,
          true,
          ipAddress,
          userAgent
        );
      }

      // Generate token and return user data
      const token = generateToken(userData.user, userData.agency);
      const userResponse = formatUserResponse(userData);

      res.json({
        success: true,
        token,
        user: userResponse,
        requiresTwoFactor: false,
      });
    } finally {
      client.release();
      // Don't close pool - it's managed by pool manager
    }
  } catch (error) {
    logger.error('Login error', {
      error: error.message,
      code: error.code,
      stack: error.stack,
      email,
      requestId: req.requestId,
    });
    res.status(500).json({
      success: false,
      error: error.message || 'Login failed',
      message: 'Login failed',
    });
  }
}));

/**
 * POST /api/auth/change-password
 * Change password for super admins (no agency context).
 * Agency users should use POST /api/password-policy/change instead.
 */
router.post('/change-password',
  authenticate,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required')
      .isLength({ min: 1, max: 128 })
      .withMessage('Password must be between 1 and 128 characters'),
    body('newPassword')
      .notEmpty()
      .withMessage('New password is required')
      .isLength({ min: 8, max: 128 })
      .withMessage('New password must be between 8 and 128 characters'),
    validateRequest,
  ],
  asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const agencyDatabase = req.user?.agencyDatabase;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Authentication required',
      });
    }

    // Agency users must use password-policy/change (has policy enforcement)
    if (agencyDatabase) {
      return res.status(400).json({
        success: false,
        error: 'Use password policy endpoint',
        message: 'Agency users should change password via Settings > Security (uses /api/password-policy/change)',
      });
    }

    const { pool } = require('../config/database');
    const client = await pool.connect();

    try {
      const userResult = await client.query(
        'SELECT id, password_hash FROM public.users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'User not found',
        });
      }

      const user = userResult.rows[0];
      const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          error: 'Current password is incorrect',
          message: 'Current password is incorrect',
        });
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      await client.query(
        `UPDATE public.users 
         SET password_hash = $1, 
             password_changed_at = COALESCE(password_changed_at, NOW()),
             updated_at = NOW()
         WHERE id = $2`,
        [newPasswordHash, userId]
      );

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } finally {
      client.release();
    }
  })
);

/**
 * POST /api/auth/sauth
 * Dedicated system-admin (super-admin) login. No domain; super_admin only.
 * Stricter rate limit (3/15 min). Audit log every attempt. Do not advertise this route.
 */
router.post('/sauth',
  sauthLimiter,
  [
    commonRules.email,
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 1, max: 128 })
      .withMessage('Password must be between 1 and 128 characters'),
    body('domain')
      .optional()
      .custom((val) => {
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          throw new Error('Domain must not be provided for this endpoint');
        }
        return true;
      }),
    validateRequest,
  ],
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const auditMeta = { ip: ipAddress, userAgent, email, requestId: req.requestId };

    try {
      logger.info('Sauth login attempt', auditMeta);

      const userData = await findUserAcrossAgencies(email, password, null);

      if (!userData) {
        logger.warn('Sauth login failed: invalid credentials', auditMeta);
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          message: 'Invalid credentials',
        });
      }

      const isSuperAdmin = !userData.agency?.database_name;
      if (!isSuperAdmin) {
        logger.warn('Sauth login failed: not super_admin', { ...auditMeta, userId: userData.user?.id });
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          message: 'Invalid credentials',
        });
      }

      const token = generateToken(userData.user, userData.agency);
      const userResponse = formatUserResponse(userData);
      logger.info('Sauth login success', { ...auditMeta, userId: userData.user?.id });

      res.json({
        success: true,
        token,
        user: userResponse,
        requiresTwoFactor: false,
      });
    } catch (err) {
      logger.error('Sauth login error', { ...auditMeta, error: err.message, stack: err.stack });
      res.status(500).json({
        success: false,
        error: 'Access denied',
        message: 'Access denied',
      });
    }
  })
);

module.exports = router;
