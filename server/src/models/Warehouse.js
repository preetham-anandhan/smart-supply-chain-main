// ==============================================
// Warehouse Model — Data shape and helpers
// ==============================================

function createWarehouse(data) {
  return {
    id: data.id,
    name: data.name,
    lat: data.lat,
    lng: data.lng,
    zone: data.zone || 'Unknown',
    capacity: data.capacity || 500,
    current_load: data.current_load || 0,
    type: data.type || 'warehouse',
  };
}

module.exports = { createWarehouse };
