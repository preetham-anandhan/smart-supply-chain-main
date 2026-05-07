// ==============================================
// ETA Service — Predict delivery times via AI
// ==============================================

const aiClient = require('../ai/aiClient');
const { createLogger } = require('../../../shared/utils/logger');

const log = createLogger('ETA');

/**
 * Get ETA prediction for a given distance and conditions.
 */
async function predictETA(distanceKm, options = {}) {
  try {
    const result = await aiClient.predictETA({
      distance_km: distanceKm,
      traffic_factor: options.traffic_factor || 1.0,
      weather_factor: options.weather_factor || 1.0,
      hour: options.hour || new Date().getHours(),
      num_stops: options.num_stops || 0,
    });

    log.debug(`ETA predicted: ${result.predicted_eta_min} min for ${distanceKm} km`);
    return result;
  } catch (err) {
    log.error('ETA prediction failed', err.message);
    // Fallback: simple calculation
    const fallbackEta = (distanceKm / 30) * 60;
    return {
      predicted_eta_min: Math.round(fallbackEta),
      confidence: 0.3,
      breakdown: { base_travel_min: Math.round(fallbackEta) },
    };
  }
}

module.exports = { predictETA };
