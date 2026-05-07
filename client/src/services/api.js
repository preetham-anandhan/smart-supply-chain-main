// ==============================================
// API Service — REST calls to backend
// ==============================================

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Shipments ──────────────────────────────────────
export const getShipments = (params) => api.get('/shipments', { params });
export const getShipment = (id) => api.get(`/shipments/${id}`);
export const createShipment = (data) => api.post('/shipments', data);
export const updateShipmentStatus = (id, status) => api.put(`/shipments/${id}/status`, { status });
export const optimizeShipmentRoute = (id) => api.post(`/shipments/${id}/optimize`);

// ── Vehicles ───────────────────────────────────────
export const getVehicles = (params) => api.get('/vehicles', { params });
export const getVehicle = (id) => api.get(`/vehicles/${id}`);
export const updateVehicleLocation = (id, lat, lng) => api.put(`/vehicles/${id}/location`, { lat, lng });
export const assignShipments = (vehicleId, shipmentIds) => api.post(`/vehicles/${vehicleId}/assign`, { shipment_ids: shipmentIds });

// ── Dashboard & Warehouses ─────────────────────────
export const getDashboard = () => api.get('/dashboard');
export const getWarehouses = () => api.get('/warehouses');

// ── Driver ─────────────────────────────────────────
export const getDriverAssignment = (vehicleId) => api.get(`/driver/assignments/${vehicleId}`);
export const startTrip = (vehicleId) => api.post(`/driver/trip/${vehicleId}/start`);
export const completeTrip = (vehicleId) => api.post(`/driver/trip/${vehicleId}/complete`);
export const getDirections = (vehicleId) => api.get(`/driver/directions/${vehicleId}`);
export const rerouteVehicle = (vehicleId) => api.post(`/driver/reroute/${vehicleId}`);

// ── Health ─────────────────────────────────────────
export const healthCheck = () => api.get('/health');

export default api;
