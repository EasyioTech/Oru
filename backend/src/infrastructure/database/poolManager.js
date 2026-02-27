/**
 * Global Connection Pool Manager
 * 
 * Manages PostgreSQL connection pools with:
 * - LRU cache for pool eviction
 * - Global connection limits
 * - Per-pool connection limits
 * - Automatic cleanup of idle pools
 * - Connection monitoring
 */

const { Pool } = require('pg');
const { DATABASE_URL, POOL_CONFIG } = require('../../config/constants');
const logger = require('../../utils/logger');

/**
 * LRU Cache implementation for connection pools
 */
class LRUCache {
  constructor(maxSize) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (this.cache.has(key)) {
      // Move to end (most recently used)
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      // Update existing
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Evict least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      const evictedPool = this.cache.get(firstKey);
      this.cache.delete(firstKey);
      
      // Close evicted pool gracefully (check if already closed)
      if (evictedPool && typeof evictedPool.end === 'function' && !evictedPool._ending && !evictedPool._ended) {
        evictedPool._ending = true;
        evictedPool.end().then(() => {
          evictedPool._ended = true;
        }).catch(err => {
          if (!err.message?.includes('more than once')) {
            logger.warn('PoolManager: error closing evicted pool', { pool: firstKey, message: err.message });
          }
        });
      }
      logger.debug('PoolManager: evicted pool (cache limit reached)', { pool: firstKey });
    }
    
    this.cache.set(key, value);
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    return this.cache.delete(key);
  }

  size() {
    return this.cache.size;
  }

  clear() {
    // Close all pools before clearing (check if already closed)
    for (const [key, pool] of this.cache.entries()) {
      if (pool && typeof pool.end === 'function' && !pool._ending && !pool._ended) {
        pool._ending = true;
        pool.end().then(() => {
          pool._ended = true;
        }).catch(err => {
          if (!err.message?.includes('more than once')) {
            logger.warn('PoolManager: error closing pool during clear', { pool: key, message: err.message });
          }
        });
      }
    }
    this.cache.clear();
  }

  keys() {
    return this.cache.keys();
  }
}

/**
 * Global Pool Manager
 */
class GlobalPoolManager {
  constructor() {
    // Configuration
    this.maxPools = parseInt(process.env.MAX_AGENCY_POOLS || '50', 10);
    this.maxConnectionsPerPool = parseInt(process.env.MAX_CONNECTIONS_PER_POOL || '5', 10);
    this.poolIdleTimeout = parseInt(process.env.POOL_IDLE_TIMEOUT || '300000', 10); // 5 minutes
    
    // Main database pool (always available)
    this.mainPool = new Pool({
      connectionString: DATABASE_URL,
      ...POOL_CONFIG,
      max: Math.min(POOL_CONFIG.max || 20, 20), // Cap main pool at 20
    });

    // LRU cache for agency pools
    this.agencyPools = new LRUCache(this.maxPools);
    
    // Track pool access times and usage for cleanup
    this.poolAccessTimes = new Map();
    this.poolUsageStats = new Map(); // Track query counts per pool
    
    // Start cleanup interval
    this.startCleanupInterval();
    
    // Setup error handlers
    this.setupErrorHandlers();
  }

  /**
   * Get main database pool
   */
  getMainPool() {
    return this.mainPool;
  }

