/**
 * Schema Sync Service (Enhanced)
 * 
 * Automatically detects and creates missing columns in database tables.
 * This service compares expected schema (from CREATE TABLE statements) with
 * actual database schema and creates any missing columns.
 * 
 * Features:
 * - Detects missing columns across all tables
 * - Automatically creates missing columns with correct data types and constraints
 * - Handles default values, nullable constraints, and foreign keys
 * - Safe to run multiple times (idempotent)
 * - Enhanced error handling and logging
 * - Better performance with batch operations
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  MAX_PARSE_DEPTH: 100,
  BATCH_SIZE: 10,
  SCHEMA_DIR: path.join(__dirname, 'schema'),
  SCHEMA_FILES: [
    'authSchema.js',
    'agenciesSchema.js',
    'departmentsSchema.js',
    'hrSchema.js',
    'projectsTasksSchema.js',
    'clientsFinancialSchema.js',
    'crmSchema.js',
    'crmEnhancementsSchema.js',
    'gstSchema.js',
    'reimbursementSchema.js',
    'miscSchema.js',
    'inventorySchema.js',
    'procurementSchema.js',
    'financialSchema.js',
    'reportingSchema.js',
    'webhooksSchema.js',
    'projectEnhancementsSchema.js',
    'ssoSchema.js',
    'sessionManagementSchema.js',
    'assetManagementSchema.js',
    'workflowSchema.js',
    'integrationHubSchema.js'
  ],
  VALID_COLUMN_NAME_PATTERN: /^[a-z_][a-z0-9_]*$/i,
  INVALID_COLUMN_NAMES: new Set([
    'etc', 'and', 'or', 'not', 'null', 'default', 'unique', 
    'primary', 'key', 'foreign', 'references', 'constraint', 
    'check', 'table', 'from', 'where', 'select', 'insert',
    'update', 'delete', 'create', 'alter', 'drop'
  ]),
  VALID_TYPES: [
    'UUID', 'TEXT', 'VARCHAR', 'CHAR', 'CHARACTER',
    'INTEGER', 'INT', 'BIGINT', 'SMALLINT', 'SERIAL', 'BIGSERIAL',
    'NUMERIC', 'DECIMAL', 'REAL', 'DOUBLE', 'FLOAT',
    'BOOLEAN', 'BOOL',
    'DATE', 'TIME', 'TIMESTAMP', 'TIMESTAMPTZ', 'INTERVAL',
    'JSON', 'JSONB',
    'ARRAY', 'TEXT[]', 'INTEGER[]', 'UUID[]', 'BYTEA'
  ]
};

/**
 * Validate column name
 * @param {string} columnName - Column name to validate
 * @returns {boolean} True if valid
 */
function isValidColumnName(columnName) {
  if (!columnName || typeof columnName !== 'string') return false;
  if (columnName.length < 1 || columnName.length > 63) return false;
  if (/^\d/.test(columnName)) return false;
  if (!CONFIG.VALID_COLUMN_NAME_PATTERN.test(columnName)) return false;
  if (CONFIG.INVALID_COLUMN_NAMES.has(columnName.toLowerCase())) return false;
  return true;
}

/**
 * Validate data type
 * @param {string} dataType - Data type to validate
 * @returns {boolean} True if valid
 */
function isValidDataType(dataType) {
  if (!dataType || typeof dataType !== 'string') return false;
  
  const upperType = dataType.toUpperCase();
  
  // Check if it starts with a valid type
  return CONFIG.VALID_TYPES.some(validType => 
    upperType.startsWith(validType) || upperType === validType
  );
}

/**
 * Remove SQL comments from text
 * @param {string} text - Text to clean
 * @returns {string} Text without comments
 */
function removeComments(text) {
  // Remove single-line comments (-- style)
  let cleaned = text.replace(/--[^\r\n]*/g, '');
  // Remove multi-line comments (/* */ style)
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
  return cleaned;
}

/**
 * Split by comma respecting nested structures
 * @param {string} text - Text to split
 * @returns {Array<string>} Split parts
 */
