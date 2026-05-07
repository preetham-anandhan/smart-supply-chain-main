import React, { useState, useEffect } from 'react';
import { getShipments, getVehicles, getWarehouses, optimizeShipmentRoute } from '../services/api';
import ShipmentForm from '../components/Shipment/ShipmentForm';
import AlertPanel from '../components/Alerts/AlertPanel';
import MapView from '../components/Map/MapView';
import { connectSocket } from '../services/socket';
import { PageContainer, PageHeader, StatsGrid, StatCard, StatIcon, StatValue, StatLabel, Grid2, Card, CardHeader, CardTitle, Badge, Button } from '../components/SharedStyles';

// Simple Gauge Chart Component
const GaugeChart = ({ value, maxValue, label, color }) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const angle = (percentage / 100) * 180 - 90; // -90 to 90 degrees

  return (
    <div style={{ width: '120px', height: '80px', margin: '0 auto', position: 'relative' }}>
      <svg width="120" height="80" viewBox="0 0 120 80">
        {/* Background arc */}
        <path
          d="M 10 70 A 50 50 0 0 1 110 70"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d={`M 10 70 A 50 50 0 0 1 ${10 + 100 * Math.cos(angle * Math.PI / 180)} ${70 + 50 * Math.sin(angle * Math.PI / 180)}`}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Center dot */}
        <circle cx="60" cy="70" r="3" fill={color} />
      </svg>
      <div style={{ textAlign: 'center', marginTop: '5px' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color }}>{value}</div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{label}</div>
      </div>
    </div>
  );
};

// Enhanced Map Overlay Component
const MapOverlay = ({ shipments, vehicles, warehouses }) => {
  const activeShipments = shipments.filter(s => s.status === 'in_transit').length;
  const availableVehicles = vehicles.filter(v => v.status === 'available').length;
  const totalCapacity = warehouses.reduce((sum, w) => sum + w.capacity, 0);
  const usedCapacity = warehouses.reduce((sum, w) => sum + w.current_load, 0);
  const utilizationRate = Math.round((usedCapacity / totalCapacity) * 100);

  return (
    <div style={{
      position: 'absolute',
      top: 12,
      right: 12,
      background: 'rgba(15,17,23,0.9)',
      padding: '12px',
      borderRadius: '12px',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.1)',
      minWidth: '200px'
    }}>
      <h4 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '14px', fontWeight: '600' }}>
        📊 Live Metrics
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#94a3b8', fontSize: '12px' }}>Active Shipments</span>
          <span style={{ color: '#06b6d4', fontWeight: 'bold' }}>{activeShipments}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#94a3b8', fontSize: '12px' }}>Available Vehicles</span>
          <span style={{ color: '#10b981', fontWeight: 'bold' }}>{availableVehicles}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#94a3b8', fontSize: '12px' }}>Warehouse Utilization</span>
          <span style={{ color: utilizationRate > 80 ? '#ef4444' : utilizationRate > 60 ? '#f59e0b' : '#10b981', fontWeight: 'bold' }}>
            {utilizationRate}%
          </span>
        </div>
      </div>
    </div>
  );
};

