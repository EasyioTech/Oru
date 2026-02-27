/**
 * Auth module configuration
 * Central place for JWT and auth-related constants.
 */

module.exports = {
  JWT_EXPIRY: '24h',
  JWT_ISSUER: 'oru',
  JWT_AUDIENCE: 'oru-api',
  JWT_ALGORITHM: 'HS256',
};
