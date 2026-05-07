// ==============================================
// AI Client — HTTP bridge to Python AI Engine
// ==============================================

const axios = require('axios');
const ENV = require('../config/env');
const { createLogger } = require('../../../shared/utils/logger');

const log = createLogger('AI-CLIENT');

const client = axios.create({
  baseURL: `${ENV.AI_ENGINE_URL}/api/v1`,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Optimize a route between two points.
 */
async function optimizeRoute(params) {
  try {
    const { data } = await client.post('/optimize-route', params);
    return data;
  } catch (err) {
    log.error('AI route optimization failed', err.message);
    throw new Error('AI Engine unavailable — route optimization failed');
  }
}

/**
 * Predict ETA for a delivery.
 */
async function predictETA(params) {
  try {
    const { data } = await client.post('/predict-eta', params);
    return data;
  } catch (err) {
    log.error('AI ETA prediction failed', err.message);
    throw new Error('AI Engine unavailable — ETA prediction failed');
  }
}

/**
 * Aggregate parcels into delivery batches.
 */
async function aggregateParcels(parcels, numVehicles = 5) {
  try {
    const { data } = await client.post('/aggregate-parcels', {
      parcels,
      num_vehicles: numVehicles,
    });
    return data;
  } catch (err) {
    log.error('AI aggregation failed', err.message);
    throw new Error('AI Engine unavailable — aggregation failed');
  }
}

/**
 * Detect disruptions / delays.
 */
async function detectDisruption(params) {
  try {
    const { data } = await client.post('/detect-disruption', params);
    return data;
  } catch (err) {
    log.error('AI disruption detection failed', err.message);
    throw new Error('AI Engine unavailable — disruption detection failed');
  }
}

/**
 * Get current traffic/weather conditions.
 */
async function getConditions() {
  try {
    const { data } = await client.get('/conditions');
    return data;
  } catch (err) {
    log.warn('AI conditions unavailable, using defaults');
    return { traffic_factor: 1.0, weather: { condition: 'clear', factor: 1.0, risk: 0.0 } };
  }
}

/**
 * Health check for AI engine.
 */
async function healthCheck() {
  try {
    const { data } = await client.get('/health');
    return { connected: true, ...data };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}

module.exports = {
  optimizeRoute,
  predictETA,
  aggregateParcels,
  detectDisruption,
  getConditions,
  healthCheck,
};
