// ==============================================
// Driver Controller — Trip lifecycle & directions
// ==============================================

const { getStore } = require('../config/db');
const aiClient = require('../ai/aiClient');
const { createLogger } = require('../../../shared/utils/logger');
const { haversineDistance } = require('../../../shared/utils/helpers');
const eventBus = require('../events/eventBus');
const EVENTS = require('../../../shared/constants/events');

const log = createLogger('DRIVER');

/**
 * GET /api/driver/assignments/:vehicleId
 * Get active assignments for a vehicle with departure/arrival schedule.
 */
async function getDriverAssignment(req, res) {
  try {
    const store = getStore();
    const vehicleId = req.params.vehicleId;
    const vehicle = store.vehicles.find(v => v.id === vehicleId);

    if (!vehicle) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }

    const assignedShipments = (vehicle.assigned_shipments || [])
      .map(sid => store.shipments.find(s => s.id === sid))
      .filter(Boolean);

    if (assignedShipments.length === 0) {
      return res.json({
        success: true,
        data: {
          vehicle,
          assignment: null,
          message: 'No active assignments',
        },
      });
    }

    // Find source and destination warehouses for the trip
    const firstShipment = assignedShipments[0];
    const sourceWarehouse = findNearestWarehouse(store.warehouses, vehicle.current_lat, vehicle.current_lng);
    const destWarehouse = findNearestWarehouse(store.warehouses, firstShipment.destination_lat, firstShipment.destination_lng);

    // Calculate distance and ETA
    const distanceKm = haversineDistance(
      vehicle.current_lat, vehicle.current_lng,
      firstShipment.destination_lat, firstShipment.destination_lng
    );

    let etaData = null;
    try {
      etaData = await aiClient.predictETA({
        distance_km: distanceKm,
        traffic_factor: 1.0,
        weather_factor: 1.0,
        hour: new Date().getHours(),
        num_stops: assignedShipments.length - 1,
      });
    } catch {
      etaData = {
        predicted_eta_min: Math.round((distanceKm / 30) * 60),
        confidence: 0.3,
        breakdown: { base_travel_min: Math.round((distanceKm / 30) * 60) },
      };
    }

    // Compute departure and arrival times
    const now = new Date();
    const departureTime = vehicle._trip_started_at
      ? new Date(vehicle._trip_started_at)
      : now;
    const arrivalTime = new Date(departureTime.getTime() + etaData.predicted_eta_min * 60000);

    res.json({
      success: true,
      data: {
        vehicle,
        assignment: {
          shipments: assignedShipments,
          shipment_count: assignedShipments.length,
          total_weight_kg: assignedShipments.reduce((sum, s) => sum + (s.weight_kg || 0), 0),
          source_warehouse: sourceWarehouse,
          destination_warehouse: destWarehouse,
          distance_km: Math.round(distanceKm * 10) / 10,
          eta: etaData,
          departure_time: departureTime.toISOString(),
          arrival_time: arrivalTime.toISOString(),
          trip_status: vehicle._trip_status || 'waiting',
        },
      },
    });
  } catch (err) {
    log.error('Failed to get driver assignment', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/driver/trip/:vehicleId/start
 * Driver marks trip as started.
 */
function startTrip(req, res) {
  const store = getStore();
  const vehicle = store.vehicles.find(v => v.id === req.params.vehicleId);
  if (!vehicle) return res.status(404).json({ success: false, error: 'Vehicle not found' });

  vehicle._trip_status = 'in_progress';
  vehicle._trip_started_at = new Date().toISOString();
  vehicle.status = 'in_transit';
  vehicle.updated_at = new Date().toISOString();

  // Update assigned shipments to in_transit
  (vehicle.assigned_shipments || []).forEach(sid => {
    const shipment = store.shipments.find(s => s.id === sid);
    if (shipment && shipment.status !== 'delivered') {
      shipment.status = 'in_transit';
      shipment.updated_at = new Date().toISOString();
    }
  });

  eventBus.emit(EVENTS.PARCEL_IN_TRANSIT, { vehicle_id: vehicle.id });
  log.agent(`Driver started trip: ${vehicle.id} (${vehicle.name})`);

  res.json({ success: true, data: vehicle });
}

/**
 * POST /api/driver/trip/:vehicleId/complete
 * Driver marks trip as completed (reached destination).
 */
function completeTrip(req, res) {
  const store = getStore();
  const vehicle = store.vehicles.find(v => v.id === req.params.vehicleId);
  if (!vehicle) return res.status(404).json({ success: false, error: 'Vehicle not found' });

  vehicle._trip_status = 'completed';
  vehicle._trip_completed_at = new Date().toISOString();
  vehicle.updated_at = new Date().toISOString();

  // Mark all assigned shipments as delivered
  (vehicle.assigned_shipments || []).forEach(sid => {
    const shipment = store.shipments.find(s => s.id === sid);
    if (shipment) {
      shipment.status = 'delivered';
      shipment.updated_at = new Date().toISOString();
      eventBus.emit(EVENTS.PARCEL_DELIVERED, shipment);
    }
  });

  // Free up the vehicle
  vehicle.assigned_shipments = [];
  vehicle.status = 'available';
  vehicle._target_lat = null;
  vehicle._target_lng = null;

  eventBus.emit(EVENTS.VEHICLE_AVAILABLE, vehicle);
  log.agent(`Driver completed trip: ${vehicle.id} (${vehicle.name})`);

  res.json({ success: true, data: vehicle });
}

/**
 * GET /api/driver/directions/:vehicleId
 * Get turn-by-turn route directions from AI engine.
 */
async function getDirections(req, res) {
  try {
    const store = getStore();
    const vehicle = store.vehicles.find(v => v.id === req.params.vehicleId);
    if (!vehicle) return res.status(404).json({ success: false, error: 'Vehicle not found' });

    const assignedShipments = (vehicle.assigned_shipments || [])
      .map(sid => store.shipments.find(s => s.id === sid))
      .filter(Boolean);

    if (assignedShipments.length === 0) {
      return res.json({ success: true, data: { directions: null, message: 'No active route' } });
    }

    const firstShipment = assignedShipments[0];

    // Get conditions from AI engine
    let conditions = { traffic_factor: 1.0, weather: { factor: 1.0, condition: 'clear' } };
    try {
      conditions = await aiClient.getConditions();
    } catch {}

    // Get optimized route from AI
    const route = await aiClient.optimizeRoute({
      source_lat: vehicle.current_lat,
      source_lng: vehicle.current_lng,
      dest_lat: firstShipment.destination_lat,
      dest_lng: firstShipment.destination_lng,
      traffic_factor: conditions.traffic_factor || 1.0,
      weather_factor: conditions.weather?.factor || 1.0,
      optimization_mode: 'fastest',
    });

    // Build direction steps from route coordinates
    const steps = buildDirectionSteps(route);

    res.json({
      success: true,
      data: {
        route,
        conditions,
        steps,
        destination: {
          name: firstShipment.destination_name,
          lat: firstShipment.destination_lat,
          lng: firstShipment.destination_lng,
        },
        source: {
          name: firstShipment.source_name || 'Current Location',
          lat: vehicle.current_lat,
          lng: vehicle.current_lng,
        },
      },
    });
  } catch (err) {
    log.error('Failed to get directions', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/driver/reroute/:vehicleId
 * AI-powered reroute when disruption is detected.
 */
async function rerouteVehicle(req, res) {
  try {
    const store = getStore();
    const vehicle = store.vehicles.find(v => v.id === req.params.vehicleId);
    if (!vehicle) return res.status(404).json({ success: false, error: 'Vehicle not found' });

    const assignedShipments = (vehicle.assigned_shipments || [])
      .map(sid => store.shipments.find(s => s.id === sid))
      .filter(Boolean);

    if (assignedShipments.length === 0) {
      return res.json({ success: true, data: { message: 'No active route to reroute' } });
    }

    const firstShipment = assignedShipments[0];

    // Get current conditions (simulated disruption)
    let conditions = { traffic_factor: 1.5, weather: { factor: 1.2, condition: 'rain' } };
    try {
      conditions = await aiClient.getConditions();
      // Ensure elevated factors to simulate disruption
      conditions.traffic_factor = Math.max(conditions.traffic_factor || 1.0, 1.3);
    } catch {}

    // Request new route with disruption factors
    const newRoute = await aiClient.optimizeRoute({
      source_lat: vehicle.current_lat,
      source_lng: vehicle.current_lng,
      dest_lat: firstShipment.destination_lat,
      dest_lng: firstShipment.destination_lng,
      traffic_factor: conditions.traffic_factor,
      weather_factor: conditions.weather?.factor || 1.2,
      optimization_mode: 'fastest',
    });

    // Get new ETA
    const distKm = newRoute.primary_route?.distance_km || 10;
    let newEta = null;
    try {
      newEta = await aiClient.predictETA({
        distance_km: distKm,
        traffic_factor: conditions.traffic_factor,
        weather_factor: conditions.weather?.factor || 1.0,
        hour: new Date().getHours(),
        num_stops: assignedShipments.length - 1,
      });
    } catch {
      newEta = { predicted_eta_min: Math.round((distKm / 25) * 60), confidence: 0.3 };
    }

    const steps = buildDirectionSteps(newRoute);

    // Update vehicle's route
    vehicle.route = newRoute;
    vehicle.updated_at = new Date().toISOString();

    eventBus.emit(EVENTS.ROUTE_UPDATED, { vehicle_id: vehicle.id, route: newRoute });
    log.agent(`Vehicle ${vehicle.id} rerouted due to disruption — new ETA: ${newEta.predicted_eta_min} min`);

    const now = new Date();
    const newArrival = new Date(now.getTime() + newEta.predicted_eta_min * 60000);

    res.json({
      success: true,
      data: {
        rerouted: true,
        reason: `${conditions.weather?.condition || 'traffic'} disruption detected`,
        route: newRoute,
        eta: newEta,
        conditions,
        steps,
        new_arrival_time: newArrival.toISOString(),
      },
    });
  } catch (err) {
    log.error('Reroute failed', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
}

// ── Helpers ──────────────────────────────────────────

function findNearestWarehouse(warehouses, lat, lng) {
  let nearest = null;
  let minDist = Infinity;
  for (const wh of warehouses) {
    const d = haversineDistance(lat, lng, wh.lat, wh.lng);
    if (d < minDist) {
      minDist = d;
      nearest = wh;
    }
  }
  return nearest;
}

function buildDirectionSteps(route) {
  if (!route?.primary_route?.coordinates) return [];
  const coords = route.primary_route.coordinates;
  const steps = [];

  for (let i = 0; i < coords.length; i++) {
    const point = coords[i];
    const isFirst = i === 0;
    const isLast = i === coords.length - 1;

    let instruction = '';
    if (isFirst) {
      instruction = `Depart from ${point.name || 'origin'}`;
    } else if (isLast) {
      instruction = `Arrive at ${point.name || 'destination'}`;
    } else {
      instruction = `Pass through ${point.name || 'waypoint'}`;
    }

    // Calculate distance to next point
    let distToNext = 0;
    if (i < coords.length - 1) {
      const next = coords[i + 1];
      distToNext = haversineDistance(point.lat, point.lng, next.lat, next.lng);
    }

    steps.push({
      step: i + 1,
      instruction,
      location: point.name || `Waypoint ${i + 1}`,
      lat: point.lat,
      lng: point.lng,
      distance_to_next_km: Math.round(distToNext * 10) / 10,
      is_current: isFirst,
      is_destination: isLast,
    });
  }

  return steps;
}

module.exports = {
  getDriverAssignment,
  startTrip,
  completeTrip,
  getDirections,
  rerouteVehicle,
};
