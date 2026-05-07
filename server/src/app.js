// ==============================================
// Smart Supply Chain — Server Entry Point
// ==============================================

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Server } = require('socket.io');

const ENV = require('./config/env');
const { getStore, seedStore } = require('./config/db');
const routes = require('./routes/index');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { initSocketHandler } = require('./sockets/socketHandler');
const { registerEventHandlers } = require('./events/eventHandlers');
const { startSimulation } = require('./services/simulationService');
const { createLogger } = require('../../shared/utils/logger');
const eventBus = require('./events/eventBus');
const aiClient = require('./ai/aiClient');
const { createAgents, getAgentStatuses } = require('../../agents/src/index');

const log = createLogger('SERVER');

// ── Express App ────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// ── Socket.IO ──────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: ENV.FRONTEND_URL,
    methods: ['GET', 'POST'],
  },
});

// ── Middleware ──────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: ENV.FRONTEND_URL }));
app.use(morgan('dev'));
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────
app.use('/api', routes);

// Root health check
app.get('/', (req, res) => {
  res.json({
    service: 'Smart Supply Chain Server',
    version: '1.0.0',
    status: 'operational',
    endpoints: ['/api/shipments', '/api/vehicles', '/api/dashboard', '/api/warehouses', '/api/agents', '/api/health'],
  });
});

// ── Error Handling ─────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Bootstrap ──────────────────────────────────────────────────
const store = getStore();
seedStore(store);
registerEventHandlers();
initSocketHandler(io);

// ── Initialize Multi-Agent System ──────────────────────────────
const agents = createAgents(eventBus, aiClient);

// Register fleet and warehouses with agents
agents.vehicle.registerFleet(store.vehicles);
agents.warehouse.registerWarehouses(store.warehouses);

// Expose agent statuses via API
app.get('/api/agents', (req, res) => {
  res.json({ success: true, data: getAgentStatuses(agents) });
});

// ── Start Simulation ───────────────────────────────────────────
startSimulation(io);

// ── Start Server ───────────────────────────────────────────────
server.listen(ENV.PORT, () => {
  log.info(`🚀 Server running on http://localhost:${ENV.PORT}`);
  log.info(`📡 WebSocket ready`);
  log.info(`🤖 AI Engine target: ${ENV.AI_ENGINE_URL}`);
  log.info(`💾 Database: ${ENV.USE_IN_MEMORY_DB ? 'In-Memory' : 'PostgreSQL'}`);
  log.info(`🧠 Multi-agent system: 7 agents active`);
});

module.exports = { app, server, io, agents };
