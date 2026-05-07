// ==============================================
// Shipment Controller — CRUD + AI Integration
// ==============================================

const { getStore } = require('../config/db');
const { createShipment } = require('../models/Shipment');
const { createLogger } = require('../../../shared/utils/logger');
const aiClient = require('../ai/aiClient');
const eventBus = require('../events/eventBus');
const EVENTS = require('../../../shared/constants/events');

const log = createLogger('SHIPMENT');

/**
 * GET /api/shipments
 */
function getAllShipments(req, res) {
  const store = getStore();
  const { status, priority } = req.query;
  let results = store.shipments;

  if (status) results = results.filter((s) => s.status === status);
  if (priority) results = results.filter((s) => s.priority === priority);

  res.json({ success: true, count: results.length, data: results });
}

/**
 * GET /api/shipments/:id
 */
function getShipmentById(req, res) {
  const store = getStore();
  const shipment = store.shipments.find((s) => s.id === req.params.id);
  if (!shipment) return res.status(404).json({ success: false, error: 'Shipment not found' });
  res.json({ success: true, data: shipment });
}

/**
 * POST /api/shipments
 */
async function createNewShipment(req, res) {
  try {
    const store = getStore();
    const shipment = createShipment(req.body);
    store.shipments.push(shipment);

    eventBus.emit(EVENTS.PARCEL_CREATED, shipment);
    log.info(`Created shipment ${shipment.id}`, { priority: shipment.priority });

    res.status(201).json({ success: true, data: shipment });
  } catch (err) {
    log.error('Failed to create shipment', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * PUT /api/shipments/:id/status
 */
function updateShipmentStatus(req, res) {
  const store = getStore();
  const shipment = store.shipments.find((s) => s.id === req.params.id);
  if (!shipment) return res.status(404).json({ success: false, error: 'Shipment not found' });

  const oldStatus = shipment.status;
  shipment.status = req.body.status;
  shipment.updated_at = new Date().toISOString();

  eventBus.emit(EVENTS.PARCEL_UPDATED, { shipment, oldStatus });
  log.info(`Shipment ${shipment.id}: ${oldStatus} → ${shipment.status}`);

  res.json({ success: true, data: shipment });
}

/**
 * POST /api/shipments/:id/optimize
 */
async function optimizeShipmentRoute(req, res) {
  try {
    const store = getStore();
    const shipment = store.shipments.find((s) => s.id === req.params.id);
    if (!shipment) return res.status(404).json({ success: false, error: 'Shipment not found' });

    const route = await aiClient.optimizeRoute({
      source_lat: shipment.source_lat,
      source_lng: shipment.source_lng,
      dest_lat: shipment.destination_lat,
      dest_lng: shipment.destination_lng,
    });

    shipment.route = route;
    shipment.status = 'routed';
    shipment.updated_at = new Date().toISOString();

    eventBus.emit(EVENTS.ROUTE_GENERATED, { shipment, route });

    res.json({ success: true, data: { shipment, route } });
  } catch (err) {
    log.error(`Route optimization failed for ${req.params.id}`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  getAllShipments,
  getShipmentById,
  createNewShipment,
  updateShipmentStatus,
  optimizeShipmentRoute,
};
