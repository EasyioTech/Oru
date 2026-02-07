/**
 * Authentication Service (re-export)
 * All login logic lives in auth/service.js for scalability and clear ownership.
 * This file keeps existing imports working.
 */

module.exports = require('./auth');