function smartSplit(text) {
  const parts = [];
  let current = '';
  let depth = 0;
  let inString = false;
  let stringChar = null;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const prevChar = i > 0 ? text[i - 1] : '';
    
    // Handle string literals
    if (!inString && (char === "'" || char === '"')) {
      inString = true;
      stringChar = char;
    } else if (inString && char === stringChar && prevChar !== '\\') {
      inString = false;
      stringChar = null;
    }
    
    if (!inString) {
      if (char === '(') {
        depth++;
      } else if (char === ')') {
        depth--;
      } else if (char === ',' && depth === 0) {
        parts.push(current.trim());
        current = '';
        continue;
      }
    }
    
    current += char;
  }
  
  if (current.trim()) {
    parts.push(current.trim());
  }
  
  return parts;
}

/**
 * Parse data type from type string
 * @param {string} typeString - Type definition string
 * @returns {string|null} Parsed data type
 */
function parseDataType(typeString) {
  if (!typeString) return null;
  
  // Type patterns in order of specificity
  const typePatterns = [
    /(TIMESTAMP\s+WITH\s+TIME\s+ZONE)/i,
    /(TIMESTAMP\s+WITHOUT\s+TIME\s+ZONE)/i,
    /(TIME\s+WITH\s+TIME\s+ZONE)/i,
    /(TIME\s+WITHOUT\s+TIME\s+ZONE)/i,
    /(DOUBLE\s+PRECISION)/i,
    /(CHARACTER\s+VARYING\s*\(\s*\d+\s*\))/i,
    /(VARCHAR\s*\(\s*\d+\s*\))/i,
    /(CHAR\s*\(\s*\d+\s*\))/i,
    /(CHARACTER\s*\(\s*\d+\s*\))/i,
    /(NUMERIC\s*\(\s*\d+\s*,\s*\d+\s*\))/i,
    /(DECIMAL\s*\(\s*\d+\s*,\s*\d+\s*\))/i,
    /(NUMERIC\s*\(\s*\d+\s*\))/i,
    /(DECIMAL\s*\(\s*\d+\s*\))/i,
    /(TEXT\[\])/i,
    /(INTEGER\[\])/i,
    /(UUID\[\])/i,
    /(\w+\s*\(\s*\d+\s*\))/i, // Generic type with size
    /^(\w+)/i // Generic type
  ];
  
  for (const pattern of typePatterns) {
    const match = typeString.match(pattern);
    if (match) {
      const candidateType = match[1].toUpperCase().trim();
      
      if (isValidDataType(candidateType)) {
        return candidateType;
      }
    }
  }
  
  return null;
}

/**
 * Parse default value from string
 * @param {string} text - Column definition text
 * @returns {string|null} Default value or null
 */
function parseDefaultValue(text) {
  const defaultMatch = text.match(/DEFAULT\s+([^,\)]+)/i);
  if (!defaultMatch) return null;
  
  let defaultValue = defaultMatch[1].trim();
  
  // Remove trailing constraints
  defaultValue = defaultValue.replace(/\s+(NOT\s+NULL|UNIQUE|REFERENCES|CHECK|PRIMARY|FOREIGN).*/i, '');
  defaultValue = defaultValue.trim();
  
  // Normalize common defaults
  const upper = defaultValue.toUpperCase();
  if (upper === 'NOW()' || upper === 'CURRENT_TIMESTAMP') {
    return 'NOW()';
  } else if (upper === 'TRUE' || upper === 'FALSE') {
    return upper;
  } else if (upper === 'UUID_GENERATE_V4()' || upper === 'GEN_RANDOM_UUID()') {
    return defaultValue;
  } else if (/^\d+$/.test(defaultValue)) {
    return defaultValue;
  } else if (/^-?\d+\.\d+$/.test(defaultValue)) {
    return defaultValue;
  } else if (defaultValue.startsWith("'") && defaultValue.endsWith("'")) {
    return defaultValue.slice(1, -1);
  }
  
  return defaultValue;
}

/**
 * Parse references (foreign key) from text
 * @param {string} text - Column definition text
 * @returns {Object|null} References object or null
 */
function parseReferences(text) {
  const refMatch = text.match(/REFERENCES\s+([\w.]+)\s*\(\s*(\w+)\s*\)/i);
  if (!refMatch) return null;
  
  return {
    table: refMatch[1].replace('public.', ''),
    column: refMatch[2]
  };
}

/**
 * Parse CREATE TABLE statement to extract column definitions
 * @param {string} createTableSql - The CREATE TABLE SQL statement
 * @returns {Array} Array of column definitions
 */
