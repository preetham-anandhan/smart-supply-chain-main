// ==============================================
// Shipment Routes
// ==============================================

const express = require('express');
const router = express.Router();
const {
  getAllShipments,
  getShipmentById,
  createNewShipment,
  updateShipmentStatus,
  optimizeShipmentRoute,
} = require('../controllers/shipmentController');

router.get('/', getAllShipments);
router.get('/:id', getShipmentById);
router.post('/', createNewShipment);
router.put('/:id/status', updateShipmentStatus);
router.post('/:id/optimize', optimizeShipmentRoute);

module.exports = router;
