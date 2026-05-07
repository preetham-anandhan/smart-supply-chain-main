// ==============================================
// Aggregation Service — Batch parcels via AI
// ==============================================

const aiClient = require('../ai/aiClient');
const { getStore } = require('../config/db');
const { createLogger } = require('../../../shared/utils/logger');
const eventBus = require('../events/eventBus');
const EVENTS = require('../../../shared/constants/events');

const log = createLogger('AGGREGATION');

/**
 * Aggregate pending parcels into delivery batches.
 */
async function aggregatePendingParcels() {
  const store = getStore();
  const pending = store.shipments.filter((s) => s.status === 'pending');

  if (pending.length === 0) {
    log.debug('No pending parcels to aggregate');
    return null;
  }

  const parcels = pending.map((s) => ({
    id: s.id,
    destination_lat: s.destination_lat,
    destination_lng: s.destination_lng,
    weight_kg: s.weight_kg,
    priority: s.priority,
  }));

  const availableVehicles = store.vehicles.filter((v) => v.status === 'available');

  try {
    const result = await aiClient.aggregateParcels(parcels, availableVehicles.length);

    // Update shipment statuses
    result.clusters?.forEach((cluster) => {
      cluster.parcels?.forEach((parcelId) => {
        const shipment = store.shipments.find((s) => s.id === parcelId);
        if (shipment) {
          shipment.status = 'aggregating';
          shipment.updated_at = new Date().toISOString();
        }
      });
    });

    eventBus.emit(EVENTS.AGGREGATION_COMPLETE, result);
    log.info(`Aggregated ${pending.length} parcels into ${result.summary?.num_batches || 0} batches`);

    return result;
  } catch (err) {
    log.error('Aggregation failed', err.message);
    return null;
  }
}

module.exports = { aggregatePendingParcels };
