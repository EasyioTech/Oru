/**
 * Database Routes (Production-Ready Enhanced)
 * Handles database queries and transactions
 * 
 * CRITICAL IMPROVEMENTS:
 * - Removed CPU-intensive auto-repair loops
 * - Centralized error handling
 * - Pool manager integration
 * - Proper security validation
 * - Clean separation of concerns
 */

const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { executeQuery, executeTransaction } = require('../services/databaseService');
const { poolManager } = require('../infrastructure/database/poolManager');
const logger = require('../utils/logger');
const { queryOne } = require('../infrastructure/database/dbQuery');
const { send, success, error: errorResponse } = require('../utils/responseHelper');

/**
 * Sanitize agency_settings queries
 * agency_settings table has no agency_id column (per-database table)
 */
function sanitizeAgencySettingsQuery(sql, params) {
  if (!sql.includes('agency_settings')) {
    return { sql, params };
  }

  let cleanSql = sql.trim();
  let cleanParams = [...params];

  // Remove agency_id from INSERT
  if (cleanSql.includes('INSERT INTO') && cleanSql.match(/\bagency_id\b/i)) {
    const match = cleanSql.match(/INSERT\s+INTO\s+([^(]+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)\s*(RETURNING\s+\*)?/is);
    
    if (match) {
      const tablePart = match[1].trim();
      const columns = match[2].split(',').map(c => c.trim());
      const values = match[3].split(',').map(v => v.trim());
      const returningClause = match[4] || '';
      
      const agencyIdIndex = columns.findIndex(c => c.toLowerCase() === 'agency_id');
      
      if (agencyIdIndex !== -1) {
        columns.splice(agencyIdIndex, 1);
        values.splice(agencyIdIndex, 1);
        if (cleanParams.length > agencyIdIndex) {
          cleanParams.splice(agencyIdIndex, 1);
        }
        
        cleanSql = `INSERT INTO ${tablePart} (${columns.join(',')}) VALUES (${values.join(',')})${returningClause}`;
      }
    } else {
      // Fallback regex
      cleanSql = cleanSql
        .replace(/,\s*agency_id\s*(?=,|\))/gi, '')
        .replace(/\(\s*agency_id\s*,/gi, '(')
        .replace(/,\s*agency_id\s*\)/gi, ')')
        .replace(/\(\s*agency_id\s*\)/gi, '()');
    }
  }

  // Remove agency_id from UPDATE
  if (cleanSql.includes('UPDATE')) {
    cleanSql = cleanSql
      .replace(/,\s*agency_id\s*=\s*\$?\d+/gi, '')
      .replace(/agency_id\s*=\s*\$?\d+\s*,/gi, '');
  }

  return { sql: cleanSql, params: cleanParams };
}

/**
 * Handle database does not exist error
 */
async function handleDatabaseNotExist(agencyDatabase, req, res, sql, params, userId) {
  logger.info('Database does not exist, checking agency', { agencyDatabase });
  
  try {
    // Check if agency exists
    const agency = await queryOne(
      'SELECT id, name FROM agencies WHERE database_name = $1',
      [agencyDatabase],
      { requestId: req.requestId }
    );
    
    if (!agency) {
      logger.warn('Agency not found in main database', { agencyDatabase });
      return send(res, errorResponse(
        `Agency database "${agencyDatabase}" does not exist. Please log out and log in again.`,
        'AGENCY_DB_NOT_FOUND',
        { 
          error: 'Agency database not found',
          agencyDatabase,
          suggestion: 'Log out and log in again'
        },
        404
      ));
    }
    
    // Agency exists but database missing - create it
    logger.info('Agency exists, creating database', {
      agencyDatabase,
      agencyId: agency.id
    });
    
    const { createAgencySchema } = require('../infrastructure/database/schemaCreator');
    const { validateDatabaseName, quoteIdentifier } = require('../utils/securityUtils');
    const { Pool } = require('pg');
    
    // Get connection config
    const mainPool = poolManager.getMainPool();
    const mainClient = await mainPool.connect();
    
    try {
      // Create database
      const validatedDbName = validateDatabaseName(agencyDatabase);
      const quotedDbName = quoteIdentifier(validatedDbName);
      
      await mainClient.query(`CREATE DATABASE ${quotedDbName}`);
      logger.info('Database created', { agencyDatabase });
      
    } finally {
      mainClient.release();
    }
    
    // Get agency pool and create schema
    const agencyPool = await poolManager.getAgencyPool(agencyDatabase);
    const agencyClient = await agencyPool.connect();
    
    try {
      await createAgencySchema(agencyClient, { skipAutoSync: true });
      logger.info('Schema created', { agencyDatabase });
      
      // Retry original query
      const result = await executeQuery(sql, params, agencyDatabase, userId);
      return res.json({
        rows: result.rows,
        rowCount: result.rowCount,
      });
      
    } finally {
      agencyClient.release();
    }
    
  } catch (error) {
    logger.error('Failed to create database/schema', {
      error: error.message,
      agencyDatabase
    });
    
    return send(res, errorResponse(
      error.message,
      'DB_CREATION_FAILED',
      { error: 'Failed to create agency database' },
      500
    ));
  }
}

/**
 * Handle missing table error
 */
