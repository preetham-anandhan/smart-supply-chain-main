// ==============================================
// Vehicle Controller — Fleet management
// ==============================================

const { getStore } = require('../config/db');
const { createVehicle } = require('../models/Vehicle');
const { createLogger } = require('../../../shared/utils/logger');
const eventBus = require('../events/eventBus');
const EVENTS = require('../../../shared/constants/events');

const log = createLogger('VEHICLE');

/**
 * GET /api/vehicles
 */
function getAllVehicles(req, res) {
  const store = getStore();
  const { status, type } = req.query;
  let results = store.vehicles;

  if (status) results = results.filter((v) => v.status === status);
  if (type) results = results.filter((v) => v.type === type);

  res.json({ success: true, count: results.length, data: results });
}

/**
 * GET /api/vehicles/:id
 */
function getVehicleById(req, res) {
  const store = getStore();
  const vehicle = store.vehicles.find((v) => v.id === req.params.id);
  if (!vehicle) return res.status(404).json({ success: false, error: 'Vehicle not found' });
  res.json({ success: true, data: vehicle });
}

/**
 * PUT /api/vehicles/:id/location
 */
function updateVehicleLocation(req, res) {
  const store = getStore();
  const vehicle = store.vehicles.find((v) => v.id === req.params.id);
  if (!vehicle) return res.status(404).json({ success: false, error: 'Vehicle not found' });

  vehicle.current_lat = req.body.lat;
  vehicle.current_lng = req.body.lng;
  vehicle.updated_at = new Date().toISOString();

  eventBus.emit(EVENTS.VEHICLE_LOCATION_UPDATE, vehicle);

  res.json({ success: true, data: vehicle });
}

/**
 * PUT /api/vehicles/:id/status
 */
function updateVehicleStatus(req, res) {
  const store = getStore();
  const vehicle = store.vehicles.find((v) => v.id === req.params.id);
  if (!vehicle) return res.status(404).json({ success: false, error: 'Vehicle not found' });

  const oldStatus = vehicle.status;
  vehicle.status = req.body.status;
  vehicle.updated_at = new Date().toISOString();

  const event = req.body.status === 'available' ? EVENTS.VEHICLE_AVAILABLE : EVENTS.VEHICLE_UNAVAILABLE;
  eventBus.emit(event, vehicle);
  log.info(`Vehicle ${vehicle.id}: ${oldStatus} → ${vehicle.status}`);

  res.json({ success: true, data: vehicle });
}

/**
 * POST /api/vehicles/:id/assign
 */
function assignShipments(req, res) {
  const store = getStore();
  const vehicle = store.vehicles.find((v) => v.id === req.params.id);
  if (!vehicle) return res.status(404).json({ success: false, error: 'Vehicle not found' });

  const { shipment_ids } = req.body;
  vehicle.assigned_shipments = shipment_ids || [];
  vehicle.status = 'assigned';
  vehicle.updated_at = new Date().toISOString();

  // Update shipments
  shipment_ids.forEach((sid) => {
    const shipment = store.shipments.find((s) => s.id === sid);
    if (shipment) {
      shipment.vehicle_id = vehicle.id;
      shipment.status = 'assigned';
      shipment.updated_at = new Date().toISOString();
    }
  });

  eventBus.emit(EVENTS.VEHICLE_ASSIGNED, { vehicle, shipment_ids });
  log.info(`Vehicle ${vehicle.id} assigned ${shipment_ids.length} shipments`);

  res.json({ success: true, data: vehicle });
}

module.exports = {
  getAllVehicles,
  getVehicleById,
  updateVehicleLocation,
  updateVehicleStatus,
  assignShipments,
};
