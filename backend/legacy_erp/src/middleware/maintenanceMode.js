/**
 * Maintenance Mode Middleware
 * Checks system settings for maintenance mode and blocks non-super-admin requests.
 * Uses shared getSystemSettings from utils/systemSettings (single cache).
 */

const { getSystemSettings } = require('../utils/systemSettings');
const logger = require('../utils/logger');

/**
 * Maintenance mode middleware
 * Mounted at /api, so req.path is relative (e.g. /system/settings not /api/system/settings).
 * Bypass: skipPaths (auth, health, system/settings) so super_admin can log in and turn maintenance off.
 * req.user is not set at this point (auth runs per-route), so super_admin relies on skipPaths only.
 */
async function maintenanceMode(req, res, next) {
  const skipPaths = [
    '/auth/login',
    '/auth/sauth',
    '/auth/register',
    '/health',
    '/system/health',
    '/system/settings',
    '/system/maintenance-status',
  ];

  if (skipPaths.some(path => req.path.startsWith(path))) {
    return next();
  }

  try {
    const settings = await getSystemSettings();

    if (settings.maintenance_mode) {
      if (req.user && req.user.isSuperAdmin) {
        return next();
      }

      return res.status(503).json({
        success: false,
        error: {
          code: 'MAINTENANCE_MODE',
          message: settings.maintenance_message || 'The system is currently under maintenance. Please check back later.',
        },
        message: settings.maintenance_message || 'System is under maintenance',
        maintenance_mode: true,
      });
    }

    next();
  } catch (error) {
    logger.error('Error checking maintenance mode', { message: error.message });
    next();
  }
}

module.exports = {
  maintenanceMode,
};