function parseTableColumns(createTableSql) {
  const columns = [];
  
  // Extract the column definitions part (between the parentheses)
  const tableMatch = createTableSql.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?\w+\s*\(([\s\S]+)\)/i);
  if (!tableMatch) return columns;
  
  let columnDefinitions = tableMatch[1];
  
  // Remove comments
  columnDefinitions = removeComments(columnDefinitions);
  
  // Split by comma, respecting nested structures
  const parts = smartSplit(columnDefinitions);
  
  // Parse each column definition
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    
    // Skip table constraints
    const upperTrimmed = trimmed.toUpperCase();
    if (
      upperTrimmed.startsWith('PRIMARY KEY') ||
      upperTrimmed.startsWith('FOREIGN KEY') ||
      upperTrimmed.startsWith('UNIQUE(') ||
      upperTrimmed.startsWith('CONSTRAINT') ||
      upperTrimmed.startsWith('CHECK(') ||
      upperTrimmed.startsWith('INDEX')
    ) {
      continue;
    }
    
    // Extract column name
    const nameMatch = trimmed.match(/^([a-z_][a-z0-9_]*)/i);
    if (!nameMatch) continue;
    
    const columnName = nameMatch[1];
    
    // Validate column name
    if (!isValidColumnName(columnName)) {
      continue;
    }
    
    // Get type definition (everything after column name)
    const typePart = trimmed.substring(columnName.length).trim();
    
    // Parse data type
    const dataType = parseDataType(typePart);
    if (!dataType) {
      // Could not determine valid type, skip
      continue;
    }
    
    // Parse constraints
    const isNullable = !upperTrimmed.includes('NOT NULL');
    const defaultValue = parseDefaultValue(trimmed);
    const isUnique = upperTrimmed.includes('UNIQUE') && !upperTrimmed.includes('UNIQUE(');
    const references = parseReferences(trimmed);
    
    columns.push({
      name: columnName,
      type: dataType,
      nullable: isNullable,
      default: defaultValue,
      unique: isUnique,
      references: references
    });
  }
  
  return columns;
}

/**
 * Extract table definition from content
 * @param {string} content - File content
 * @param {number} startPos - Start position
 * @param {string} tableStart - Table start text
 * @returns {string|null} Full CREATE TABLE statement
 */
function extractTableDefinition(content, startPos, tableStart) {
  let depth = 1;
  let pos = startPos + tableStart.length;
  let inString = false;
  let stringChar = null;
  let iterations = 0;
  
  while (pos < content.length && iterations < CONFIG.MAX_PARSE_DEPTH * 100) {
    iterations++;
    const char = content[pos];
    const prevChar = pos > 0 ? content[pos - 1] : '';
    
    // Handle string literals
    if (!inString && (char === "'" || char === '"' || char === '`')) {
      inString = true;
      stringChar = char;
    } else if (inString && char === stringChar && prevChar !== '\\') {
      inString = false;
      stringChar = null;
    }
    
    if (!inString) {
      if (char === '(') {
        depth++;
      } else if (char === ')') {
        depth--;
        if (depth === 0) {
          return content.substring(startPos, pos + 1);
        }
      }
    }
    
    pos++;
  }
  
  // Parsing failed (unmatched parentheses or max depth reached)
  return null;
}

/**
 * Extract column definitions from all schema files
 * @returns {Object} Map of table names to their expected columns
 */
