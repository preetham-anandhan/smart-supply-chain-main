// ==============================================
// Shared Configuration — Smart Supply Chain
// Bangalore-specific constants and system defaults
// ==============================================

const CONFIG = {
  // Bangalore center coordinates
  BANGALORE: {
    CENTER: { lat: 12.9716, lng: 77.5946 },
    BOUNDS: {
      north: 13.15,
      south: 12.75,
      east: 77.80,
      west: 77.35,
    },
  },

  // Predefined hub/warehouse locations in Bangalore
  HUBS: [
    { id: 'hub-whitefield', name: 'Whitefield Hub', lat: 12.9698, lng: 77.7500, zone: 'East', capacity: 500 },
    { id: 'hub-koramangala', name: 'Koramangala Hub', lat: 12.9352, lng: 77.6245, zone: 'South', capacity: 400 },
    { id: 'hub-electronic-city', name: 'Electronic City Hub', lat: 12.8399, lng: 77.6770, zone: 'South-East', capacity: 600 },
    { id: 'hub-yeshwantpur', name: 'Yeshwantpur Hub', lat: 13.0227, lng: 77.5500, zone: 'North', capacity: 450 },
    { id: 'hub-jayanagar', name: 'Jayanagar Hub', lat: 12.9299, lng: 77.5838, zone: 'Central-South', capacity: 350 },
    { id: 'hub-hebbal', name: 'Hebbal Hub', lat: 13.0358, lng: 77.5970, zone: 'North', capacity: 500 },
    { id: 'hub-kr-puram', name: 'KR Puram Hub', lat: 13.0012, lng: 77.6960, zone: 'East', capacity: 400 },
    { id: 'hub-central', name: 'Majestic Central Hub', lat: 12.9767, lng: 77.5713, zone: 'Central', capacity: 800 },
  ],

  // Transport mode thresholds
  TRANSPORT_MODES: {
    ROAD: { id: 'road', maxDistance: 50, icon: '🚛', color: '#3B82F6' },
    AIR: { id: 'air', minDistance: 50, maxDistance: 500, icon: '✈️', color: '#8B5CF6' },
    WATER: { id: 'water', minWeight: 500, icon: '🚢', color: '#06B6D4' },
  },

  // Shipment priorities
  PRIORITIES: {
    CRITICAL: { id: 'critical', label: 'Critical', slaHours: 2, multiplier: 3.0 },
    EXPRESS: { id: 'express', label: 'Express', slaHours: 6, multiplier: 2.0 },
    STANDARD: { id: 'standard', label: 'Standard', slaHours: 24, multiplier: 1.0 },
    ECONOMY: { id: 'economy', label: 'Economy', slaHours: 72, multiplier: 0.7 },
  },

  // Shipment statuses
  STATUSES: {
    PENDING: 'pending',
    AGGREGATING: 'aggregating',
    ROUTED: 'routed',
    ASSIGNED: 'assigned',
    PICKED_UP: 'picked_up',
    IN_TRANSIT: 'in_transit',
    DELIVERED: 'delivered',
    FAILED: 'failed',
    REROUTING: 'rerouting',
  },

  // Vehicle types
  VEHICLE_TYPES: {
    BIKE: { id: 'bike', label: 'Bike', capacity: 10, speed: 30, fuelCostPerKm: 2 },
    VAN: { id: 'van', label: 'Van', capacity: 200, speed: 40, fuelCostPerKm: 8 },
    TRUCK: { id: 'truck', label: 'Truck', capacity: 1000, speed: 35, fuelCostPerKm: 15 },
    DRONE: { id: 'drone', label: 'Drone', capacity: 5, speed: 60, fuelCostPerKm: 5 },
  },

  // Simulation defaults
  SIMULATION: {
    NUM_VEHICLES: 8,
    NUM_INITIAL_SHIPMENTS: 25,
    NEW_SHIPMENT_INTERVAL_MS: 15000,
    DISRUPTION_PROBABILITY: 0.15,
  },

  // Agent configuration
  AGENTS: {
    AGGREGATION_BATCH_SIZE: 5,
    AGGREGATION_WAIT_MS: 10000,
    DISRUPTION_CHECK_INTERVAL_MS: 30000,
    ROUTE_CACHE_TTL_S: 300,
  },
};

module.exports = CONFIG;
