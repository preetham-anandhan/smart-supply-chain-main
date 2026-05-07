// ==============================================
// Redis / In-Memory Cache
// ==============================================

const ENV = require('./env');
const { createLogger } = require('../../../shared/utils/logger');
const log = createLogger('REDIS');

// Simple in-memory cache as Redis fallback
const cache = new Map();

const redisClient = {
  async get(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      cache.delete(key);
      return null;
    }
    return entry.value;
  },

  async set(key, value, ttlSeconds = null) {
    const entry = { value };
    if (ttlSeconds) {
      entry.expiresAt = Date.now() + ttlSeconds * 1000;
    }
    cache.set(key, entry);
  },

  async del(key) {
    cache.delete(key);
  },

  async flush() {
    cache.clear();
  },
};

if (ENV.USE_IN_MEMORY_REDIS) {
  log.info('Using in-memory cache (Redis not connected)');
} else {
  log.warn('Production Redis not configured — using in-memory cache');
}

module.exports = redisClient;
