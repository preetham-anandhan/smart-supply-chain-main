// ==============================================
// Coordinator Agent — Orchestrates decisions
// ==============================================

const EVENTS = require('../../shared/constants/events');
const { createLogger } = require('../../shared/utils/logger');

const log = createLogger('COORDINATOR');

class CoordinatorAgent {
  constructor(eventBus, aiClient) {
    this.eventBus = eventBus;
    this.aiClient = aiClient;
    this.pendingQueue = [];
    this._listen();
  }

  _listen() {
    // When a parcel is created, add to pending queue
    this.eventBus.on(EVENTS.PARCEL_CREATED, (shipment) => {
      this.pendingQueue.push(shipment);
      log.agent(`Queued parcel ${shipment.id} (${this.pendingQueue.length} pending)`);

      // Auto-trigger aggregation when batch size reached
      const CONFIG = require('../../shared/constants/config');
      if (this.pendingQueue.length >= CONFIG.AGENTS.AGGREGATION_BATCH_SIZE) {
        this.triggerAggregation();
      }
    });

    // When aggregation completes, assign vehicles
    this.eventBus.on(EVENTS.AGGREGATION_COMPLETE, (result) => {
      log.agent(`Aggregation done — ${result.summary?.num_batches || 0} batches ready`);
      this.pendingQueue = [];
    });
  }

  async triggerAggregation() {
    log.agent(`Triggering aggregation for ${this.pendingQueue.length} parcels`);
    try {
      const parcels = this.pendingQueue.map((s) => ({
        id: s.id,
        destination_lat: s.destination_lat,
        destination_lng: s.destination_lng,
        weight_kg: s.weight_kg,
        priority: s.priority,
      }));
      const result = await this.aiClient.aggregateParcels(parcels);
      this.eventBus.emit(EVENTS.AGGREGATION_COMPLETE, result);
      return result;
    } catch (err) {
      log.error('Aggregation trigger failed', err.message);
      return null;
    }
  }

  getStatus() {
    return {
      agent: 'coordinator',
      pending_parcels: this.pendingQueue.length,
      status: 'active',
    };
  }
}

module.exports = CoordinatorAgent;
