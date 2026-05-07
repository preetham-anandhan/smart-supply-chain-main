// ==============================================
// Shipment Model — Data shape and helpers
// ==============================================

const { generateId } = require('../../../shared/utils/helpers');

/**
 * Create a new shipment object with defaults.
 */
function createShipment(data) {
  return {
    id: data.id || generateId('SHP'),
    source_name: data.source_name || 'Unknown',
    source_lat: data.source_lat,
    source_lng: data.source_lng,
    destination_name: data.destination_name || 'Unknown',
    destination_lat: data.destination_lat,
    destination_lng: data.destination_lng,
    weight_kg: data.weight_kg || 1.0,
    size: data.size || 'small',
    priority: data.priority || 'standard',
    status: data.status || 'pending',
    transport_mode: data.transport_mode || null,
    sla_hours: data.sla_hours || 24,
    vehicle_id: data.vehicle_id || null,
    route: data.route || null,
    eta_min: data.eta_min || null,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

module.exports = { createShipment };
