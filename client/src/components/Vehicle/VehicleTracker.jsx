import React from 'react';
import { Badge } from '../SharedStyles';

function VehicleTracker({ vehicle, compact = false }) {
  if (!vehicle) return null;

  const fuelColor =
    vehicle.fuel_level > 60 ? 'var(--accent-green)' :
    vehicle.fuel_level > 25 ? 'var(--accent-amber)' :
    'var(--accent-red)';

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
        <div style={{ flex: 1, background: 'var(--bg-primary)', borderRadius: 4, height: 4, overflow: 'hidden' }}>
          <div style={{ width: `${vehicle.fuel_level}%`, height: '100%', background: fuelColor, transition: 'width 0.5s' }} />
        </div>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>⛽ {Math.round(vehicle.fuel_level)}%</span>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{vehicle.name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{vehicle.id}</div>
        </div>
        <Badge $type={vehicle.status}>{vehicle.status}</Badge>
      </div>

      {/* Vehicle Info Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div style={{ background: 'var(--bg-secondary)', padding: 12, borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 2 }}>TYPE</div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'capitalize' }}>{vehicle.type}</div>
        </div>
        <div style={{ background: 'var(--bg-secondary)', padding: 12, borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 2 }}>CAPACITY</div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{vehicle.capacity_kg} kg</div>
        </div>
      </div>

      {/* Location */}
      <div style={{ background: 'var(--bg-secondary)', padding: 12, borderRadius: 'var(--radius-md)', marginBottom: 12 }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4 }}>📍 CURRENT LOCATION</div>
        <div style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
          {vehicle.current_lat?.toFixed(4)}, {vehicle.current_lng?.toFixed(4)}
        </div>
      </div>

      {/* Fuel Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
          <span style={{ color: 'var(--text-muted)' }}>⛽ Fuel Level</span>
          <span style={{ color: fuelColor, fontWeight: 600 }}>{Math.round(vehicle.fuel_level)}%</span>
        </div>
        <div style={{ background: 'var(--bg-primary)', borderRadius: 6, height: 8, overflow: 'hidden' }}>
          <div
            style={{
              width: `${vehicle.fuel_level}%`,
              height: '100%',
              background: fuelColor,
              borderRadius: 6,
              transition: 'width 0.5s ease',
            }}
          />
        </div>
      </div>

      {/* Assigned shipments */}
      {vehicle.assigned_shipments?.length > 0 && (
        <div style={{ marginTop: 12, fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Assigned: </span>
          {vehicle.assigned_shipments.map((sid) => (
            <Badge key={sid} $type="standard" style={{ marginRight: 4 }}>{sid}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export default VehicleTracker;