async function handleMissingTable(error, agencyDatabase, req, res, sql, params, userId) {
  // Only handle agency_settings table - it's critical
  if (error.message.includes('agency_settings')) {
    if (!agencyDatabase) {
      // Query on main DB - table doesn't exist there (expected)
      logger.debug('agency_settings queried on main DB, returning empty');
      return res.json({ rows: [], rowCount: 0 });
    }
    
    // Missing in agency DB - create it once
    if (!req._agencySettingsRepairAttempted) {
      req._agencySettingsRepairAttempted = true;
      
      logger.info('Creating agency_settings table', { agencyDatabase });
      
      try {
        const agencyPool = await poolManager.getAgencyPool(agencyDatabase);
        const client = await agencyPool.connect();
        
        try {
          const { ensureAgenciesSchema } = require('../infrastructure/database/schema/agenciesSchema');
          await ensureAgenciesSchema(client);
          
          logger.info('agency_settings created, retrying', { agencyDatabase });
          
          const result = await executeQuery(sql, params, agencyDatabase, userId);
          return res.json({ rows: result.rows, rowCount: result.rowCount });
          
        } finally {
          client.release();
        }
      } catch (repairError) {
        logger.error('Failed to create agency_settings', {
          error: repairError.message,
          agencyDatabase
        });
      }
    }
  }
  
  // For other missing tables, return error (don't auto-repair)
  logger.warn('Missing table detected', {
    table: error.message.match(/relation "public\.([^"]+)"/)?.[1],
    agencyDatabase
  });
  
  return null; // Let default error handler handle it
}

/**
 * Handle missing notifications table in main DB
 */
async function handleMissingNotifications(agencyDatabase, req, res, sql, params, userId) {
  if (agencyDatabase) {
    return null; // Only handle main DB
  }
  
  logger.info('Creating notifications table in main DB');
  
  try {
    const mainPool = poolManager.getMainPool();
    const client = await mainPool.connect();
    
    try {
      const { ensureNotificationsTable } = require('../infrastructure/database/schema/miscSchema');
      await ensureNotificationsTable(client);
      
      logger.info('notifications table created, retrying');
      
      const result = await executeQuery(sql, params, agencyDatabase, userId);
      return res.json({ rows: result.rows, rowCount: result.rowCount });
      
    } finally {
      client.release();
    }
  } catch (repairError) {
    logger.error('Failed to create notifications table', {
      error: repairError.message
    });
  }
  
  return null;
}

/**
 * POST /api/database/query
 * Execute a single database query
 */
router.post('/query', asyncHandler(async (req, res) => {
  let { sql: originalSql, params: originalParams = [], userId } = req.body;
  const agencyDatabase = req.headers['x-agency-database'];

  // Validate
  if (!originalSql) {
    return res.status(400).json({ error: 'SQL query is required' });
  }

  // Sanitize agency_settings queries
  const { sql, params } = sanitizeAgencySettingsQuery(originalSql, originalParams);

  try {
    const result = await executeQuery(sql, params, agencyDatabase, userId);
    res.json({
      rows: result.rows,
      rowCount: result.rowCount,
    });
    
  } catch (error) {
    logger.error('Database query error', {
      error: error.message,
      code: error.code,
      detail: error.detail,
      agencyDatabase,
      sql: sql.substring(0, 200),
    });

    // Handle specific error cases
    let handled = null;
    
    // Database does not exist (3D000)
    if (error.code === '3D000' && agencyDatabase) {
      handled = await handleDatabaseNotExist(agencyDatabase, req, res, sql, params, userId);
      if (handled) return;
    }
    
    // Table does not exist (42P01)
    if (error.code === '42P01') {
      // Handle notifications table
      if (error.message.includes('notifications')) {
        handled = await handleMissingNotifications(agencyDatabase, req, res, sql, params, userId);
        if (handled) return;
      }
      
      // Handle other missing tables
      handled = await handleMissingTable(error, agencyDatabase, req, res, sql, params, userId);
      if (handled) return;
    }

    // Return detailed error
    const errorDetails = {
      message: error.message || 'Database query failed',
      error: error.message || 'Database query failed',
      code: error.code,
      detail: error.detail,
      hint: error.hint,
    };
    
    // Remove undefined fields
    Object.keys(errorDetails).forEach(key => {
      if (errorDetails[key] === undefined) {
        delete errorDetails[key];
      }
    });
    
    res.status(500).json(errorDetails);
  }
}));

/**
 * POST /api/database/transaction
 * Execute multiple queries in a single transaction
 */
router.post('/transaction', asyncHandler(async (req, res) => {
  const { queries = [], userId } = req.body;
  const agencyDatabase = req.headers['x-agency-database'];

  try {
    const results = await executeTransaction(queries, agencyDatabase, userId);
    res.json({
      success: true,
      results,
    });
    
  } catch (error) {
    logger.error('Database transaction error', {
      error: error.message,
      code: error.code,
      detail: error.detail,
      agencyDatabase,
    });
    
    const detailMsg = [error.detail, error.hint].filter(Boolean).join('; ') || error.detail;
    return send(res, errorResponse(
      error.message,
      error.code || 'TRANSACTION_FAILED',
      { detail: detailMsg },
      500
    ));
  }
}));

module.exports = router;