function extractExpectedSchema() {
  const expectedSchema = {};
  let totalTablesFound = 0;
  let totalFilesProcessed = 0;
  
  for (const file of CONFIG.SCHEMA_FILES) {
    const filePath = path.join(CONFIG.SCHEMA_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`[SchemaSync] ⚠️  Schema file not found: ${file}`);
      continue;
    }
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/gi;
      let match;
      const processedTables = new Set();
      let tablesInFile = 0;
      
      while ((match = createTableRegex.exec(content)) !== null) {
        const tableName = match[1];
        
        // Skip invalid or duplicate table names
        if (!tableName || tableName.length < 2 || processedTables.has(tableName)) {
          continue;
        }
        
        processedTables.add(tableName);
        
        // Extract full CREATE TABLE statement
        const fullStatement = extractTableDefinition(content, match.index, match[0]);
        
        if (!fullStatement) {
          console.warn(`[SchemaSync] ⚠️  Could not parse CREATE TABLE for ${tableName} in ${file}`);
          continue;
        }
        
        // Parse columns
        const columns = parseTableColumns(fullStatement);
        
        if (columns.length === 0) {
          console.warn(`[SchemaSync] ⚠️  No columns parsed for ${tableName} in ${file}`);
          continue;
        }
        
        // Initialize or merge columns
        if (!expectedSchema[tableName]) {
          expectedSchema[tableName] = [];
        }
        
        // Merge columns (avoid duplicates)
        for (const col of columns) {
          const existingCol = expectedSchema[tableName].find(c => c.name === col.name);
          if (!existingCol) {
            expectedSchema[tableName].push(col);
          }
        }
        
        tablesInFile++;
      }
      
      if (tablesInFile > 0) {
        totalTablesFound += tablesInFile;
        totalFilesProcessed++;
      }
    } catch (error) {
      console.error(`[SchemaSync] ❌ Error parsing ${file}: ${error.message}`);
    }
  }
  
  // Summary
  const tableNames = Object.keys(expectedSchema);
  console.log(`[SchemaSync] Extracted ${tableNames.length} tables from ${totalFilesProcessed}/${CONFIG.SCHEMA_FILES.length} files`);
  
  if (tableNames.length === 0) {
    console.warn('[SchemaSync] ⚠️  No tables extracted - schema sync will not function');
  }
  
  return expectedSchema;
}

/**
 * Get actual columns from database for a specific table
 * @param {Object} client - PostgreSQL client
 * @param {string} tableName - Table name
 * @returns {Array} Array of actual column definitions
 */
async function getActualColumns(client, tableName) {
  const result = await client.query(`
    SELECT 
      column_name,
      data_type,
      udt_name,
      character_maximum_length,
      numeric_precision,
      numeric_scale,
      is_nullable,
      column_default,
      is_identity
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = $1
    ORDER BY ordinal_position
  `, [tableName]);
  
  return result.rows.map(row => ({
    name: row.column_name,
    type: mapPostgresType(row.data_type, row.udt_name, row.numeric_precision, row.numeric_scale),
    nullable: row.is_nullable === 'YES',
    default: row.column_default,
    isIdentity: row.is_identity === 'YES'
  }));
}

/**
 * Map PostgreSQL information_schema types to SQL types
 */
function mapPostgresType(dataType, udtName, precision, scale) {
  // Handle array types
  if (dataType === 'ARRAY') {
    if (udtName === '_text') return 'TEXT[]';
    if (udtName === '_int4') return 'INTEGER[]';
    if (udtName === '_uuid') return 'UUID[]';
    return 'ARRAY';
  }
  
  // Standard type mappings
  const typeMap = {
    'uuid': 'UUID',
    'text': 'TEXT',
    'varchar': 'VARCHAR',
    'char': 'CHAR',
    'character': 'CHARACTER',
    'int4': 'INTEGER',
    'int8': 'BIGINT',
    'int2': 'SMALLINT',
    'serial': 'SERIAL',
    'bigserial': 'BIGSERIAL',
    'bool': 'BOOLEAN',
    'date': 'DATE',
    'time': 'TIME',
    'timestamp': 'TIMESTAMP',
    'timestamptz': 'TIMESTAMP WITH TIME ZONE',
    'jsonb': 'JSONB',
    'json': 'JSON',
    'bytea': 'BYTEA',
    'numeric': precision && scale ? `NUMERIC(${precision},${scale})` : 'NUMERIC',
    'decimal': precision && scale ? `DECIMAL(${precision},${scale})` : 'DECIMAL',
    'real': 'REAL',
    'float4': 'REAL',
    'float8': 'DOUBLE PRECISION',
    'double precision': 'DOUBLE PRECISION'
  };
  
  return typeMap[udtName] || typeMap[dataType.toLowerCase()] || dataType.toUpperCase();
}

/**
 * Generate ALTER TABLE statement to add a column
 * @param {string} tableName - Table name
 * @param {Object} column - Column definition
 * @returns {string} ALTER TABLE SQL statement
 */