  /**
   * Get or create agency database pool
   * @param {string} databaseName - Agency database name
   * @returns {Pool} PostgreSQL connection pool
   */
  getAgencyPool(databaseName) {
    if (!databaseName || typeof databaseName !== 'string') {
      return this.mainPool;
    }

    const normalizedName = databaseName.trim();
    if (!normalizedName) {
      return this.mainPool;
    }

    // Validate database name for security
    const { validateDatabaseName } = require('../../utils/securityUtils');
    try {
      validateDatabaseName(normalizedName);
    } catch (error) {
      logger.error('PoolManager: invalid database name', { databaseName: normalizedName, message: error.message });
      throw new Error(`Invalid database name: ${error.message}`);
    }

    // Check cache first
    let pool = this.agencyPools.get(normalizedName);
    if (pool) {
      // Update access time and usage stats
      this.poolAccessTimes.set(normalizedName, Date.now());
      const stats = this.poolUsageStats.get(normalizedName) || { queryCount: 0, lastUsed: Date.now() };
      stats.queryCount++;
      stats.lastUsed = Date.now();
      this.poolUsageStats.set(normalizedName, stats);
      return pool;
    }

    // Create new pool if under limit
    if (this.agencyPools.size() >= this.maxPools) {
      logger.debug('PoolManager: pool limit reached, LRU eviction may occur', { maxPools: this.maxPools });
    }

    // Build connection config - use Pool object instead of connection string for better security
    const dbConfig = parseDatabaseUrl();
    
    // Validate all required fields
    if (!dbConfig.host || !dbConfig.user || dbConfig.password === undefined || !dbConfig.port) {
      throw new Error('Invalid database configuration: missing required connection parameters');
    }
    
    // Create pool using Pool object (more secure than connection string)
    // pg library handles password encoding automatically
    pool = new Pool({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password, // pg handles encoding internally
      database: normalizedName,
      max: this.maxConnectionsPerPool,
      idleTimeoutMillis: POOL_CONFIG.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: POOL_CONFIG.connectionTimeoutMillis || 2000,
      statement_timeout: POOL_CONFIG.statement_timeout || 30000, // 30 seconds default
      query_timeout: POOL_CONFIG.query_timeout || 30000, // 30 seconds default
      // Application name for monitoring
      application_name: 'oru-api',
      // Keep connections alive
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    });

    pool.on('error', (err) => {
      logger.error('PoolManager: agency pool connection error', { database: normalizedName, message: err.message });
      if (err.code === 'ECONNREFUSED' || err.message.includes('timeout') || err.code === '57P01') {
        logger.debug('PoolManager: removing bad pool from cache', { database: normalizedName });
        this.agencyPools.delete(normalizedName);
        this.poolAccessTimes.delete(normalizedName);
      }
    });

    pool.on('connect', () => {
      logger.debug('PoolManager: connected to agency database', { database: normalizedName });
    });

    this.agencyPools.set(normalizedName, pool);
    this.poolAccessTimes.set(normalizedName, Date.now());
    this.poolUsageStats.set(normalizedName, {
      queryCount: 0,
      lastUsed: Date.now(),
      createdAt: Date.now()
    });
    logger.debug('PoolManager: created new agency pool', { database: normalizedName, total: this.agencyPools.size(), max: this.maxPools });

    return pool;
  }

  /**
   * Setup error handlers for main pool
   */
  setupErrorHandlers() {
    this.mainPool.on('connect', () => {
      logger.debug('PoolManager: connected to PostgreSQL main database');
    });

    this.mainPool.on('error', (err) => {
      logger.error('PoolManager: main pool connection error', { message: err.message });
    });
  }

  /**
   * Start cleanup interval to remove idle pools
   */
  startCleanupInterval() {
    // Cleanup every 5 minutes
    setInterval(() => {
      this.cleanupIdlePools();
    }, 5 * 60 * 1000);
  }

  /**
   * Cleanup pools that haven't been accessed recently
   * Also cleans up pools if we're at capacity (LRU eviction)
   */
  cleanupIdlePools() {
    const now = Date.now();
    const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    const poolsToRemove = [];

    // First, find idle pools
    for (const [dbName, lastAccess] of this.poolAccessTimes.entries()) {
      const idleTime = now - lastAccess;
      if (idleTime > IDLE_TIMEOUT) {
        poolsToRemove.push({ dbName, reason: 'idle', idleTime, priority: 1 });
      }
    }

    // If we're at max capacity, also evict least recently used pools
    if (this.agencyPools.size() >= this.maxPools) {
      // Sort by last access time (oldest first)
      const sortedPools = Array.from(this.poolAccessTimes.entries())
        .map(([dbName, lastAccess]) => ({
          dbName,
          lastAccess,
          idleTime: now - lastAccess
        }))
        .sort((a, b) => a.lastAccess - b.lastAccess)
        .slice(0, Math.floor(this.maxPools * 0.2)); // Remove oldest 20%

      for (const { dbName, idleTime } of sortedPools) {
        // Only add if not already in removal list
        if (!poolsToRemove.find(p => p.dbName === dbName)) {
          poolsToRemove.push({ dbName, reason: 'capacity', idleTime, priority: 2 });
        }
      }
    }

    // Perform cleanup
    for (const { dbName, reason, idleTime } of poolsToRemove) {
      const pool = this.agencyPools.get(dbName);
      if (pool) {
        const stats = this.poolUsageStats.get(dbName);
        const idleMinutes = Math.floor(idleTime / 60000);
        const queryCount = stats?.queryCount || 0;
        
        logger.debug('PoolManager: cleaning up idle pool', { database: dbName, reason, idleMinutes, queryCount });
        
        this.agencyPools.delete(dbName);
        this.poolAccessTimes.delete(dbName);
        this.poolUsageStats.delete(dbName);
        
        // Close pool gracefully (check if already closed)
        if (!pool._ending && !pool._ended) {
          pool._ending = true;
          pool.end().then(() => {
            pool._ended = true;
          }).catch(err => {
            // Only log if it's not the "more than once" error
            if (!err.message?.includes('more than once')) {
              logger.warn('PoolManager: error closing pool during cleanup', { database: dbName, message: err.message });
            }
          });
        }
      }
    }

    if (poolsToRemove.length > 0) {
      logger.debug('PoolManager: cleanup complete', { removed: poolsToRemove.length, active: this.agencyPools.size(), max: this.maxPools });
    }
  }

