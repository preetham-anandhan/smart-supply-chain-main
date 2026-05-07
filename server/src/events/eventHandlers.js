// ==============================================
// Event Handlers — React to system events
// ==============================================

const eventBus = require('./eventBus');
const EVENTS = require('../../../shared/constants/events');
const { createLogger } = require('../../../shared/utils/logger');
const { sendNotification } = require('../services/notificationService');

const log = createLogger('EVENT-HANDLER');

/**
 * Register all event handlers.
 */
function registerEventHandlers() {
  // Parcel created → notify manager
  eventBus.on(EVENTS.PARCEL_CREATED, (shipment) => {
    log.agent(`New parcel: ${shipment.id} [${shipment.priority}] ${shipment.source_name} → ${shipment.destination_name}`);
    if (shipment.priority === 'critical') {
      sendNotification('urgent', `Critical parcel ${shipment.id} created — requires immediate dispatch`, shipment);
    }
  });

  // Route generated
  eventBus.on(EVENTS.ROUTE_GENERATED, ({ shipment, route }) => {
    log.ai(`Route generated for ${shipment.id}: ${route.primary_route?.distance_km || 0} km`);
  });

  // Vehicle assigned
  eventBus.on(EVENTS.VEHICLE_ASSIGNED, ({ vehicle, shipment_ids }) => {
    log.agent(`Vehicle ${vehicle.id} assigned ${shipment_ids.length} shipments`);
  });

  // Delay detected
  eventBus.on(EVENTS.DELAY_DETECTED, (data) => {
    sendNotification('delay', `Delay detected for shipment ${data.shipment_id}: +${data.delay_minutes} min`, data);
    log.warn(`Delay: ${data.shipment_id} +${data.delay_minutes} min`);
  });

  // Risk alert
  eventBus.on(EVENTS.RISK_ALERT, (disruption) => {
    log.warn(`Risk alert: ${disruption.type} — ${disruption.severity}`);
  });

  // Aggregation complete
  eventBus.on(EVENTS.AGGREGATION_COMPLETE, (result) => {
    log.agent(`Aggregation complete: ${result.summary?.num_batches || 0} batches from ${result.summary?.total_parcels || 0} parcels`);
  });

  log.info('All event handlers registered');
}

module.exports = { registerEventHandlers };
