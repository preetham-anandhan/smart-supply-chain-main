import React, { useState } from 'react';
import { createShipment } from '../../services/api';
import { CardHeader, CardTitle, Button } from '../SharedStyles';

const LOCATIONS = [
  { name: 'Koramangala', lat: 12.9352, lng: 77.6245 },
  { name: 'Whitefield', lat: 12.9698, lng: 77.7500 },
  { name: 'Electronic City', lat: 12.8399, lng: 77.6770 },
  { name: 'Hebbal', lat: 13.0358, lng: 77.5970 },
  { name: 'Jayanagar', lat: 12.9299, lng: 77.5838 },
  { name: 'Majestic', lat: 12.9767, lng: 77.5713 },
  { name: 'Indiranagar', lat: 12.9784, lng: 77.6408 },
  { name: 'KR Puram', lat: 13.0012, lng: 77.6960 },
  { name: 'Yeshwantpur', lat: 13.0227, lng: 77.5500 },
  { name: 'BTM Layout', lat: 12.9166, lng: 77.6101 },
];

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border)',
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  fontSize: '0.85rem',
  fontFamily: 'var(--font)',
  outline: 'none',
};

function ShipmentForm({ onCreated }) {
  const [form, setForm] = useState({
    source: 0,
    destination: 1,
    weight_kg: 5,
    size: 'medium',
    priority: 'standard',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const src = LOCATIONS[form.source];
    const dst = LOCATIONS[form.destination];

    try {
      await createShipment({
        source_name: src.name,
        source_lat: src.lat,
        source_lng: src.lng,
        destination_name: dst.name,
        destination_lat: dst.lat,
        destination_lng: dst.lng,
        weight_kg: parseFloat(form.weight_kg),
        size: form.size,
        priority: form.priority,
        sla_hours: { critical: 2, express: 6, standard: 24, economy: 72 }[form.priority],
      });
      if (onCreated) onCreated();
    } catch (err) {
      console.error('Failed to create shipment', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardHeader>
        <CardTitle>Create Shipment</CardTitle>
      </CardHeader>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Source</label>
          <select style={inputStyle} value={form.source} onChange={(e) => setForm({ ...form, source: parseInt(e.target.value) })}>
            {LOCATIONS.map((loc, i) => (
              <option key={i} value={i}>{loc.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Destination</label>
          <select style={inputStyle} value={form.destination} onChange={(e) => setForm({ ...form, destination: parseInt(e.target.value) })}>
            {LOCATIONS.map((loc, i) => (
              <option key={i} value={i}>{loc.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Weight (kg)</label>
          <input style={inputStyle} type="number" min="0.1" step="0.1" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} />
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Size</label>
          <select style={inputStyle} value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="xlarge">XLarge</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Priority</label>
          <select style={inputStyle} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option value="critical">🔴 Critical (2h SLA)</option>
            <option value="express">🟠 Express (6h SLA)</option>
            <option value="standard">🔵 Standard (24h SLA)</option>
            <option value="economy">⚪ Economy (72h SLA)</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <Button $variant="primary" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? '⏳ Creating...' : '📦 Create Shipment'}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default ShipmentForm;
