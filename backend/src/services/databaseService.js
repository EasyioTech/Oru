/**
 * Database Service (Production-Ready Enhanced)
 * Handles database queries and transactions
 * 
 * CRITICAL IMPROVEMENTS:
 * - Removed all auto-repair CPU loops
 * - Pool manager integration
 * - Proper connection handling
 * - Clean error handling
 * - Security-first approach
 */

const { poolManager } = require('../infrastructure/database/poolManager');
const { validateUUID, setSessionVariable } = require('../utils/securityUtils');
const logger = require('../utils/logger');

/**
 * Execute a database query with optional user context
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @param {string} agencyDatabase - Agency database name
 * @param {string} userId - Optional user ID for audit context
 * @param {number} retryCount - Current retry attempt
 * @returns {Promise<Object>} Query result
 */
async function executeQuery(sql, params, agencyDatabase, userId, retryCount = 0) {
  const MAX_RETRIES = 2;
  const RETRY_DELAY_MS = 1000;

  // Get the appropriate pool
  const targetPool = agencyDatabase 
    ? await poolManager.getAgencyPool(agencyDatabase)
    : poolManager.getMainPool();

  const trimmedSql = sql.trim();

  logger.debug('Executing query', {
    sql: trimmedSql.substring(0, 100),
    agencyDatabase: agencyDatabase || 'main',
    hasUserId: !!userId
  });

  try {
    // Execute with user context if provided
    if (userId) {
      const client = await targetPool.connect();
      
      try {
        await client.query('BEGIN');

        // Set user context securely
        validateUUID(userId);
        await setSessionVariable(client, 'app.current_user_id', userId);

        const result = await client.query(trimmedSql, params);
        await client.query('COMMIT');
        
        return result;
        
      } catch (error) {
        await client.query('ROLLBACK').catch(() => {});
        throw error;
      } finally {
        client.release();
      }
    } else {
      // Execute without transaction
      return await targetPool.query(trimmedSql, params);
    }
    
  } catch (error) {
    // Retry on connection errors only
    const isConnectionError = 
      error.message?.includes('timeout') ||
      error.message?.includes('Connection terminated') ||
      error.message?.includes('ECONNREFUSED') ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ECONNREFUSED' ||
      error.code === '57P01'; // Connection termination

    if (isConnectionError && retryCount < MAX_RETRIES) {
      logger.warn('Connection error, retrying', {
        attempt: retryCount + 1,
        maxRetries: MAX_RETRIES,
        error: error.message
      });
      
      // Remove bad pool from cache if it's an agency pool
      if (agencyDatabase) {
        await poolManager.removeAgencyPool(agencyDatabase);
        logger.debug('Removed bad pool from cache', { agencyDatabase });
      }

      // Wait before retry
      await new Promise(resolve => 
        setTimeout(resolve, RETRY_DELAY_MS * (retryCount + 1))
      );

      // Retry
      return executeQuery(sql, params, agencyDatabase, userId, retryCount + 1);
    }

    // Not a connection error or exhausted retries
    throw error;
  }
}

/**
 * Execute multiple queries in a transaction
 * @param {Array} queries - Array of {sql, params} objects
 * @param {string} agencyDatabase - Agency database name
 * @param {string} userId - Optional user ID for audit context
 * @returns {Promise<Array>} Array of query results
 */
async function executeTransaction(queries, agencyDatabase, userId) {
  if (!Array.isArray(queries) || queries.length === 0) {
    throw new Error('Queries array is required and must not be empty');
  }

  logger.debug('Executing transaction', {
    queryCount: queries.length,
    agencyDatabase: agencyDatabase || 'main'
  });

  // Get the appropriate pool
  const targetPool = agencyDatabase 
    ? await poolManager.getAgencyPool(agencyDatabase)
    : poolManager.getMainPool();

  const client = await targetPool.connect();
  
  try {
    await client.query('BEGIN');

    // Set user context if provided
    if (userId) {
      validateUUID(userId);
      await setSessionVariable(client, 'app.current_user_id', userId);
    }

    const results = [];

    for (const { sql, params = [] } of queries) {
      const trimmedSql = sql.trim();
      logger.debug('Transaction query', {
        sql: trimmedSql.substring(0, 100)
      });
      
      const result = await client.query(trimmedSql, params);
      results.push({
        rows: result.rows,
        rowCount: result.rowCount,
      });
    }

    await client.query('COMMIT');
    
    logger.debug('Transaction committed', {
      queryCount: results.length
    });
    
    return results;
    
  } catch (error) {
    await client.query('ROLLBACK');
    
    logger.error('Transaction error', {
      error: error.message,
      code: error.code,
      agencyDatabase
    });
    
    throw error;
    
  } finally {
    client.release();
  }
}

module.exports = {
  executeQuery,
  executeTransaction,
};