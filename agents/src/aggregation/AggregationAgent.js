// ==============================================
// Aggregation Agent — Batch parcels via AI clustering
// ==============================================

const BaseAgent = require('../base/BaseAgent');
const EVENTS = require('../../../shared/constants/events');

class AggregationAgent extends BaseAgent {
  constructor(eventBus, aiClient) {
    super('aggregation-agent', eventBus, aiClient);
    this.pendingParcels = [];
    this.batchHistory = [];
  }

  _listen() {
    // Collect pending parcels
    this.eventBus.on(EVENTS.PARCEL_CREATED, (shipment) => {
      if (!this.active) return;
      this.pendingParcels.push({
        id: shipment.id,
        destination_lat: shipment.destination_lat,
        destination_lng: shipment.destination_lng,
        weight_kg: shipment.weight_kg,
        priority: shipment.priority,
      });
      this.log.agent(`Parcel ${shipment.id} added to aggregation queue (${this.pendingParcels.length} pending)`);
    });

    // External trigger to run aggregation
    this.eventBus.on(EVENTS.BATCH_READY, async () => {
      if (!this.active) return;
      await this.runAggregation();
    });
  }

  /**
   * Run parcel aggregation through the AI engine.
   */
  async runAggregation(numVehicles = 5, maxCapacity = 200) {
    if (this.pendingParcels.length === 0) {
      this.log.agent('No pending parcels to aggregate');
      return null;
    }

    this.log.agent(`Aggregating ${this.pendingParcels.length} parcels into batches`);

    try {
      const result = await this.aiClient.aggregateParcels(this.pendingParcels, numVehicles);

      this.batchHistory.push({
        timestamp: new Date().toISOString(),
        input_count: this.pendingParcels.length,
        clusters: result.clusters?.length || 0,
      });

      // Clear pending parcels
      this.pendingParcels = [];
      this._recordTask();

      this.eventBus.emit(EVENTS.AGGREGATION_COMPLETE, result);
      this.log.agent(`Aggregation complete: ${result.summary?.num_batches || 0} batches`);

      return result;
    } catch (err) {
      this._recordError(err);
      // Fallback: simple distance-based grouping
      return this._fallbackAggregation();
    }
  }

  /**
   * Simple fallback aggregation when AI engine is unavailable.
   */
  _fallbackAggregation() {
    this.log.warn('Using fallback aggregation (AI unavailable)');
    const batches = [];
    const sorted = [...this.pendingParcels].sort((a, b) => a.destination_lat - b.destination_lat);

    let currentBatch = [];
    let currentWeight = 0;

    for (const parcel of sorted) {
      if (currentWeight + parcel.weight_kg > 200 && currentBatch.length > 0) {
        batches.push({
          cluster_id: batches.length,
          batch_id: `fallback-${batches.length}`,
          parcels: currentBatch.map(p => p.id),
          parcel_count: currentBatch.length,
          total_weight_kg: Math.round(currentWeight * 100) / 100,
        });
        currentBatch = [];
        currentWeight = 0;
      }
      currentBatch.push(parcel);
      currentWeight += parcel.weight_kg;
    }

    if (currentBatch.length > 0) {
      batches.push({
        cluster_id: batches.length,
        batch_id: `fallback-${batches.length}`,
        parcels: currentBatch.map(p => p.id),
        parcel_count: currentBatch.length,
        total_weight_kg: Math.round(currentWeight * 100) / 100,
      });
    }

    this.pendingParcels = [];
    const result = {
      clusters: batches,
      summary: { total_parcels: sorted.length, num_batches: batches.length, method: 'fallback' },
    };

    this.eventBus.emit(EVENTS.AGGREGATION_COMPLETE, result);
    return result;
  }

  getStatus() {
    return {
      ...super.getStatus(),
      pending_parcels: this.pendingParcels.length,
      total_batches_created: this.batchHistory.length,
    };
  }
}

module.exports = AggregationAgent;
