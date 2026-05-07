// ==============================================
// Vehicle Routes
// ==============================================

const express = require('express');
const router = express.Router();
const {
  getAllVehicles,
  getVehicleById,
  updateVehicleLocation,
  updateVehicleStatus,
  assignShipments,
} = require('../controllers/vehicleController');

router.get('/', getAllVehicles);
router.get('/:id', getVehicleById);
router.put('/:id/location', updateVehicleLocation);
router.put('/:id/status', updateVehicleStatus);
router.post('/:id/assign', assignShipments);

module.exports = router;
