// ==============================================
// Driver Routes — Trip management & directions
// ==============================================

const express = require('express');
const router = express.Router();
const {
  getDriverAssignment,
  startTrip,
  completeTrip,
  getDirections,
  rerouteVehicle,
} = require('../controllers/driverController');

// Get assignment details for a vehicle (departure/arrival times, shipments)
router.get('/assignments/:vehicleId', getDriverAssignment);

// Trip lifecycle
router.post('/trip/:vehicleId/start', startTrip);
router.post('/trip/:vehicleId/complete', completeTrip);

// Route directions (AI-powered)
router.get('/directions/:vehicleId', getDirections);

// Reroute on disruption (AI-powered)
router.post('/reroute/:vehicleId', rerouteVehicle);

module.exports = router;
