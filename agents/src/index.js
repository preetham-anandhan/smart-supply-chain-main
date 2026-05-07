// ==============================================
// Agent Orchestration Layer — Entry Point
// Creates and manages all agent instances
// ==============================================

const CoordinatorAgent = require('./coordinatorAgent');
const RoutingAgent = require('./routingAgent');
const DisruptionAgent = require('./disruptionAgent');
const ShipmentAgent = require('./shipment/ShipmentAgent');
const VehicleAgent = require('./vehicle/VehicleAgent');
const WarehouseAgent = require('./warehouse/WarehouseAgent');
const AggregationAgent = require('./aggregation/AggregationAgent');
const messageBroker = require('./communication/messageBroker');
const { createLogger } = require('../../shared/utils/logger');

const log = createLogger('AGENT-MANAGER');

/**
 * Initialize and return all agent instances.
 */
function createAgents(eventBus, aiClient) {
  log.agent('Initializing multi-agent system...');

  const coordinator = new CoordinatorAgent(eventBus, aiClient);
  const routing = new RoutingAgent(eventBus, aiClient);
  const disruption = new DisruptionAgent(eventBus, aiClient);
  const shipment = new ShipmentAgent(eventBus, aiClient);
  const vehicle = new VehicleAgent(eventBus, aiClient);
  const warehouse = new WarehouseAgent(eventBus, aiClient);
  const aggregation = new AggregationAgent(eventBus, aiClient);

  // Set up inter-agent communication channels
  messageBroker.createChannel('route-requests');
  messageBroker.createChannel('vehicle-assignments');
  messageBroker.createChannel('disruptions');
  messageBroker.createChannel('aggregation');

  log.agent('All 7 agents initialized successfully');
  log.agent(`Message broker channels: ${Object.keys(messageBroker.getStatus().channels).join(', ')}`);

  return {
    coordinator,
    routing,
    disruption,
    shipment,
    vehicle,
    warehouse,
    aggregation,
    messageBroker,
  };
}

/**
 * Get status of all agents.
 */
function getAgentStatuses(agents) {
  const statuses = {};
  for (const [name, agent] of Object.entries(agents)) {
    if (agent && typeof agent.getStatus === 'function') {
      statuses[name] = agent.getStatus();
    }
  }
  return statuses;
}

module.exports = { createAgents, getAgentStatuses };
