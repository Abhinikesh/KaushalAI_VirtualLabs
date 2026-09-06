import initSqlJs from 'sql.js';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

let sqlJsPromise = null;

/**
 * Initializes and caches the sql.js WebAssembly runtime
 */
export async function getSqlJsEngine() {
  if (sqlJsPromise) {
    return sqlJsPromise;
  }

  sqlJsPromise = initSqlJs({
    locateFile: () => sqlWasmUrl
  }).catch((err) => {
    console.warn('Vite wasm url load failed, falling back to CDN:', err);
    return initSqlJs({
      locateFile: () => 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.wasm'
    });
  });

  return sqlJsPromise;
}

/**
 * Creates a fresh in-memory SQLite database and executes the schema setup SQL
 *
 * @param {string} schemaSql - DDL and seed INSERT statements
 * @returns {Promise<Database>} - Initialized sql.js database instance
 */
export async function createDatabaseFromSchema(schemaSql = '') {
  const SQL = await getSqlJsEngine();
  const db = new SQL.Database();

  if (schemaSql && schemaSql.trim().length > 0) {
    try {
      db.exec(schemaSql);
    } catch (err) {
      console.error('Error executing initial schema SQL:', err);
      throw new Error(`Schema Initialization Error: ${err.message}`);
    }
  }

  return db;
}

/**
 * Introspects the in-memory SQLite database to discover tables, columns, and sample preview records
 *
 * @param {Database} db - Active sql.js instance
 * @returns {Array<{ tableName: string, columns: Array<{ name: string, type: string, pk: boolean }>, sampleRows: Array<Array<any>> }>}
 */
export function introspectDatabaseSchema(db) {
  if (!db) return [];

  try {
    const tablesQuery = "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';";
    const tablesResult = db.exec(tablesQuery);

    if (!tablesResult || tablesResult.length === 0) return [];

    const tables = [];
    const tableNames = tablesResult[0].values.map((v) => v[0]);

    for (const tableName of tableNames) {
      // Introspect table structure
      const columnsQuery = `PRAGMA table_info("${tableName}");`;
      const colResult = db.exec(columnsQuery);
      const columns = colResult.length > 0
        ? colResult[0].values.map((row) => ({
            name: row[1],
            type: row[2] || 'ANY',
            notnull: Boolean(row[3]),
            pk: Boolean(row[5])
          }))
        : [];

      // Sample preview rows
      const sampleQuery = `SELECT * FROM "${tableName}" LIMIT 3;`;
      const sampleResult = db.exec(sampleQuery);
      const sampleRows = sampleResult.length > 0 ? sampleResult[0].values : [];

      tables.push({
        tableName,
        columns,
        sampleRows
      });
    }

    return tables;
  } catch (err) {
    console.warn('Schema introspection failed:', err);
    return [];
  }
}

/**
 * Executes a student SQL query against the in-memory SQLite database.
 *
 * @param {Database} db - Active sql.js database instance
 * @param {string} sqlQuery - The query entered by the learner
 * @returns {{ success: boolean, columns: Array<string>, rows: Array<Array<any>>, rowCount: number, executionTimeMs: number, error?: string }}
 */
export function executeSqlQuery(db, sqlQuery) {
  if (!db) {
    return {
      success: false,
      columns: [],
      rows: [],
      rowCount: 0,
      executionTimeMs: 0,
      error: 'Database is not initialized. Please refresh or reset the lab.'
    };
  }

  const queryText = (sqlQuery || '').trim();
  if (!queryText) {
    return {
      success: false,
      columns: [],
      rows: [],
      rowCount: 0,
      executionTimeMs: 0,
      error: 'Query is empty. Please enter a SQL statement.'
    };
  }

  const startTime = performance.now();

  try {
    const res = db.exec(queryText);
    const executionTimeMs = Math.round(performance.now() - startTime);

    if (!res || res.length === 0) {
      return {
        success: true,
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs,
        message: 'Query executed successfully with no returned rows.'
      };
    }

    // Capture the last result set in case multiple statements were executed
    const lastResult = res[res.length - 1];
    const columns = lastResult.columns || [];
    const rows = lastResult.values || [];

    return {
      success: true,
      columns,
      rows,
      rowCount: rows.length,
      executionTimeMs
    };
  } catch (err) {
    const executionTimeMs = Math.round(performance.now() - startTime);
    let cleanMessage = err.message || String(err);

    // Format common SQLite syntax error messages
    if (cleanMessage.includes('near "') || cleanMessage.includes('syntax error')) {
      cleanMessage = `Syntax Error: ${cleanMessage}`;
    } else if (cleanMessage.includes('no such table')) {
      cleanMessage = `Table Not Found: ${cleanMessage}`;
    } else if (cleanMessage.includes('no such column')) {
      cleanMessage = `Column Not Found: ${cleanMessage}`;
    }

    return {
      success: false,
      columns: [],
      rows: [],
      rowCount: 0,
      executionTimeMs,
      error: cleanMessage
    };
  }
}
