// ==============================================
// Shared Helpers — Smart Supply Chain
// Distance calculations, ID generators, formatters
// ==============================================

const crypto = require('crypto');

/**
 * Calculate distance between two points using Haversine formula
 * @returns {number} Distance in kilometers
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Generate a unique ID with optional prefix
 */
function generateId(prefix = '') {
  const id = crypto.randomUUID();
  return prefix ? `${prefix}-${id.slice(0, 8)}` : id;
}

/**
 * Format duration from minutes to human-readable string
 */
function formatDuration(minutes) {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

/**
 * Format distance in km
 */
function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

/**
 * Determine transport mode based on distance and weight
 */
function selectTransportMode(distanceKm, weightKg) {
  if (weightKg >= 500) return 'water';
  if (distanceKm > 50) return 'air';
  return 'road';
}

/**
 * Random number in range
 */
function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Random latitude/longitude within Bangalore bounds
 */
function randomBangaloreLocation() {
  return {
    lat: randomInRange(12.85, 13.08),
    lng: randomInRange(77.45, 77.75),
  };
}

/**
 * Delay utility
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Clamp value between min and max
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

module.exports = {
  haversineDistance,
  generateId,
  formatDuration,
  formatDistance,
  selectTransportMode,
  randomInRange,
  randomBangaloreLocation,
  delay,
  clamp,
};
