// ==============================================
// Warehouse Agent — Hub intake & dispatch
// ==============================================

const BaseAgent = require('../base/BaseAgent');
const EVENTS = require('../../../shared/constants/events');
const { haversineDistance } = require('../../../shared/utils/helpers');

class WarehouseAgent extends BaseAgent {
  constructor(eventBus, aiClient) {
    super('warehouse-agent', eventBus, aiClient);
    this.warehouses = new Map();
  }

  _listen() {
    // Handle parcel intake
    this.eventBus.on(EVENTS.WAREHOUSE_INTAKE, (data) => {
      if (!this.active) return;
      const { warehouse_id, shipment } = data;
      const wh = this.warehouses.get(warehouse_id);
      if (wh) {
        wh.current_load += shipment.weight_kg || 0;
        this.log.agent(`Intake at ${wh.name}: +${shipment.weight_kg}kg (now ${wh.current_load}/${wh.capacity})`);
        this._recordTask();
      }
    });

    // Handle parcel dispatch
    this.eventBus.on(EVENTS.WAREHOUSE_DISPATCH, (data) => {
      if (!this.active) return;
      const { warehouse_id, shipment } = data;
      const wh = this.warehouses.get(warehouse_id);
      if (wh) {
        wh.current_load = Math.max(0, wh.current_load - (shipment.weight_kg || 0));
        this.log.agent(`Dispatch from ${wh.name}: -${shipment.weight_kg}kg (now ${wh.current_load}/${wh.capacity})`);
        this._recordTask();
      }
    });
  }

  /**
   * Register warehouse data.
   */
  registerWarehouses(warehouses) {
    warehouses.forEach(w => this.warehouses.set(w.id, { ...w }));
    this.log.agent(`Registered ${warehouses.length} warehouses`);
  }

  /**
   * Find the nearest warehouse to given coordinates with available capacity.
   */
  findNearestWarehouse(lat, lng, minCapacity = 0) {
    let nearest = null;
    let minDist = Infinity;

    for (const wh of this.warehouses.values()) {
      const available = wh.capacity - wh.current_load;
      if (available < minCapacity) continue;

      const dist = haversineDistance(lat, lng, wh.lat, wh.lng);
      if (dist < minDist) {
        minDist = dist;
        nearest = { ...wh, distance_km: Math.round(dist * 100) / 100, available_capacity: available };
      }
    }
    return nearest;
  }

  /**
   * Get capacity utilization for all warehouses.
   */
  getCapacityReport() {
    const report = [];
    for (const wh of this.warehouses.values()) {
      const utilization = Math.round((wh.current_load / wh.capacity) * 1000) / 10;
      report.push({
        id: wh.id,
        name: wh.name,
        zone: wh.zone,
        capacity: wh.capacity,
        current_load: wh.current_load,
        available: wh.capacity - wh.current_load,
        utilization_pct: utilization,
        status: utilization > 90 ? 'critical' : utilization > 70 ? 'high' : 'normal',
      });
    }
    return report;
  }

  getStatus() {
    const warehouses = Array.from(this.warehouses.values());
    const totalCap = warehouses.reduce((s, w) => s + w.capacity, 0);
    const totalLoad = warehouses.reduce((s, w) => s + w.current_load, 0);
    return {
      ...super.getStatus(),
      warehouse_count: warehouses.length,
      total_capacity: totalCap,
      total_load: totalLoad,
      utilization_pct: totalCap > 0 ? Math.round((totalLoad / totalCap) * 1000) / 10 : 0,
    };
  }
}

module.exports = WarehouseAgent;
