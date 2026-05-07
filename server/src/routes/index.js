// ==============================================
// Main Route Index — Mounts all sub-routers
// ==============================================

const express = require('express');
const router = express.Router();
const { getDashboard, getWarehouses } = require('../controllers/userController');

const shipmentRoutes = require('./shipmentRoutes');
const vehicleRoutes = require('./vehicleRoutes');
const authRoutes = require('./authRoutes');
const driverRoutes = require('./driverRoutes');

// Mount sub-routes
router.use('/auth', authRoutes);
router.use('/shipments', shipmentRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/driver', driverRoutes);

// Dashboard & warehouse routes
router.get('/dashboard', getDashboard);
router.get('/warehouses', getWarehouses);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'server', timestamp: new Date().toISOString() });
});

module.exports = router;
