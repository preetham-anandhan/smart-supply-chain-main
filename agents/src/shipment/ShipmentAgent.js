// ==============================================
// Shipment Agent — Route + transport mode decisions
// ==============================================

const BaseAgent = require('../base/BaseAgent');
const EVENTS = require('../../../shared/constants/events');

class ShipmentAgent extends BaseAgent {
  constructor(eventBus, aiClient) {
    super('shipment-agent', eventBus, aiClient);
    this.activeShipments = new Map();
  }

  _listen() {
    // When a parcel is created, decide transport mode and request route
    this.eventBus.on(EVENTS.PARCEL_CREATED, async (shipment) => {
      if (!this.active) return;
      try {
        await this.processNewShipment(shipment);
        this._recordTask();
      } catch (err) {
        this._recordError(err);
      }
    });

    // Monitor status updates
    this.eventBus.on(EVENTS.PARCEL_UPDATED, ({ shipment }) => {
      if (shipment) {
        this.activeShipments.set(shipment.id, shipment);
      }
    });

    // When route is generated, update shipment
    this.eventBus.on(EVENTS.ROUTE_GENERATED, ({ shipment, route }) => {
      if (shipment && route) {
        this.log.agent(`Route received for ${shipment.id}: ${route.primary_route?.distance_km || 0} km`);
        this.activeShipments.set(shipment.id, { ...shipment, route });
      }
    });
  }

  async processNewShipment(shipment) {
    this.log.agent(`Processing new shipment ${shipment.id} [${shipment.priority}]`);
    this.activeShipments.set(shipment.id, shipment);

    // Calculate distance
    const { haversineDistance } = require('../../../shared/utils/helpers');
    const distance = haversineDistance(
      shipment.source_lat, shipment.source_lng,
      shipment.destination_lat, shipment.destination_lng
    );

    // Decide transport mode
    const mode = this.decideTransportMode(distance, shipment.weight_kg, shipment.priority);
    shipment.transport_mode = mode;
    shipment.estimated_distance_km = Math.round(distance * 100) / 100;

    this.log.agent(`${shipment.id}: distance=${distance.toFixed(1)}km, mode=${mode}`);

    // Request route optimization
    this.eventBus.emit(EVENTS.ROUTE_REQUESTED, {
      shipment_id: shipment.id,
      source_lat: shipment.source_lat,
      source_lng: shipment.source_lng,
      dest_lat: shipment.destination_lat,
      dest_lng: shipment.destination_lng,
      mode: 'balanced',
    });

    return { transport_mode: mode, distance_km: distance };
  }

  decideTransportMode(distanceKm, weightKg, priority) {
    if (weightKg >= 500) return 'water';
    if (priority === 'critical' && distanceKm > 20) return 'air';
    if (distanceKm > 50) return 'air';
    if (priority === 'economy' && distanceKm < 50) return 'road';
    return 'road';
  }

  getStatus() {
    return {
      ...super.getStatus(),
      active_shipments: this.activeShipments.size,
    };
  }
}

module.exports = ShipmentAgent;
