// ==============================================
// Simulation Service — Vehicle movement, shipment
// lifecycle, and disruption events
// ==============================================

const { getStore } = require('../config/db');
const { createLogger } = require('../../../shared/utils/logger');
const { haversineDistance, randomBangaloreLocation } = require('../../../shared/utils/helpers');
const eventBus = require('../events/eventBus');
const EVENTS = require('../../../shared/constants/events');
const ENV = require('../config/env');
const { sendNotification } = require('./notificationService');

const log = createLogger('SIMULATION');

let simulationInterval = null;
let disruptionInterval = null;
let lifecycleInterval = null;

/**
 * Start the simulation loop.
 */
function startSimulation(io) {
  if (!ENV.SIMULATION_ENABLED) {
    log.info('Simulation disabled');
    return;
  }

  log.info('Starting simulation engine');

  // Auto-assign some vehicles to demonstrate the flow
  setTimeout(() => autoAssignShipments(), 2000);

  // Vehicle movement tick
  simulationInterval = setInterval(() => {
    simulateVehicleMovement(io);
  }, ENV.VEHICLE_UPDATE_INTERVAL_MS);

  // Shipment lifecycle tick (transition statuses)
  lifecycleInterval = setInterval(() => {
    simulateShipmentLifecycle(io);
  }, 8000);

  // Disruption check tick
  disruptionInterval = setInterval(() => {
    simulateDisruptions(io);
  }, ENV.DISRUPTION_CHECK_INTERVAL_MS);
}

/**
 * Auto-assign pending shipments to available vehicles on startup.
 */
function autoAssignShipments() {
  const store = getStore();
  const pending = store.shipments.filter(s => s.status === 'pending');
  const available = store.vehicles.filter(v => v.status === 'available');

  if (pending.length === 0 || available.length === 0) return;

  // Distribute shipments across vehicles
  const assignmentMap = new Map();
  pending.forEach((shipment, i) => {
    const vehicle = available[i % available.length];
    if (!assignmentMap.has(vehicle.id)) {
      assignmentMap.set(vehicle.id, []);
    }
    assignmentMap.get(vehicle.id).push(shipment);
  });

  for (const [vehicleId, shipments] of assignmentMap) {
    const vehicle = store.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) continue;

    const shipmentIds = shipments.map(s => s.id);
    vehicle.assigned_shipments = shipmentIds;
    vehicle.status = 'assigned';

    // Set destination as the first shipment's destination for movement
    vehicle._target_lat = shipments[0].destination_lat;
    vehicle._target_lng = shipments[0].destination_lng;

    shipments.forEach(s => {
      s.vehicle_id = vehicleId;
      s.status = 'assigned';
      s.updated_at = new Date().toISOString();
    });

    eventBus.emit(EVENTS.VEHICLE_ASSIGNED, { vehicle, shipment_ids: shipmentIds });
    log.agent(`Auto-assigned ${shipmentIds.length} shipments to ${vehicle.name}`);
  }
}

/**
 * Simulate vehicle position updates — vehicles move toward their targets.
 */
function simulateVehicleMovement(io) {
  const store = getStore();
  const activeVehicles = store.vehicles.filter(v =>
    v.status === 'in_transit' || v.status === 'assigned'
  );

  activeVehicles.forEach((vehicle) => {
    // If vehicle has a target, move toward it
    if (vehicle._target_lat && vehicle._target_lng) {
      const speed = 0.0008 * ENV.SIMULATION_SPEED; // degrees per tick
      const dLat = vehicle._target_lat - vehicle.current_lat;
      const dLng = vehicle._target_lng - vehicle.current_lng;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);

      if (dist > 0.002) {
        // Move toward target
        vehicle.current_lat += (dLat / dist) * speed + (Math.random() - 0.5) * 0.0002;
        vehicle.current_lng += (dLng / dist) * speed + (Math.random() - 0.5) * 0.0002;
        vehicle.status = 'in_transit';
      } else {
        // Arrived at destination
        vehicle.current_lat = vehicle._target_lat;
        vehicle.current_lng = vehicle._target_lng;
      }
    } else {
      // Random drift for vehicles without targets
      const jitter = 0.001 * ENV.SIMULATION_SPEED;
      vehicle.current_lat += (Math.random() - 0.5) * jitter * 2;
      vehicle.current_lng += (Math.random() - 0.5) * jitter * 2;
    }

    vehicle.fuel_level = Math.max(0, vehicle.fuel_level - 0.08 * ENV.SIMULATION_SPEED);
    vehicle.updated_at = new Date().toISOString();

    // Emit location update
    if (io) {
      io.emit(EVENTS.VEHICLE_LOCATION_UPDATE, {
        id: vehicle.id,
        lat: vehicle.current_lat,
        lng: vehicle.current_lng,
        fuel_level: vehicle.fuel_level,
      });
    }
  });

  eventBus.emit(EVENTS.SIMULATION_TICK, { activeVehicles: activeVehicles.length });
}

