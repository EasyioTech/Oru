/**
 * Auth service module
 * Single entry for authentication: login (super_admin + agency users), sauth, tokens, and user resolution.
 * Use services/auth or services/auth/service for findUserAcrossAgencies, generateToken, formatUserResponse.
 * Routes are mounted at /api/auth via routes/auth.js.
 */

const service = require('./service');
const config = require('./config');

module.exports = {
  ...service,
  config,
};
