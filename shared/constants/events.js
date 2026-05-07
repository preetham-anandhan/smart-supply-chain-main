// ==============================================
// Event Constants — Smart Supply Chain
// All event names used across the event-driven system
// ==============================================

const EVENTS = {
  // Shipment lifecycle
  PARCEL_CREATED: 'parcel_created',
  PARCEL_UPDATED: 'parcel_updated',
  PARCEL_PICKED_UP: 'parcel_picked_up',
  PARCEL_IN_TRANSIT: 'parcel_in_transit',
  PARCEL_DELIVERED: 'parcel_delivered',
  PARCEL_FAILED: 'parcel_failed',

  // Vehicle events
  VEHICLE_AVAILABLE: 'vehicle_available',
  VEHICLE_ASSIGNED: 'vehicle_assigned',
  VEHICLE_LOCATION_UPDATE: 'vehicle_location_update',
  VEHICLE_UNAVAILABLE: 'vehicle_unavailable',
  VEHICLE_MAINTENANCE: 'vehicle_maintenance',

  // Route events
  ROUTE_REQUESTED: 'route_requested',
  ROUTE_GENERATED: 'route_generated',
  ROUTE_UPDATED: 'route_updated',
  ROUTE_FAILED: 'route_failed',

  // Aggregation events
  BATCH_READY: 'batch_ready',
  AGGREGATION_COMPLETE: 'aggregation_complete',

  // Disruption events
  DELAY_DETECTED: 'delay_detected',
  WEATHER_ALERT: 'weather_alert',
  TRAFFIC_ALERT: 'traffic_alert',
  RISK_ALERT: 'risk_alert',

  // Coordinator events
  DECISION_FINALIZED: 'decision_finalized',
  ASSIGNMENT_REQUEST: 'assignment_request',
  CONFLICT_RESOLVED: 'conflict_resolved',

  // Warehouse events
  WAREHOUSE_INTAKE: 'warehouse_intake',
  WAREHOUSE_DISPATCH: 'warehouse_dispatch',

  // System events
  SYSTEM_HEALTH: 'system_health',
  AGENT_STATUS: 'agent_status',
  SIMULATION_TICK: 'simulation_tick',

  // Notification events
  NOTIFICATION_SEND: 'notification_send',
  DELIVERY_CONFIRMED: 'delivery_completed',
};

module.exports = EVENTS;