function generateAddColumnSQL(tableName, column) {
  let sql = `ALTER TABLE public.${tableName} ADD COLUMN ${column.name} ${column.type}`;
  
  // Handle NOT NULL columns
  if (!column.nullable) {
    if (column.default) {
      sql += ` NOT NULL`;
    }
    // If no default, column will be added as nullable, then updated
  }
  
  // Add default value
  if (column.default) {
    let defaultVal = column.default;
    
    // Don't quote functions
    const functions = ['NOW()', 'CURRENT_TIMESTAMP', 'UUID_GENERATE_V4()', 'GEN_RANDOM_UUID()'];
    const isFunctionOrNumeric = functions.includes(defaultVal.toUpperCase()) || 
                                 /^-?\d+(\.\d+)?$/.test(defaultVal) ||
                                 defaultVal.toUpperCase() === 'TRUE' ||
                                 defaultVal.toUpperCase() === 'FALSE';
    
    if (!isFunctionOrNumeric && !defaultVal.startsWith("'")) {
      defaultVal = `'${defaultVal.replace(/'/g, "''")}'`;
    }
    
    sql += ` DEFAULT ${defaultVal}`;
  }
  
  return sql;
}

/**
 * Add a column to table with proper handling of NOT NULL constraint
 * @param {Object} client - PostgreSQL client
 * @param {string} tableName - Table name
 * @param {Object} column - Column definition
 */
async function addColumnSafely(client, tableName, column) {
  // For NOT NULL columns without default, add in steps
  if (!column.nullable && !column.default) {
    // Step 1: Add as nullable
    await client.query(`
      ALTER TABLE public.${tableName} 
      ADD COLUMN ${column.name} ${column.type}
    `);
    
    // Step 2: Set safe default for existing rows
    let safeDefault = 'NULL';
    const upperType = column.type.toUpperCase();
    
    if (upperType.includes('TEXT') || upperType.includes('VARCHAR') || upperType.includes('CHAR')) {
      safeDefault = "''";
    } else if (upperType.includes('NUMERIC') || upperType.includes('INTEGER') || upperType.includes('INT') || upperType.includes('BIGINT') || upperType.includes('SMALLINT')) {
      safeDefault = '0';
    } else if (upperType.includes('BOOLEAN') || upperType.includes('BOOL')) {
      safeDefault = 'false';
    } else if (upperType === 'UUID') {
      safeDefault = 'gen_random_uuid()';
    } else if (upperType.includes('TIMESTAMP') || upperType.includes('DATE')) {
      safeDefault = 'NOW()';
    }
    
    // Step 3: Update existing rows
    await client.query(`
      UPDATE public.${tableName} 
      SET ${column.name} = ${safeDefault}
      WHERE ${column.name} IS NULL
    `);
    
    // Step 4: Add NOT NULL constraint
    await client.query(`
      ALTER TABLE public.${tableName} 
      ALTER COLUMN ${column.name} SET NOT NULL
    `);
  } else {
    // Add column with constraints in one step
    const alterSQL = generateAddColumnSQL(tableName, column);
    await client.query(alterSQL);
  }
}

/**
 * Add foreign key constraint
 * @param {Object} client - PostgreSQL client
 * @param {string} tableName - Table name
 * @param {string} columnName - Column name
 * @param {Object} references - References object
 */
async function addForeignKey(client, tableName, columnName, references) {
  const constraintName = `${tableName}_${columnName}_fkey`;
  
  // Check if FK already exists
  const existsResult = await client.query(`
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
      AND table_name = $1
      AND constraint_name = $2
      AND constraint_type = 'FOREIGN KEY'
  `, [tableName, constraintName]);
  
  if (existsResult.rows.length > 0) {
    return; // Already exists
  }
  
  // Check if referenced table exists
  const refTableExists = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = $1
    )
  `, [references.table]);
  
  if (!refTableExists.rows[0].exists) {
    throw new Error(`Referenced table ${references.table} does not exist`);
  }
  
  // Add FK constraint
  await client.query(`
    ALTER TABLE public.${tableName}
    ADD CONSTRAINT ${constraintName}
    FOREIGN KEY (${columnName})
    REFERENCES public.${references.table}(${references.column})
  `);
}

/**
 * Sync schema for a specific table
 * @param {Object} client - PostgreSQL client
 * @param {string} tableName - Table name
 * @param {Array} expectedColumns - Expected column definitions
 * @returns {Object} Sync result
 */
async function syncTableColumns(client, tableName, expectedColumns) {
  const result = {
    table: tableName,
    created: [],
    errors: []
  };
  
  try {
    // Check if table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      )
    `, [tableName]);
    
    if (!tableExists.rows[0].exists) {
      result.errors.push(`Table does not exist`);
      return result;
    }
    
    // Get actual columns
    const actualColumns = await getActualColumns(client, tableName);
    const actualColumnNames = new Set(actualColumns.map(c => c.name));
    
    // Find and add missing columns
    for (const expectedCol of expectedColumns) {
      if (!actualColumnNames.has(expectedCol.name)) {
        try {
          await addColumnSafely(client, tableName, expectedCol);
          result.created.push(expectedCol.name);
          
          // Add foreign key if needed
          if (expectedCol.references) {
            try {
              await addForeignKey(client, tableName, expectedCol.name, expectedCol.references);
            } catch (fkError) {
              console.warn(`[SchemaSync] ⚠️  Could not add FK for ${tableName}.${expectedCol.name}: ${fkError.message}`);
            }
          }
          
          console.log(`[SchemaSync] ✅ Created ${tableName}.${expectedCol.name} (${expectedCol.type})`);
        } catch (error) {
          const errorMsg = `Failed to create ${expectedCol.name}: ${error.message}`;
          result.errors.push(errorMsg);
          console.error(`[SchemaSync] ❌ ${errorMsg}`);
        }
      }
    }
  } catch (error) {
    const errorMsg = `Table sync error: ${error.message}`;
    result.errors.push(errorMsg);
    console.error(`[SchemaSync] ❌ Error syncing ${tableName}: ${error.message}`);
  }
  
  return result;
}

