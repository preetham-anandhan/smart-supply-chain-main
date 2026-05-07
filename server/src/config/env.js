// ==============================================
// Environment Configuration Loader
// ==============================================

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '..', '.env') });

const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

  // AI Engine
  AI_ENGINE_URL: process.env.AI_ENGINE_URL || 'http://localhost:8000',

  // Database
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT, 10) || 5432,
  DB_NAME: process.env.DB_NAME || 'supply_chain',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
  USE_IN_MEMORY_DB: process.env.USE_IN_MEMORY_DB === 'true',

  // Redis
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT, 10) || 6379,
  USE_IN_MEMORY_REDIS: process.env.USE_IN_MEMORY_REDIS === 'true',

  // Simulation
  SIMULATION_ENABLED: process.env.SIMULATION_ENABLED === 'true',
  SIMULATION_SPEED: parseInt(process.env.SIMULATION_SPEED, 10) || 1,
  VEHICLE_UPDATE_INTERVAL_MS: parseInt(process.env.VEHICLE_UPDATE_INTERVAL_MS, 10) || 3000,
  DISRUPTION_CHECK_INTERVAL_MS: parseInt(process.env.DISRUPTION_CHECK_INTERVAL_MS, 10) || 30000,
};

module.exports = ENV;
