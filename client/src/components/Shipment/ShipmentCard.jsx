import React from 'react';
import { Badge } from '../SharedStyles';

function ShipmentCard({ shipment }) {
  if (!shipment) return null;

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 16,
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-blue)' }}>
          {shipment.id}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <Badge $type={shipment.priority}>{shipment.priority}</Badge>
          <Badge $type={shipment.status}>{shipment.status}</Badge>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center', margin: '12px 0' }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>FROM</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{shipment.source_name}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {shipment.source_lat?.toFixed(4)}, {shipment.source_lng?.toFixed(4)}
          </div>
        </div>
        <div style={{ fontSize: '1.2rem' }}>→</div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>TO</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{shipment.destination_name}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {shipment.destination_lat?.toFixed(4)}, {shipment.destination_lng?.toFixed(4)}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          marginTop: 12,
          padding: '10px 0',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>WEIGHT</div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{shipment.weight_kg} kg</div>
        </div>
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>SIZE</div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{shipment.size}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>SLA</div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{shipment.sla_hours}h</div>
        </div>
      </div>

      {shipment.vehicle_id && (
        <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
          🚛 Assigned: {shipment.vehicle_id}
        </div>
      )}
    </div>
  );
}

export default ShipmentCard;