/**
 * Simulate shipment lifecycle transitions.
 */
function simulateShipmentLifecycle(io) {
  const store = getStore();
  const now = new Date().toISOString();

  store.shipments.forEach((shipment) => {
    const rand = Math.random();

    switch (shipment.status) {
      case 'assigned':
        // Move to in_transit
        if (rand < 0.4) {
          shipment.status = 'in_transit';
          shipment.updated_at = now;
          eventBus.emit(EVENTS.PARCEL_IN_TRANSIT, shipment);
          log.info(`${shipment.id}: assigned → in_transit`);
        }
        break;

      case 'in_transit': {
        // Check if vehicle has arrived near destination
        const vehicle = store.vehicles.find(v => v.id === shipment.vehicle_id);
        if (vehicle) {
          const distToDest = haversineDistance(
            vehicle.current_lat, vehicle.current_lng,
            shipment.destination_lat, shipment.destination_lng
          );

          if (distToDest < 1.5) {
            // Close to destination — deliver
            shipment.status = 'delivered';
            shipment.updated_at = now;
            eventBus.emit(EVENTS.PARCEL_DELIVERED, shipment);
            sendNotification('delivery', `Shipment ${shipment.id} delivered to ${shipment.destination_name}`, shipment);
            log.info(`${shipment.id}: delivered at ${shipment.destination_name}`);

            // Free up vehicle
            vehicle.assigned_shipments = (vehicle.assigned_shipments || []).filter(id => id !== shipment.id);
            if (vehicle.assigned_shipments.length === 0) {
              vehicle.status = 'available';
              vehicle._target_lat = null;
              vehicle._target_lng = null;
              eventBus.emit(EVENTS.VEHICLE_AVAILABLE, vehicle);
            }
          } else if (rand < 0.02) {
            // Small chance of failure
            shipment.status = 'failed';
            shipment.updated_at = now;
            eventBus.emit(EVENTS.PARCEL_FAILED, shipment);
            sendNotification('failure', `Shipment ${shipment.id} delivery failed`, shipment);
          }
        }
        break;
      }
    }
  });

  // Push updated shipments to all clients
  if (io) {
    io.emit('shipments_update', store.shipments);
  }
}

/**
 * Simulate random disruptions (weather, traffic, delays).
 */
function simulateDisruptions(io) {
  const CONFIG = require('../../../shared/constants/config');
  if (Math.random() > CONFIG.SIMULATION.DISRUPTION_PROBABILITY) return;

  const types = ['traffic', 'weather', 'breakdown'];
  const type = types[Math.floor(Math.random() * types.length)];
  const location = randomBangaloreLocation();

  const disruption = {
    type,
    severity: Math.random() > 0.7 ? 'high' : 'medium',
    location,
    message: `${type.charAt(0).toUpperCase() + type.slice(1)} disruption detected near ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
    timestamp: new Date().toISOString(),
  };

  sendNotification('disruption', disruption.message, disruption);

  if (io) {
    io.emit(EVENTS.RISK_ALERT, disruption);
  }

  eventBus.emit(EVENTS.RISK_ALERT, disruption);
  log.warn(`Disruption: ${disruption.message}`);
}

/**
 * Stop the simulation.
 */
function stopSimulation() {
  if (simulationInterval) clearInterval(simulationInterval);
  if (disruptionInterval) clearInterval(disruptionInterval);
  if (lifecycleInterval) clearInterval(lifecycleInterval);
  log.info('Simulation stopped');
}

module.exports = { startSimulation, stopSimulation };
