import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getDashboard, getVehicles, getWarehouses, getShipments } from '../services/api';
import { connectSocket } from '../services/socket';
import AlertPanel from '../components/Alerts/AlertPanel';
import MapView from '../components/Map/MapView';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  flex-wrap: wrap;
`;

const PageTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  h1 {
    font-size: clamp(2rem, 2.8vw, 2.6rem);
    letter-spacing: -0.04em;
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    max-width: 680px;
    line-height: 1.6;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  width: 100%;

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryCard = styled.div`
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 24px;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const StatTitle = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 10px;
`;

const StatValue = styled.div`
  font-size: 2.1rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  letter-spacing: -0.03em;
`;

const SectionGrid = styled.div`
  display: grid;
  gap: 24px;
  grid-template-columns: 1.8fr 1.2fr;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const SectionCard = styled.div`
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 22px 24px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const SectionTitle = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const SectionSubtitle = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.85rem;
`;

const SectionBody = styled.div`
  padding: 18px 24px 24px;
`;

const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;
  color: ${({ theme }) => theme.colors.textPrimary};

  th,
  td {
    padding: 12px 10px;
    text-align: left;
  }

  th {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-weight: 700;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    font-size: 0.78rem;
  }

  td {
    border-top: 1px solid ${({ theme }) => theme.colors.border};
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
  background: ${({ $palette }) => $palette || '#64748b'};
`;

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agentStatuses, setAgentStatuses] = useState(null);

  const statusCounts = shipments.reduce((acc, shipment) => {
    const key = shipment.status || 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const warehouseStats = warehouses.map((warehouse) => ({
    ...warehouse,
    utilization: warehouse.capacity ? Math.round((warehouse.current_load / warehouse.capacity) * 100) : 0,
  }));

  const sortedWarehouses = [...warehouseStats].sort((a, b) => b.utilization - a.utilization).slice(0, 5);

  const vehicleStatusCounts = vehicles.reduce((acc, vehicle) => {
    const status = vehicle.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const activeShipments = shipments.filter((s) => s.status === 'in_transit').slice(0, 6);
  const topVehicles = vehicles.slice().sort((a, b) => (b.fuel_level || 0) - (a.fuel_level || 0)).slice(0, 6);

  useEffect(() => {
    // Fetch all dashboard data
    Promise.all([
      getDashboard().then((r) => r.data.data).catch(() => null),
      getVehicles().then((r) => r.data.data || []).catch(() => []),
      getWarehouses().then((r) => r.data.data || []).catch(() => []),
      getShipments().then((r) => r.data.data || []).catch(() => []),
    ]).then(([dashData, veh, wh, shp]) => {
      setStats(dashData);
      setVehicles(veh);
      setWarehouses(wh);
      setShipments(shp);
      setLoading(false);
    });

    // Fetch agent statuses
    fetch('/api/agents')
      .then((r) => {
        if (!r.ok) throw new Error('Agent API not available');
        return r.json();
      })
      .then((r) => {
        if (r.success) setAgentStatuses(r.data);
      })
      .catch(() => {
        setAgentStatuses(null);
      });

    // Connect socket for live updates
    const socket = connectSocket();

    socket.on('notification', (notif) => {
      setAlerts((prev) => [notif, ...prev].slice(0, 20));
    });

    socket.on('disruption', (disruption) => {
      setAlerts((prev) => [{ ...disruption, type: 'disruption', message: disruption.message }, ...prev].slice(0, 20));
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
      socket.off('notification');
      socket.off('disruption');
      socket.off('vehicle_location_update');
    };
  }, []);

  if (loading) {
    return (
      <PageWrapper>
        <DashboardHeader>
          <PageTitle>
            <h1>Dashboard</h1>
            <p>Loading enterprise supply chain telemetry and live map data.</p>
          </PageTitle>
        </DashboardHeader>

        <SummaryGrid>
          {[...Array(4)].map((_, index) => (
            <SummaryCard key={index} style={{ opacity: 0.55 }}>
              <StatTitle>Loading</StatTitle>
              <StatValue>—</StatValue>
            </SummaryCard>
          ))}
        </SummaryGrid>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <DashboardHeader>
        <PageTitle>
          <h1>Operations Command Center</h1>
          <p>Real-time shipment visibility, live vehicle tracking, and operational alerts across the Bangalore network.</p>
        </PageTitle>
      </DashboardHeader>

      <SummaryGrid>
        <SummaryCard>
          <StatTitle>Total Shipments</StatTitle>
          <StatValue>{shipments.length}</StatValue>
        </SummaryCard>
        <SummaryCard>
          <StatTitle>Vehicles Active</StatTitle>
          <StatValue>{vehicles.length}</StatValue>
        </SummaryCard>
        <SummaryCard>
          <StatTitle>Warehouses Online</StatTitle>
          <StatValue>{warehouses.length}</StatValue>
        </SummaryCard>
        <SummaryCard>
          <StatTitle>Total Load (kg)</StatTitle>
          <StatValue>{stats?.shipments?.totalWeight || 0}</StatValue>
        </SummaryCard>
      </SummaryGrid>

      <SectionGrid>
        <SectionCard>
          <SectionHeader>
            <SectionTitle>Live Bangalore Network</SectionTitle>
            <SectionSubtitle>Map rendered with real tile data and live location updates.</SectionSubtitle>
          </SectionHeader>
          <SectionBody>
            <MapView vehicles={vehicles} warehouses={warehouses} shipments={shipments} />
          </SectionBody>
        </SectionCard>

        <SectionCard>
          <SectionHeader>
            <SectionTitle>Shipment Status</SectionTitle>
            <SectionSubtitle>{shipments.length} total shipments</SectionSubtitle>
          </SectionHeader>
          <SectionBody>
            {['delivered', 'in_transit', 'pending', 'unknown'].map((status) => (
              <div key={status} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.95rem' }}>
                  <span style={{ color: '#94a3b8' }}>{status.replace('_', ' ')}</span>
                  <strong>{statusCounts[status] || 0}</strong>
                </div>
                <div style={{ background: '#111827', borderRadius: 999, height: 10, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(((statusCounts[status] || 0) / Math.max(shipments.length, 1)) * 100, 100)}%`,
                      height: '100%',
                      borderRadius: 999,
                      background: status === 'delivered' ? '#10b981' : status === 'in_transit' ? '#06b6d4' : '#f59e0b',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </SectionBody>
        </SectionCard>
      </SectionGrid>

      <SectionGrid>
        <SectionCard>
          <SectionHeader>
            <SectionTitle>Active Shipments</SectionTitle>
            <SectionSubtitle>{activeShipments.length} shipments currently in transit</SectionSubtitle>
          </SectionHeader>
          <SectionBody>
            <DataTable>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Route</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {activeShipments.map((shipment) => (
                  <tr key={shipment.id}>
                    <td>{shipment.id}</td>
                    <td>{shipment.source_name || 'Source'} → {shipment.destination_name || 'Destination'}</td>
                    <td>
                      <StatusBadge $palette={shipment.status === 'delivered' ? '#10b981' : shipment.status === 'in_transit' ? '#06b6d4' : '#f59e0b'}>
                        {shipment.status.replace('_', ' ')}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </SectionBody>
        </SectionCard>

        <SectionCard>
          <SectionHeader>
            <SectionTitle>Fleet Overview</SectionTitle>
            <SectionSubtitle>{vehicles.length} connected vehicles</SectionSubtitle>
          </SectionHeader>
          <SectionBody>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14, marginBottom: 22 }}>
              {Object.entries(vehicleStatusCounts).map(([status, count]) => (
                <div key={status} style={{ background: '#0f172a', borderRadius: 16, padding: 18 }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{count}</div>
                  <div style={{ marginTop: 8, fontSize: '0.82rem', color: '#94a3b8', textTransform: 'capitalize' }}>{status.replace('_', ' ')}</div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12 }}>Top Vehicles by Fuel</div>
              <DataTable>
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th style={{ textAlign: 'right' }}>Fuel</th>
                  </tr>
                </thead>
                <tbody>
                  {topVehicles.map((vehicle) => (
                    <tr key={vehicle.id}>
                      <td>{vehicle.id}</td>
                      <td style={{ textAlign: 'right' }}>{vehicle.fuel_level ?? 'N/A'}%</td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            </div>
          </SectionBody>
        </SectionCard>
      </SectionGrid>

      {agentStatuses && (
        <SectionCard>
          <SectionHeader>
            <SectionTitle>AI Agent Status</SectionTitle>
            <SectionSubtitle>{Object.keys(agentStatuses).length} agents monitored</SectionSubtitle>
          </SectionHeader>
          <SectionBody style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
            {Object.entries(agentStatuses).map(([name, status]) => {
              if (!status || !status.agent) return null;
              return (
                <div key={name} style={{ background: '#0f172a', borderRadius: 18, padding: 18, border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: 8 }}>{status.agent}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: status.active !== false ? '#10b981' : '#ef4444' }} />
                    <strong>{status.active !== false ? 'Active' : 'Inactive'}</strong>
                  </div>
                  {status.metrics && (
                    <div style={{ marginTop: 10, fontSize: '0.82rem', color: '#94a3b8' }}>Tasks: {status.metrics.tasksProcessed || 0}</div>
                  )}
                </div>
              );
            })}
          </SectionBody>
        </SectionCard>
      )}

      <SectionCard>
        <SectionHeader>
          <SectionTitle>Recent Alerts</SectionTitle>
          <SectionSubtitle>Latest operational updates and disruption notices</SectionSubtitle>
        </SectionHeader>
        <SectionBody>
          <AlertPanel alerts={alerts.slice(0, 8)} />
        </SectionBody>
      </SectionCard>
    </PageWrapper>
  );
}

export default Dashboard;
