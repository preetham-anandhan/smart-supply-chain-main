// ==============================================
// Routing Service — Calls AI Engine for routes
// ==============================================

const aiClient = require('../ai/aiClient');
const cache = require('../config/redis');
const { createLogger } = require('../../../shared/utils/logger');

const log = createLogger('ROUTING');

/**
 * Get optimized route between two points, with caching.
 */
async function getOptimizedRoute(source, destination, options = {}) {
  const cacheKey = `route:${source.lat},${source.lng}:${destination.lat},${destination.lng}:${options.mode || 'balanced'}`;

  // Check cache first
  const cached = await cache.get(cacheKey);
  if (cached) {
    log.debug('Route cache hit', { cacheKey });
    return JSON.parse(cached);
  }

  const route = await aiClient.optimizeRoute({
    source_lat: source.lat,
    source_lng: source.lng,
    dest_lat: destination.lat,
    dest_lng: destination.lng,
    traffic_factor: options.traffic_factor || 1.0,
    weather_factor: options.weather_factor || 1.0,
    optimization_mode: options.mode || 'balanced',
  });

  // Cache for 5 minutes
  await cache.set(cacheKey, JSON.stringify(route), 300);
  log.info(`Route computed: ${route.primary_route?.distance_km || 0} km`);

  return route;
}

module.exports = { getOptimizedRoute };
