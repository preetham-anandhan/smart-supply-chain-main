// ==============================================
// Socket.IO Handler — Real-time communication
// ==============================================

const { createLogger } = require('../../../shared/utils/logger');
const { getStore } = require('../config/db');
const eventBus = require('../events/eventBus');
const EVENTS = require('../../../shared/constants/events');

const log = createLogger('SOCKET');

/**
 * Initialize Socket.IO event handling.
 */
function initSocketHandler(io) {
  io.on('connection', (socket) => {
    log.info(`Client connected: ${socket.id}`);

    // Send initial state
    const store = getStore();
    socket.emit('initial_state', {
      shipments: store.shipments,
      vehicles: store.vehicles,
      warehouses: store.warehouses,
    });

    // Client requests shipment list
    socket.on('get_shipments', () => {
      socket.emit('shipments_update', store.shipments);
    });

    // Client requests vehicle list
    socket.on('get_vehicles', () => {
      socket.emit('vehicles_update', store.vehicles);
    });

    // Client creates a new shipment via socket
    socket.on('create_shipment', (data) => {
      const { createShipment } = require('../models/Shipment');
      const shipment = createShipment(data);
      store.shipments.push(shipment);
      eventBus.emit(EVENTS.PARCEL_CREATED, shipment);
      io.emit('shipment_created', shipment);
      io.emit('shipments_update', store.shipments);
    });

    // Disconnect
    socket.on('disconnect', () => {
      log.info(`Client disconnected: ${socket.id}`);
    });
  });

  // Forward event bus events to all connected clients
  eventBus.on(EVENTS.VEHICLE_LOCATION_UPDATE, (data) => {
    io.emit(EVENTS.VEHICLE_LOCATION_UPDATE, data);
  });

  eventBus.on(EVENTS.PARCEL_UPDATED, (data) => {
    io.emit('shipment_updated', data.shipment);
    io.emit('shipments_update', getStore().shipments);
  });

  eventBus.on(EVENTS.NOTIFICATION_SEND, (notification) => {
    io.emit('notification', notification);
  });

  eventBus.on(EVENTS.RISK_ALERT, (disruption) => {
    io.emit('disruption', disruption);
  });

  log.info('Socket.IO handler initialized');
}

module.exports = { initSocketHandler };