  /**
   * Get pool statistics
   */
  getStats() {
    const stats = {
      mainPool: {
        totalCount: this.mainPool.totalCount || 0,
        idleCount: this.mainPool.idleCount || 0,
        waitingCount: this.mainPool.waitingCount || 0,
      },
      agencyPools: {
        count: this.agencyPools.size(),
        maxPools: this.maxPools,
        maxConnectionsPerPool: this.maxConnectionsPerPool,
        utilization: `${this.agencyPools.size()}/${this.maxPools} (${Math.round((this.agencyPools.size() / this.maxPools) * 100)}%)`,
      },
      totalAgencyConnections: 0,
      poolDetails: [],
    };

    // Calculate total agency connections and get details
    for (const dbName of this.agencyPools.keys()) {
      const pool = this.agencyPools.get(dbName);
      const usageStats = this.poolUsageStats.get(dbName);
      const lastAccess = this.poolAccessTimes.get(dbName);
      
      if (pool) {
        const poolStats = {
          database: dbName,
          connections: pool.totalCount || 0,
          idle: pool.idleCount || 0,
          waiting: pool.waitingCount || 0,
          queryCount: usageStats?.queryCount || 0,
          lastUsed: lastAccess ? new Date(lastAccess).toISOString() : null,
          idleTime_ms: lastAccess ? Date.now() - lastAccess : null,
        };
        
        stats.totalAgencyConnections += poolStats.connections;
        stats.poolDetails.push(poolStats);
      }
    }

    return stats;
  }

  /**
   * Remove and close an agency pool by database name (e.g. before dropping the database)
   * @param {string} databaseName - Agency database name
   */
  removeAgencyPool(databaseName) {
    if (!databaseName || typeof databaseName !== 'string') return;
    const normalizedName = databaseName.trim();
    if (!normalizedName) return;

    const pool = this.agencyPools.get(normalizedName);
    if (pool) {
      this.agencyPools.delete(normalizedName);
      this.poolAccessTimes.delete(normalizedName);
      this.poolUsageStats.delete(normalizedName);
      if (typeof pool.end === 'function' && !pool._ending && !pool._ended) {
        pool._ending = true;
        pool.end().then(() => {
          pool._ended = true;
          logger.debug('PoolManager: removed and closed pool', { database: normalizedName });
        }).catch(err => {
          if (!err.message?.includes('more than once')) {
            logger.warn('PoolManager: error closing pool', { database: normalizedName, message: err.message });
          }
        });
      }
    }
  }

  /**
   * Close all pools (for graceful shutdown)
   */
  async closeAll() {
    logger.info('PoolManager: closing all connection pools');
    
    // Close all agency pools (check if already closed)
    for (const dbName of this.agencyPools.keys()) {
      const pool = this.agencyPools.get(dbName);
      if (pool && typeof pool.end === 'function' && !pool._ending && !pool._ended) {
        pool._ending = true;
        try {
          await pool.end();
          pool._ended = true;
          logger.debug('PoolManager: closed pool', { database: dbName });
        } catch (err) {
          // Only log if it's not the "more than once" error
          if (!err.message?.includes('more than once')) {
            logger.warn('PoolManager: error closing pool', { database: dbName, message: err.message });
          }
        }
      }
    }
    
    // Close main pool
    if (this.mainPool && typeof this.mainPool.end === 'function') {
      try {
        await this.mainPool.end();
        logger.debug('PoolManager: closed main pool');
      } catch (err) {
        logger.warn('PoolManager: error closing main pool', { message: err.message });
      }
    }
    
    this.agencyPools.clear();
    this.poolAccessTimes.clear();
    this.poolUsageStats.clear();
    logger.info('PoolManager: all pools closed');
  }
}

