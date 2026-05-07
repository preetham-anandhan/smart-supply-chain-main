// ==============================================
// Route Model — Data shape and helpers
// ==============================================

const { generateId } = require('../../../shared/utils/helpers');

function createRoute(data) {
  return {
    id: data.id || generateId('RTE'),
    vehicle_id: data.vehicle_id,
    shipment_ids: data.shipment_ids || [],
    path: data.path || [],
    coordinates: data.coordinates || [],
    distance_km: data.distance_km || 0,
    estimated_time_min: data.estimated_time_min || 0,
    optimization_mode: data.optimization_mode || 'balanced',
    status: data.status || 'planned',
    created_at: new Date().toISOString(),
  };
}

module.exports = { createRoute };