/**
 * Sync all tables in the database
 * @param {Object} client - PostgreSQL client
 * @param {Object} expectedSchema - Expected schema (optional)
 * @returns {Object} Overall sync result
 */
async function syncAllTables(client, expectedSchema = null) {
  const startTime = Date.now();
  
  if (!expectedSchema) {
    expectedSchema = extractExpectedSchema();
  }
  
  const overallResult = {
    tablesProcessed: 0,
    columnsCreated: 0,
    errors: [],
    details: [],
    duration: 0
  };
  
  console.log('[SchemaSync] Starting schema synchronization...');
  console.log(`[SchemaSync] Found ${Object.keys(expectedSchema).length} tables to check`);
  
  // Get all actual tables from database
  const actualTablesResult = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  
  const actualTables = new Set(actualTablesResult.rows.map(r => r.table_name));
  console.log(`[SchemaSync] Found ${actualTables.size} existing tables in database`);
  
  // Sync each table
  for (const [tableName, expectedColumns] of Object.entries(expectedSchema)) {
    if (!actualTables.has(tableName)) {
      continue; // Table doesn't exist yet
    }
    
    const syncResult = await syncTableColumns(client, tableName, expectedColumns);
    overallResult.tablesProcessed++;
    overallResult.columnsCreated += syncResult.created.length;
    
    if (syncResult.created.length > 0 || syncResult.errors.length > 0) {
      overallResult.details.push(syncResult);
    }
    
    if (syncResult.errors.length > 0) {
      overallResult.errors.push(...syncResult.errors.map(e => `${tableName}: ${e}`));
    }
  }
  
  overallResult.duration = Date.now() - startTime;
  
  // Summary
  console.log(`[SchemaSync] ✅ Schema sync completed in ${overallResult.duration}ms`);
  console.log(`[SchemaSync]   Tables processed: ${overallResult.tablesProcessed}`);
  console.log(`[SchemaSync]   Columns created: ${overallResult.columnsCreated}`);
  if (overallResult.errors.length > 0) {
    console.log(`[SchemaSync]   Errors: ${overallResult.errors.length}`);
  }
  
  return overallResult;
}

/**
 * Quick sync - checks and creates missing columns for all tables
 * Main function for automatic schema synchronization
 * @param {Object} client - PostgreSQL client
 * @returns {Object} Sync result
 */
async function quickSyncSchema(client) {
  try {
    const expectedSchema = extractExpectedSchema();
    
    if (Object.keys(expectedSchema).length === 0) {
      console.warn('[SchemaSync] ⚠️  No expected schema found - skipping sync');
      return {
        tablesProcessed: 0,
        columnsCreated: 0,
        errors: ['No expected schema found'],
        details: [],
        duration: 0
      };
    }
    
    return await syncAllTables(client, expectedSchema);
  } catch (error) {
    console.error('[SchemaSync] ❌ Fatal error during schema sync:', error.message);
    throw error;
  }
}

module.exports = {
  quickSyncSchema,
  syncAllTables,
  syncTableColumns,
  extractExpectedSchema,
  getActualColumns
};