// Create singleton instance
const poolManager = new GlobalPoolManager();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('PoolManager: SIGTERM received, closing pools');
  await poolManager.closeAll();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('PoolManager: SIGINT received, closing pools');
  await poolManager.closeAll();
  process.exit(0);
});

/**
 * Parse DATABASE_URL and return connection components
 * Handles URL encoding for passwords with special characters
 * @returns {Object} { host, port, user, password }
 */
function parseDatabaseUrl() {
  const dbUrl = DATABASE_URL;
  // Get default port from environment
  const defaultPort = parseInt(process.env.POSTGRES_PORT || process.env.DATABASE_PORT || '5432', 10);
  
  if (!dbUrl || typeof dbUrl !== 'string') {
    logger.warn('PoolManager: DATABASE_URL not set or not a string, using defaults');
    // Return default values instead of throwing
    return {
      host: 'localhost',
      port: defaultPort,
      user: 'postgres',
      password: 'admin',
    };
  }

  try {
    // Try to parse as URL first
    let url;
    try {
      url = new URL(dbUrl);
      
      // Validate URL object has required properties
      if (!url || typeof url !== 'object') {
        throw new Error('Invalid URL object returned from URL constructor');
      }
      
      // If successful, decode components safely with fallbacks
      const host = url.hostname || 'localhost';
      const port = parseInt(url.port || defaultPort, 10) || defaultPort;
      const user = url.username ? decodeURIComponent(url.username) : 'postgres';
      const password = url.password ? decodeURIComponent(url.password) : 'admin';
      
      // Validate all values are defined
      if (!host || !user || password === undefined) {
        throw new Error('Missing required connection parameters');
      }
      
      return { host, port, user, password };
    } catch (urlError) {
      // If URL parsing fails (e.g., due to special characters in password),
      // parse manually using regex
      // Format: postgresql://user:password@host:port/database
      const match = dbUrl.match(/^postgresql:\/\/([^:@]+)(?::([^@]+))?@([^:]+)(?::(\d+))?\/(.+)$/);
      if (match) {
        const host = match[3] || 'localhost';
        const port = parseInt(match[4] || defaultPort, 10) || defaultPort;
        const user = match[1] ? decodeURIComponent(match[1]) : 'postgres';
        const password = match[2] ? decodeURIComponent(match[2]) : 'admin';
        
        if (!host || !user || password === undefined) {
          throw new Error('Missing required connection parameters from regex match');
        }
        
        return { host, port, user, password };
      }
      
      // Try alternative format without database
      const match2 = dbUrl.match(/^postgresql:\/\/([^:@]+)(?::([^@]+))?@([^:]+)(?::(\d+))?$/);
      if (match2) {
        const host = match2[3] || 'localhost';
        const port = parseInt(match2[4] || defaultPort, 10) || defaultPort;
        const user = match2[1] ? decodeURIComponent(match2[1]) : 'postgres';
        const password = match2[2] ? decodeURIComponent(match2[2]) : 'admin';
        
        if (!host || !user || password === undefined) {
          throw new Error('Missing required connection parameters from regex match2');
        }
        
        return { host, port, user, password };
      }
      
      throw new Error(`Invalid DATABASE_URL format: ${urlError.message}`);
    }
  } catch (error) {
    const safeUrl = dbUrl ? dbUrl.replace(/:[^:@]+@/, ':****@') : 'undefined';
    logger.error('PoolManager: error parsing DATABASE_URL', { message: error.message, urlMasked: safeUrl });
    logger.warn('PoolManager: using default connection parameters');
    // Return default values instead of throwing to prevent complete failure
    return {
      host: 'localhost',
      port: defaultPort,
      user: 'postgres',
      password: 'admin',
    };
  }
}

module.exports = {
  poolManager,
  getAgencyPool: (databaseName) => poolManager.getAgencyPool(databaseName),
  getMainPool: () => poolManager.getMainPool(),
  getPoolStats: () => poolManager.getStats(),
  removeAgencyPool: (databaseName) => poolManager.removeAgencyPool(databaseName),
  parseDatabaseUrl,
};
