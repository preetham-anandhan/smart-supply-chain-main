// ==============================================
// Vehicle Model — Data shape and helpers
// ==============================================

const { generateId } = require('../../../shared/utils/helpers');

/**
 * Create a new vehicle object with defaults.
 */
function createVehicle(data) {
  return {
    id: data.id || generateId('VEH'),
    name: data.name || 'Unnamed Vehicle',
    type: data.type || 'van',
    capacity_kg: data.capacity_kg || 200,
    current_lat: data.current_lat,
    current_lng: data.current_lng,
    fuel_level: data.fuel_level ?? 100,
    status: data.status || 'available',
    assigned_shipments: data.assigned_shipments || [],
    route: data.route || null,
    updated_at: new Date().toISOString(),
  };
}

module.exports = { createVehicle };