// Simple Bar Chart Component
const BarChart = ({ data, color, maxValue }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'end', gap: '8px', height: '100px', padding: '10px 0' }}>
      {data.map((item, index) => (
        <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
          <div
            style={{
              width: '100%',
              maxWidth: '30px',
              height: `${Math.max((item.value / maxValue) * 80, 6)}px`,
              background: `linear-gradient(180deg, ${color} 0%, rgba(255,255,255,0.25) 100%)`,
              borderRadius: '6px 6px 0 0',
              marginBottom: '4px',
              transition: 'height 0.5s ease',
            }}
          />
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

// Simple Pie Chart Component
const PieChart = ({ data, colors }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let accumulated = 0;

  if (total === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '220px', color: 'var(--text-muted)' }}>
        No shipment status data available
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '18px' }}>
      <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="110" cy="110" r="90" fill="rgba(15,17,23,0.9)" />
        {data.map((item, index) => {
          const value = item.value;
          const startAngle = (accumulated / total) * 2 * Math.PI;
          const endAngle = ((accumulated + value) / total) * 2 * Math.PI;
          const largeArcFlag = value / total > 0.5 ? 1 : 0;
          const x1 = 110 + 90 * Math.cos(startAngle);
          const y1 = 110 + 90 * Math.sin(startAngle);
          const x2 = 110 + 90 * Math.cos(endAngle);
          const y2 = 110 + 90 * Math.sin(endAngle);
          const pathData = `M 110 110 L ${x1} ${y1} A 90 90 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

          accumulated += value;

          return (
            <path key={item.label} d={pathData} fill={colors[index % colors.length]} stroke="rgba(15,17,23,0.9)" strokeWidth="1" />
          );
        })}
        <circle cx="110" cy="110" r="46" fill="rgba(11,16,33,0.95)" />
        <text x="110" y="108" textAnchor="middle" fill="#f8fafc" fontSize="18" fontWeight="700" transform="rotate(90,110,110)">
          {total}
        </text>
        <text x="110" y="128" textAnchor="middle" fill="#94a3b8" fontSize="10" transform="rotate(90,110,110)">
          Total
        </text>
      </svg>
    </div>
  );
};

function ManagerPage() {
  const [shipments, setShipments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [optimizing, setOptimizing] = useState(null);

  useEffect(() => {
    loadData();

    const socket = connectSocket();
    socket.on('shipments_update', (data) => setShipments(data));
    socket.on('notification', (notif) => {
      setAlerts((prev) => [notif, ...prev].slice(0, 30));
    });
    socket.on('vehicle_location_update', (update) => {
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === update.id
            ? { ...v, current_lat: update.lat, current_lng: update.lng, fuel_level: update.fuel_level }
            : v
        )
      );
    });

    return () => {
      socket.off('shipments_update');
      socket.off('notification');
      socket.off('vehicle_location_update');
    };
  }, []);

  const loadData = async () => {
    try {
      const [shipRes, vehRes, whRes] = await Promise.all([
        getShipments(),
        getVehicles(),
        getWarehouses(),
      ]);
      setShipments(shipRes.data.data || []);
      setVehicles(vehRes.data.data || []);
      setWarehouses(whRes.data.data || []);
    } catch (err) {
      console.error('Failed to load data', err);
    }
  };

  const handleOptimize = async (shipmentId) => {
    setOptimizing(shipmentId);
    try {
      await optimizeShipmentRoute(shipmentId);
      await loadData();
    } catch (err) {
      console.error('Optimization failed', err);
    }
    setOptimizing(null);
  };

  const statusCounts = {};
  shipments.forEach(s => { statusCounts[s.status] = (statusCounts[s.status] || 0) + 1; });

  // Chart data
  const shipmentStatusData = [
    { label: 'Delivered', value: statusCounts.delivered || 0, color: '#10b981' },
    { label: 'In Transit', value: statusCounts.in_transit || 0, color: '#f59e0b' },
    { label: 'Pending', value: statusCounts.pending || 0, color: '#ef4444' },
  ];

  const warehouseData = warehouses.map(w => ({
    label: w.name.split(' ')[0], // Short name
    value: Math.round((w.current_load / w.capacity) * 100),
  }));

  const vehicleStatusData = vehicles.reduce((acc, v) => {
    const status = v.status === 'available' ? 'Available' :
                   v.status === 'assigned' ? 'Assigned' :
                   v.status === 'in_transit' ? 'In Transit' : 'Other';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const vehicleChartData = Object.entries(vehicleStatusData).map(([status, count]) => ({
    label: status,
    value: count,
  }));

  return (
    <PageContainer>
      <PageHeader>
        <h1>🚛 Admin Dashboard</h1>
        <p>Supply chain oversight — monitor operations, fleet, and logistics</p>
      </PageHeader>

      {/* Live Operations Map - Main Feature */}
      <Card style={{ marginBottom: '24px', height: '550px', position: 'relative' }}>
        <CardHeader>
          <CardTitle>🗺️ Live Operations Map</CardTitle>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Real-time tracking of vehicles, warehouses, and shipments across Bangalore
          </div>
        </CardHeader>
        <div style={{ height: '480px', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
          <MapView vehicles={vehicles} warehouses={warehouses} shipments={shipments} />
          <MapOverlay shipments={shipments} vehicles={vehicles} warehouses={warehouses} />
        </div>
      </Card>

      {/* Quick Stats Overview */}
      <StatsGrid style={{ marginBottom: '24px' }}>
        <StatCard color="accentBlue">
          <StatIcon>📦</StatIcon>
          <StatValue>{shipments.length}</StatValue>
          <StatLabel>Total Shipments</StatLabel>
        </StatCard>
        <StatCard color="accentGreen">
          <StatIcon>✅</StatIcon>
          <StatValue>{statusCounts.delivered || 0}</StatValue>
          <StatLabel>Delivered</StatLabel>
        </StatCard>
        <StatCard color="accentAmber">
          <StatIcon>🔄</StatIcon>
          <StatValue>{statusCounts.in_transit || 0}</StatValue>
          <StatLabel>In Transit</StatLabel>
        </StatCard>
        <StatCard color="accentRed">
          <StatIcon>⏳</StatIcon>
          <StatValue>{statusCounts.pending || 0}</StatValue>
          <StatLabel>Pending</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Charts and Analytics Section */}
      <Grid2 style={{ marginBottom: '24px' }}>
        <Card>
          <CardHeader>
            <CardTitle>📊 Shipment Analytics</CardTitle>
          </CardHeader>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '20px' }}>
              <GaugeChart
                value={Math.round((statusCounts.delivered || 0) / Math.max(shipments.length, 1) * 100)}
                maxValue={100}
                label="Success Rate"
                color="#10b981"
              />
              <GaugeChart
                value={statusCounts.in_transit || 0}
                maxValue={Math.max(shipments.length, 5)}
                label="Active Routes"
                color="#06b6d4"
              />
              <GaugeChart
                value={statusCounts.pending || 0}
                maxValue={Math.max(shipments.length, 5)}
                label="Pending Orders"
                color="#f59e0b"
              />
            </div>
            <PieChart
              data={shipmentStatusData}
              colors={['#10b981', '#f59e0b', '#ef4444']}
            />
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '15px', flexWrap: 'wrap' }}>
              {shipmentStatusData.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '12px', height: '12px', backgroundColor: item.color, borderRadius: '2px' }}></div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {item.label}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🏭 Warehouse Intelligence</CardTitle>
          </CardHeader>
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>Overall Utilization</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#3b82f6' }}>
                  {warehouses.reduce((sum, w) => sum + Math.round((w.current_load / w.capacity) * 100), 0) / Math.max(warehouses.length, 1)}%
                </span>
              </div>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 6, height: 8, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${warehouses.reduce((sum, w) => sum + Math.round((w.current_load / w.capacity) * 100), 0) / Math.max(warehouses.length, 1)}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #10b981 0%, #f59e0b 60%, #ef4444 100%)',
                    borderRadius: 6,
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>
            <BarChart
              data={warehouseData}
              color="#3b82f6"
              maxValue={100}
            />
            <div style={{ marginTop: '15px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
              Individual warehouse capacity utilization
            </div>
          </div>
        </Card>
      </Grid2>

      {/* Fleet and Performance Metrics */}
      <Grid2 style={{ marginBottom: '24px' }}>
        <Card>
          <CardHeader>
            <CardTitle>🚛 Fleet Overview</CardTitle>
          </CardHeader>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '120px', marginBottom: '20px' }}>
              {vehicleChartData.map((item, index) => (
                <div key={index} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    backgroundColor: index === 0 ? '#10b981' : index === 1 ? '#f59e0b' : '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}>
                    {item.value}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ textAlign: 'center', padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#06b6d4' }}>
                  {vehicles.filter(v => v.fuel_level < 25).length}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Low Fuel</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#8b5cf6' }}>
                  {vehicles.filter(v => v.status === 'maintenance').length}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>In Maintenance</div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📈 Performance Dashboard</CardTitle>
          </CardHeader>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ textAlign: 'center', padding: '18px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.1)' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '4px' }}>
                  {Math.round((statusCounts.delivered || 0) / Math.max(shipments.length, 1) * 100)}%
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>Delivery Success</div>
                <div style={{ fontSize: '10px', color: '#10b981', marginTop: '4px' }}>↑ Trending up</div>
              </div>
              <div style={{ textAlign: 'center', padding: '18px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.1)' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981', marginBottom: '4px' }}>
                  {vehicles.filter(v => v.status === 'available').length}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>Fleet Availability</div>
                <div style={{ fontSize: '10px', color: '#06b6d4', marginTop: '4px' }}>● Real-time</div>
              </div>
              <div style={{ textAlign: 'center', padding: '18px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.1)' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '4px' }}>
                  {Math.round(warehouses.reduce((sum, w) => sum + (w.current_load / w.capacity), 0) / Math.max(warehouses.length, 1) * 100)}%
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>Capacity Used</div>
                <div style={{ fontSize: '10px', color: '#f59e0b', marginTop: '4px' }}>⚠ Monitor closely</div>
              </div>
              <div style={{ textAlign: 'center', padding: '18px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.1)' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444', marginBottom: '4px' }}>
                  {alerts.filter(a => a.type === 'error').length}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>Critical Alerts</div>
                <div style={{ fontSize: '10px', color: '#ef4444', marginTop: '4px' }}>⚡ Requires attention</div>
              </div>
            </div>
          </div>
        </Card>
      </Grid2>

      {/* Action Controls */}
      <div style={{ display: 'flex', gap: 16, marginBottom: '24px', justifyContent: 'center', alignItems: 'center' }}>
        <Button $variant="primary" onClick={() => setShowForm(!showForm)} style={{ padding: '12px 24px', fontSize: '14px' }}>
          {showForm ? '✕ Close Form' : '➕ Create New Shipment'}
        </Button>
        <Button $variant="secondary" onClick={loadData} style={{ padding: '12px 24px', fontSize: '14px' }}>
          🔄 Refresh Dashboard
        </Button>
        <div style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)' }}>
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Create Shipment Form */}
      {showForm && (
        <Card style={{ marginBottom: '24px', border: '2px solid var(--accent-blue)', boxShadow: '0 4px 20px rgba(59,130,246,0.1)' }}>
          <CardHeader>
            <CardTitle>📝 New Shipment Request</CardTitle>
          </CardHeader>
          <ShipmentForm
            onCreated={() => {
              setShowForm(false);
              loadData();
            }}
          />
        </Card>
      )}

      {/* Detailed Analytics and Data Tables */}
      <Grid2>
        {/* Shipments Management */}
        <Card>
          <CardHeader>
            <CardTitle>📦 Active Shipments</CardTitle>
            <Badge $type="standard">{shipments.length}</Badge>
          </CardHeader>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {shipments.slice(0, 12).map((s) => (
              <div
                key={s.id}
                style={{
                  padding: '14px 0',
                  borderBottom: '1px solid var(--borderLight)',
                  fontSize: '0.85rem',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: 'var(--accent-blue)', fontSize: '0.9rem' }}>{s.id}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Badge $type={s.priority === 'High' ? 'high' : 'standard'}>{s.priority}</Badge>
                    <Badge $type={s.status}>{s.status}</Badge>
                  </div>
                </div>
                <div style={{ color: 'var(--text-muted)', marginBottom: 6, fontSize: '0.8rem' }}>
                  {s.source_name} → {s.destination_name}
                </div>
                {s.transport_mode && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginBottom: 6 }}>
                    🚀 {s.transport_mode} • {s.vehicle_id || 'unassigned'}
                  </div>
                )}
                {s.status === 'pending' && (
                  <Button
                      $variant="secondary"
                    style={{ marginTop: 6, padding: '4px 12px', fontSize: '0.7rem' }}
                    onClick={() => handleOptimize(s.id)}
                    disabled={optimizing === s.id}
                  >
                    {optimizing === s.id ? '⏳ Optimizing...' : '🧠 Optimize Route'}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Warehouse Operations & Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Warehouse Status */}
          <Card>
            <CardHeader>
              <CardTitle>🏭 Warehouse Operations</CardTitle>
              <Badge $type="standard">{warehouses.length}</Badge>
            </CardHeader>
            <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
              {warehouses.map((w) => {
                const usage = Math.round((w.current_load / w.capacity) * 100);
                return (
                  <div key={w.id} style={{
                    padding: '12px 0',
                    borderBottom: '1px solid var(--borderLight)',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    backgroundColor: usage > 80 ? 'rgba(239,68,68,0.05)' : 'transparent'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{w.name}</div>
                      <div style={{ fontSize: '0.8rem', color: usage > 80 ? '#ef4444' : 'var(--text-muted)' }}>
                        {usage}%
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                      {w.zone} • {w.type}
                    </div>
                    <div style={{ background: 'var(--bg-secondary)', borderRadius: 6, height: 6, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${usage}%`,
                          height: '100%',
                          background: usage > 80 ? 'linear-gradient(90deg, #ef4444, #dc2626)' :
                                     usage > 50 ? 'linear-gradient(90deg, #f59e0b, #d97706)' :
                                     'linear-gradient(90deg, #10b981, #059669)',
                          borderRadius: 6,
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      {w.current_load}/{w.capacity} units
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* System Alerts */}
          <Card style={{ flex: 1 }}>
            <CardHeader>
              <CardTitle>⚠️ System Alerts & Notifications</CardTitle>
            </CardHeader>
            <AlertPanel alerts={alerts} />
          </Card>
        </div>
      </Grid2>
    </PageContainer>
  );
}

export default ManagerPage;
