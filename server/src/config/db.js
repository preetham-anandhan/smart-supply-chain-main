// ==============================================
// Database Connection — PostgreSQL / In-Memory
// ==============================================

const ENV = require('./env');
const { createLogger } = require('../../../shared/utils/logger');
const log = createLogger('DB');

// ── In-Memory Store (development fallback) ─────────────────────
const inMemoryStore = {
  shipments: [],
  vehicles: [],
  warehouses: [],
  routes: [],
};

// ── PostgreSQL Pool (production) ───────────────────────────────
let pool = null;

if (!ENV.USE_IN_MEMORY_DB) {
  try {
    const { Pool } = require('pg');
    pool = new Pool({
      host: ENV.DB_HOST,
      port: ENV.DB_PORT,
      database: ENV.DB_NAME,
      user: ENV.DB_USER,
      password: ENV.DB_PASSWORD,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      log.error('Unexpected PostgreSQL pool error', err.message);
    });

    log.info(`PostgreSQL pool created → ${ENV.DB_HOST}:${ENV.DB_PORT}/${ENV.DB_NAME}`);
  } catch (err) {
    log.error('Failed to initialize PostgreSQL pool — falling back to in-memory', err.message);
  }
}

/**
 * Execute a SQL query against PostgreSQL.
 * @param {string} text - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
async function query(text, params) {
  if (!pool) {
    throw new Error('PostgreSQL pool is not initialized. Set USE_IN_MEMORY_DB=false and ensure pg is installed.');
  }
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  log.info(`Query executed in ${duration}ms — rows: ${result.rowCount}`);
  return result;
}

/**
 * Get a reference to the data store.
 * In development (USE_IN_MEMORY_DB=true), returns the in-memory store.
 * In production, returns the in-memory store (controllers still use it as cache).
 */
function getStore() {
  return inMemoryStore;
}

/**
 * Seed the in-memory store with mock data.
 */
function seedStore(store) {
  const shipments = require('../../../data/mock/shipments.json');
  const vehicles = require('../../../data/mock/vehicles.json');
  const warehouses = require('../../../data/mock/warehouses.json');

  store.shipments = JSON.parse(JSON.stringify(shipments));
  store.vehicles = JSON.parse(JSON.stringify(vehicles));
  store.warehouses = JSON.parse(JSON.stringify(warehouses));

  log.info(`Seeded store: ${store.shipments.length} shipments, ${store.vehicles.length} vehicles, ${store.warehouses.length} warehouses`);
}

/**
 * Test the PostgreSQL connection and verify tables exist.
 * @returns {Promise<boolean>}
 */
async function initDB() {
  if (ENV.USE_IN_MEMORY_DB || !pool) {
    log.info('Using in-memory database');
    return true;
  }

  try {
    const result = await pool.query('SELECT NOW() AS now');
    log.info(`PostgreSQL connected — server time: ${result.rows[0].now}`);

    // Check if tables exist
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    const tableNames = tables.rows.map(r => r.table_name);
    log.info(`Tables found: ${tableNames.join(', ') || '(none)'}`);

    const required = ['shipments', 'vehicles', 'warehouses'];
    const missing = required.filter(t => !tableNames.includes(t));
    if (missing.length > 0) {
      log.warn(`Missing tables: ${missing.join(', ')} — run schema.sql to create them`);
    }

    return true;
  } catch (err) {
    log.error('PostgreSQL connection failed', err.message);
    return false;
  }
}

/**
 * Get the pg Pool instance (for advanced usage).
 */
function getPool() {
  return pool;
}

module.exports = { getStore, seedStore, query, initDB, getPool };
