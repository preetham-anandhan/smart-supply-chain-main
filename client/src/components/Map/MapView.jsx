import React from 'react';
import styled from 'styled-components';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapContainerWrapper = styled.div`
  width: 100%;
  height: 100%;
  min-height: 420px;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  position: relative;
`;

const Legend = styled.div`
  position: absolute;
  bottom: 16px;
  left: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  background: rgba(15, 17, 23, 0.9);
  padding: 10px 14px;
  border-radius: 14px;
  color: #cbd5e1;
  font-size: 0.8rem;
  z-index: 999;
`;

function MapView({ vehicles = [], warehouses = [], shipments = [] }) {
  const defaultCenter = [12.97, 77.59];
  const center = warehouses.length
    ? [
        warehouses.reduce((sum, w) => sum + (w.lat || 12.97), 0) / warehouses.length,
        warehouses.reduce((sum, w) => sum + (w.lng || 77.59), 0) / warehouses.length,
      ]
    : defaultCenter;

  const routeLines = shipments
    .filter((s) => s.source_lat && s.source_lng && s.destination_lat && s.destination_lng)
    .map((s) => [[s.source_lat, s.source_lng], [s.destination_lat, s.destination_lng]]);

  return (
    <MapContainerWrapper>
      <div style={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 999,
        background: 'rgba(15, 17, 23, 0.92)',
        padding: '12px 14px',
        borderRadius: '14px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
        color: '#f8fafc',
        minWidth: 240,
      }}>
        <div style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>
          Live Map Metrics
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
          <div style={{ fontSize: '13px', color: '#cbd5e1' }}>Warehouses</div>
          <div style={{ fontSize: '13px', fontWeight: 700, textAlign: 'right', color: '#8b5cf6' }}>{warehouses.length}</div>
          <div style={{ fontSize: '13px', color: '#cbd5e1' }}>Vehicles</div>
          <div style={{ fontSize: '13px', fontWeight: 700, textAlign: 'right', color: '#10b981' }}>{vehicles.length}</div>
          <div style={{ fontSize: '13px', color: '#cbd5e1' }}>Active Routes</div>
          <div style={{ fontSize: '13px', fontWeight: 700, textAlign: 'right', color: '#06b6d4' }}>{routeLines.length}</div>
          <div style={{ fontSize: '13px', color: '#cbd5e1' }}>Shipments</div>
          <div style={{ fontSize: '13px', fontWeight: 700, textAlign: 'right', color: '#f59e0b' }}>{shipments.length}</div>
        </div>
      </div>

      <MapContainer center={center} zoom={11} scrollWheelZoom={false} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &mdash; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
        />

        {warehouses.map((warehouse) => (
          <CircleMarker
            key={warehouse.id}
            center={[warehouse.lat || 12.97, warehouse.lng || 77.59]}
            radius={10}
            pathOptions={{ color: '#8b5cf6', fillColor: '#8b5cf6', fillOpacity: 0.8 }}
          >
            <Popup>
              <div style={{ minWidth: 150 }}>
                <strong>{warehouse.name}</strong>
                <div>{warehouse.zone}</div>
                <div>Load: {warehouse.current_load}/{warehouse.capacity}</div>
              </div>
            </Popup>
            <Tooltip>{warehouse.name}</Tooltip>
          </CircleMarker>
        ))}

        {vehicles.map((vehicle) => (
          <CircleMarker
            key={vehicle.id}
            center={[vehicle.current_lat || 12.97, vehicle.current_lng || 77.59]}
            radius={7}
            pathOptions={{
              color: vehicle.status === 'available' ? '#10b981' : vehicle.status === 'in_transit' ? '#06b6d4' : '#f59e0b',
              fillColor: vehicle.status === 'available' ? '#10b981' : vehicle.status === 'in_transit' ? '#06b6d4' : '#f59e0b',
              fillOpacity: 0.75,
            }}
          >
            <Popup>
              <div style={{ minWidth: 150 }}>
                <strong>Vehicle {vehicle.id}</strong>
                <div>Status: {vehicle.status}</div>
                <div>Fuel: {vehicle.fuel_level ?? 'N/A'}%</div>
              </div>
            </Popup>
            <Tooltip>{vehicle.id}</Tooltip>
          </CircleMarker>
        ))}

        {routeLines.map((line, index) => (
          <Polyline key={index} positions={line} pathOptions={{ color: '#06b6d4', weight: 2, dashArray: '4 5' }} />
        ))}
      </MapContainer>

      <Legend>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#8b5cf6' }} /> Warehouse
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} /> Available
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#06b6d4' }} /> In Transit
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} /> Other
        </span>
      </Legend>
    </MapContainerWrapper>
  );
}

export default MapView;
