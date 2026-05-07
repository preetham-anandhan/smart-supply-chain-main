// ==============================================
// Vehicle Agent — Fleet capacity & feasibility
// ==============================================

const BaseAgent = require('../base/BaseAgent');
const EVENTS = require('../../../shared/constants/events');

class VehicleAgent extends BaseAgent {
  constructor(eventBus, aiClient) {
    super('vehicle-agent', eventBus, aiClient);
    this.fleet = new Map();
  }

  _listen() {
    // Track vehicle location updates
    this.eventBus.on(EVENTS.VEHICLE_LOCATION_UPDATE, (vehicle) => {
      if (!this.active) return;
      this.fleet.set(vehicle.id, {
        ...this.fleet.get(vehicle.id),
        current_lat: vehicle.current_lat || vehicle.lat,
        current_lng: vehicle.current_lng || vehicle.lng,
        fuel_level: vehicle.fuel_level,
        updated_at: new Date().toISOString(),
      });
    });

    // Handle assignment requests
    this.eventBus.on(EVENTS.ASSIGNMENT_REQUEST, async (request) => {
      if (!this.active) return;
      try {
        const result = await this.findBestVehicle(request.parcels, request.route_distance || 10);
        if (result) {
          this.eventBus.emit(EVENTS.VEHICLE_ASSIGNED, {
            vehicle: result.vehicle,
            shipment_ids: request.parcels.map(p => p.id),
            score: result.score,
          });
        }
        this._recordTask();
      } catch (err) {
        this._recordError(err);
      }
    });

    // Track vehicle availability changes
    this.eventBus.on(EVENTS.VEHICLE_AVAILABLE, (vehicle) => {
      this.fleet.set(vehicle.id, { ...vehicle, status: 'available' });
      this.log.agent(`Vehicle ${vehicle.id} now available`);
    });

    this.eventBus.on(EVENTS.VEHICLE_UNAVAILABLE, (vehicle) => {
      this.fleet.set(vehicle.id, { ...vehicle, status: 'unavailable' });
    });
  }

  /**
   * Register fleet vehicles for tracking.
   */
  registerFleet(vehicles) {
    vehicles.forEach(v => this.fleet.set(v.id, v));
    this.log.agent(`Registered ${vehicles.length} vehicles`);
  }

  /**
   * Check if a vehicle can handle the given parcels and route.
   */
  checkFeasibility(vehicle, parcels, routeDistanceKm) {
    const totalWeight = parcels.reduce((sum, p) => sum + (p.weight_kg || 0), 0);
    const capacity = vehicle.capacity_kg || 200;
    const fuel = vehicle.fuel_level || 0;
    const fuelNeeded = routeDistanceKm * 2; // 2% per km estimate

    const canCarry = totalWeight <= capacity;
    const hasFuel = fuel >= fuelNeeded;
    const isAvailable = vehicle.status === 'available';

    const reasons = [];
    if (!canCarry) reasons.push(`Over capacity: ${totalWeight}/${capacity} kg`);
    if (!hasFuel) reasons.push(`Low fuel: ${fuel}% < ${fuelNeeded}% needed`);
    if (!isAvailable) reasons.push(`Status: ${vehicle.status}`);

    return {
      feasible: canCarry && hasFuel && isAvailable,
      vehicle_id: vehicle.id,
      total_weight_kg: totalWeight,
      capacity_kg: capacity,
      utilization: Math.round((totalWeight / capacity) * 1000) / 10,
      fuel_level: fuel,
      fuel_needed: Math.round(fuelNeeded * 10) / 10,
      reasons,
    };
  }

  /**
   * Find the best vehicle for a set of parcels.
   */
  async findBestVehicle(parcels, routeDistanceKm) {
    const vehicles = Array.from(this.fleet.values());
    const feasible = [];

    for (const v of vehicles) {
      const check = this.checkFeasibility(v, parcels, routeDistanceKm);
      if (check.feasible) {
        const score = 100 - check.utilization * 0.3 - (100 - (v.fuel_level || 100)) * 0.2;
        feasible.push({ vehicle: v, ...check, score: Math.round(score * 10) / 10 });
      }
    }

    feasible.sort((a, b) => b.score - a.score);

    if (feasible.length > 0) {
      this.log.agent(`Best vehicle for ${parcels.length} parcels: ${feasible[0].vehicle_id} (score: ${feasible[0].score})`);
      return feasible[0];
    }

    this.log.warn(`No feasible vehicle found for ${parcels.length} parcels`);
    return null;
  }

  getStatus() {
    const vehicles = Array.from(this.fleet.values());
    return {
      ...super.getStatus(),
      fleet_size: vehicles.length,
      available: vehicles.filter(v => v.status === 'available').length,
      in_transit: vehicles.filter(v => v.status === 'in_transit').length,
    };
  }
}

module.exports = VehicleAgent;
