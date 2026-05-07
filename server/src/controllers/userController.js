// ==============================================
// User Controller — Dashboard data & roles
// ==============================================

const { getStore } = require('../config/db');
const { createLogger } = require('../../../shared/utils/logger');

const log = createLogger('USER');

/**
 * GET /api/dashboard
 * Returns aggregated dashboard statistics.
 */
function getDashboard(req, res) {
  const store = getStore();

  const statusCounts = {};
  store.shipments.forEach((s) => {
    statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
  });

  const vehicleStatusCounts = {};
  store.vehicles.forEach((v) => {
    vehicleStatusCounts[v.status] = (vehicleStatusCounts[v.status] || 0) + 1;
  });

  const totalWeight = store.shipments.reduce((sum, s) => sum + (s.weight_kg || 0), 0);

  res.json({
    success: true,
    data: {
      shipments: {
        total: store.shipments.length,
        byStatus: statusCounts,
        totalWeight: Math.round(totalWeight * 100) / 100,
      },
      vehicles: {
        total: store.vehicles.length,
        byStatus: vehicleStatusCounts,
      },
      warehouses: {
        total: store.warehouses.length,
        totalCapacity: store.warehouses.reduce((sum, w) => sum + w.capacity, 0),
        totalLoad: store.warehouses.reduce((sum, w) => sum + w.current_load, 0),
      },
    },
  });
}

/**
 * GET /api/warehouses
 */
function getWarehouses(req, res) {
  const store = getStore();
  res.json({ success: true, count: store.warehouses.length, data: store.warehouses });
}

module.exports = { getDashboard, getWarehouses };
