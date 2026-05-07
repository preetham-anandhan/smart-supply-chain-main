import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getVehicles, getDriverAssignment, startTrip, completeTrip, getDirections, rerouteVehicle } from '../services/api';
import { connectSocket } from '../services/socket';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  DriverPageContainer, TopBar, TopBarLeft, TopBarIcon, TopBarName, TopBarId,
  TopBarRight, FuelPill, FuelTrack, FuelFill, StatusPill, ContentArea, Sidebar,
  SidebarTitle, ShiftCard, ShiftRow, ShiftLabel, ShiftVal, ShiftBadge,
  VehicleList, VehicleItem, VehicleIcon, VehicleName, VehicleTime, MainPanel,
  MapWrapper, MapOverlayInfo, OverlayStat, OverlayVal, OverlayUnit, OverlayDivider,
  MapLegend, LegendDot, LegendLine, BottomPanel, ScheduleStrip, SchedulePoint,
  ScheduleDot, ScheduleLabel, SchedulePlace, ScheduleTime, UpdatedBadge, ScheduleArrow,
  ScheduleLine, ScheduleActions, BtnStart, BtnReached, BtnReroute, CompletedPill,
  NoAssignment, DetailsRow, Card, CardTitle, ConditionsBadge, StepsContainer, Step,
  StepNum, StepText, StepInstr, StepDist, EmptyMsg, ParcelsList, ParcelItem,
  ParcelId, ParcelRoute, AlertsCompactList, AlertCompactItem
} from './DriverPage.styles';

// Fix for default markers in leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
// Bangalore road network for rendering on map
const BANGALORE_NODES = {
  majestic: { name: 'Majestic', lat: 12.9767, lng: 77.5713 },
  koramangala: { name: 'Koramangala', lat: 12.9352, lng: 77.6245 },
  whitefield: { name: 'Whitefield', lat: 12.9698, lng: 77.7500 },
  electronic_city: { name: 'Electronic City', lat: 12.8399, lng: 77.6770 },
  yeshwantpur: { name: 'Yeshwantpur', lat: 13.0227, lng: 77.5500 },
  jayanagar: { name: 'Jayanagar', lat: 12.9299, lng: 77.5838 },
  hebbal: { name: 'Hebbal', lat: 13.0358, lng: 77.5970 },
  kr_puram: { name: 'KR Puram', lat: 13.0012, lng: 77.6960 },
  indiranagar: { name: 'Indiranagar', lat: 12.9784, lng: 77.6408 },
  btm_layout: { name: 'BTM Layout', lat: 12.9166, lng: 77.6101 },
  hsr_layout: { name: 'HSR Layout', lat: 12.9121, lng: 77.6446 },
  marathahalli: { name: 'Marathahalli', lat: 12.9591, lng: 77.6974 },
  silk_board: { name: 'Silk Board', lat: 12.9172, lng: 77.6230 },
  mg_road: { name: 'MG Road', lat: 12.9756, lng: 77.6068 },
  yelahanka: { name: 'Yelahanka', lat: 13.1005, lng: 77.5940 },
  bannerghatta: { name: 'Bannerghatta', lat: 12.8002, lng: 77.5773 },
  rajajinagar: { name: 'Rajajinagar', lat: 12.9883, lng: 77.5533 },
  malleshwaram: { name: 'Malleshwaram', lat: 13.0035, lng: 77.5648 },
  domlur: { name: 'Domlur', lat: 12.9610, lng: 77.6387 },
  bellandur: { name: 'Bellandur', lat: 12.9260, lng: 77.6762 },
  sarjapur: { name: 'Sarjapur', lat: 12.8589, lng: 77.7866 },
  jp_nagar: { name: 'JP Nagar', lat: 12.9063, lng: 77.5857 },
  basavanagudi: { name: 'Basavanagudi', lat: 12.9422, lng: 77.5737 },
  sadashivanagar: { name: 'Sadashivanagar', lat: 13.0076, lng: 77.5810 },
};

const BANGALORE_EDGES = [
  ['majestic','mg_road'],['majestic','rajajinagar'],['majestic','basavanagudi'],
  ['mg_road','indiranagar'],['mg_road','domlur'],['indiranagar','koramangala'],
  ['indiranagar','marathahalli'],['koramangala','btm_layout'],['koramangala','hsr_layout'],
  ['koramangala','silk_board'],['koramangala','domlur'],['silk_board','btm_layout'],
  ['silk_board','hsr_layout'],['silk_board','electronic_city'],['silk_board','bellandur'],
  ['hsr_layout','bellandur'],['hsr_layout','electronic_city'],['bellandur','marathahalli'],
  ['bellandur','sarjapur'],['bellandur','whitefield'],['marathahalli','whitefield'],
  ['marathahalli','kr_puram'],['whitefield','kr_puram'],['kr_puram','hebbal'],
  ['hebbal','yeshwantpur'],['hebbal','yelahanka'],['hebbal','sadashivanagar'],
  ['yeshwantpur','malleshwaram'],['yeshwantpur','rajajinagar'],['malleshwaram','rajajinagar'],
  ['malleshwaram','sadashivanagar'],['rajajinagar','basavanagudi'],
  ['basavanagudi','jayanagar'],['jayanagar','jp_nagar'],['jayanagar','btm_layout'],
  ['jp_nagar','bannerghatta'],['electronic_city','bannerghatta'],['electronic_city','sarjapur'],
];

const MAP_BOUNDS = { minLat: 12.75, maxLat: 13.15, minLng: 77.42, maxLng: 77.85 };
const MAP_W = 900, MAP_H = 640;

function toMapXY(lat, lng) {
  const x = ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * MAP_W;
  const y = ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * MAP_H;
  return { x, y };
}

function DriverPage() {
  const [vehicle, setVehicle] = useState(null);
  const [allVehicles, setAllVehicles] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [directions, setDirections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [rerouting, setRerouting] = useState(false);
  const [rerouteInfo, setRerouteInfo] = useState(null);
  const vehicleIdRef = useRef(null);

  // On mount: pick first assigned/in_transit vehicle as "my vehicle"
  useEffect(() => {
    getVehicles().then(r => {
      const veh = r.data.data || [];
      setAllVehicles(veh);
      const mine = veh.find(v => v.status === 'in_transit' || v.status === 'assigned') || veh[0];
      if (mine) { setVehicle(mine); vehicleIdRef.current = mine.id; }
      setLoading(false);
    }).catch(() => setLoading(false));

    const socket = connectSocket();
    socket.on('vehicle_location_update', (update) => {
      if (vehicleIdRef.current && update.id === vehicleIdRef.current) {
        setVehicle(prev => prev ? { ...prev, current_lat: update.lat, current_lng: update.lng, fuel_level: update.fuel_level } : prev);
      }
    });
    socket.on('disruption', (d) => {
      setAlerts(prev => [{ ...d, id: Date.now(), timestamp: new Date().toISOString() }, ...prev].slice(0, 8));
    });
    socket.on('notification', (n) => {
      if (n.message) setAlerts(prev => [{ ...n, id: Date.now(), timestamp: new Date().toISOString() }, ...prev].slice(0, 8));
    });
    return () => { socket.off('vehicle_location_update'); socket.off('disruption'); socket.off('notification'); };
  }, []);

  // Load assignment & directions when vehicle is set
  const loadData = useCallback(async () => {
    if (!vehicle) return;
    try {
      const [asnRes] = await Promise.all([getDriverAssignment(vehicle.id)]);
      setAssignment(asnRes.data.data);
      if (asnRes.data.data?.assignment?.shipments?.length > 0) {
        try {
          const dirRes = await getDirections(vehicle.id);
          setDirections(dirRes.data.data);
        } catch { setDirections(null); }
      }
    } catch { setAssignment(null); }
  }, [vehicle]);

  useEffect(() => { loadData(); }, [loadData]);

  // Actions
  const handleStart = async () => {
    setActionLoading('start');
    try { await startTrip(vehicle.id); await loadData(); } catch {}
    setActionLoading(null);
  };

  const handleComplete = async () => {
    setActionLoading('complete');
    try { await completeTrip(vehicle.id); await loadData(); setRerouteInfo(null); } catch {}
    setActionLoading(null);
  };

  const handleReroute = async () => {
    setRerouting(true);
    try {
      const res = await rerouteVehicle(vehicle.id);
      setRerouteInfo(res.data.data);
      const dirRes = await getDirections(vehicle.id);
      setDirections(dirRes.data.data);
      setAlerts(prev => [{ id: Date.now(), severity: 'medium', message: `Route updated: ${res.data.data.reason}`, timestamp: new Date().toISOString() }, ...prev].slice(0, 8));
    } catch {}
    setRerouting(false);
  };

  const tripStatus = assignment?.assignment?.trip_status || 'waiting';
  const hasAssignment = assignment?.assignment?.shipments?.length > 0;
  const routeCoords = directions?.route?.primary_route?.coordinates || [];
  const steps = directions?.steps || [];

  const fmtTime = (iso) => iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—';

  if (loading) {
    return (
      <div className="fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
        <div className="btn-spinner" style={{ width: 32, height: 32, borderColor: 'var(--border)', borderTopColor: 'var(--accent-blue)' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading your vehicle...</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="fade-in" style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🚛</div>
        <h2 style={{ marginBottom: 8 }}>No Vehicle Assigned</h2>
        <p style={{ color: 'var(--text-muted)' }}>Contact operations to get a vehicle assignment.</p>
      </div>
    );
  }

  // Map rendering helpers
  const sourceWH = assignment?.assignment?.source_warehouse;
  const destWH = assignment?.assignment?.destination_warehouse;
  const vPos = toMapXY(vehicle.current_lat, vehicle.current_lng);
  const srcPos = sourceWH ? toMapXY(sourceWH.lat, sourceWH.lng) : null;
  const dstPos = destWH ? toMapXY(destWH.lat, destWH.lng) : null;
  const routePoints = routeCoords.map(c => toMapXY(c.lat, c.lng));
  const routePolyline = routePoints.map(p => `${p.x},${p.y}`).join(' ');
  const distKm = directions?.route?.primary_route?.distance_km;
  const etaMin = directions?.route?.primary_route?.estimated_time_min || assignment?.assignment?.eta?.predicted_eta_min;

  return (
    <DriverPageContainer className="fade-in">
      {/* ── Top Bar ─────────────────────────── */}
      <TopBar>
        <TopBarLeft>
          <TopBarIcon>
            {vehicle.type === 'truck' ? '🚛' : vehicle.type === 'bike' ? '🏍️' : vehicle.type === 'drone' ? '🛸' : '🚐'}
          </TopBarIcon>
          <div>
            <TopBarName>{vehicle.name}</TopBarName>
            <TopBarId>{vehicle.id} • {vehicle.type} • {vehicle.capacity_kg}kg</TopBarId>
          </div>
        </TopBarLeft>
        <TopBarRight>
          <FuelPill>
            <span>⛽ {Math.round(vehicle.fuel_level)}%</span>
            <FuelTrack>
              <FuelFill style={{ width: `${vehicle.fuel_level}%`, background: vehicle.fuel_level > 25 ? '#10b981' : '#ef4444' }} />
            </FuelTrack>
          </FuelPill>
          <StatusPill className={tripStatus}>
            {tripStatus === 'waiting' ? '⏳ Waiting' : tripStatus === 'in_progress' ? '🚛 In Transit' : '✅ Completed'}
          </StatusPill>
        </TopBarRight>
      </TopBar>

      <ContentArea>
        {/* ── Left Sidebar: Shift & Vehicle Info ──────── */}
        <Sidebar className="fade-in">
          <SidebarTitle>Shift Details</SidebarTitle>
          <ShiftCard>
            <ShiftRow>
              <ShiftLabel>Timing</ShiftLabel>
              <ShiftVal>08:00 AM - 04:00 PM</ShiftVal>
            </ShiftRow>
            <ShiftRow>
              <ShiftLabel>Status</ShiftLabel>
              <ShiftBadge>Active</ShiftBadge>
            </ShiftRow>
          </ShiftCard>

          <SidebarTitle style={{ marginTop: '16px' }}>Vehicles Assigned</SidebarTitle>
          <VehicleList>
            <VehicleItem className="active">
              <VehicleIcon>
                {vehicle.type === 'truck' ? '🚛' : vehicle.type === 'bike' ? '🏍️' : vehicle.type === 'drone' ? '🛸' : '🚐'}
              </VehicleIcon>
              <div>
                <VehicleName>{vehicle.name}</VehicleName>
                <VehicleTime>Current Shift</VehicleTime>
              </div>
            </VehicleItem>
            {/* Mocking a second vehicle for the shift */}
            <VehicleItem>
              <VehicleIcon>🚐</VehicleIcon>
              <div>
                <VehicleName>Backup Van Delta</VehicleName>
                <VehicleTime>On Standby</VehicleTime>
              </div>
            </VehicleItem>
          </VehicleList>
        </Sidebar>

        {/* ── Main Panel ─────────────────────────────── */}
        <MainPanel>
          {/* ── Real-Time Map ─────────── */}
          <MapWrapper>
            <MapContainer 
              center={[vehicle.current_lat || 12.9716, vehicle.current_lng || 77.5946]} 
              zoom={12} 
              style={{ width: '100%', height: '100%', minHeight: '400px' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Source Warehouse */}
              {sourceWH && (
                <Marker position={[sourceWH.lat, sourceWH.lng]}>
                  <Popup>
                    <strong>Source:</strong> {sourceWH.name}
                  </Popup>
                </Marker>
              )}

              {/* Destination Warehouse */}
              {destWH && (
                <Marker position={[destWH.lat, destWH.lng]}>
                  <Popup>
                    <strong>Destination:</strong> {destWH.name}
                  </Popup>
                </Marker>
              )}

              {/* Route Path */}
              {routeCoords && routeCoords.length > 0 && (
                <Polyline 
                  positions={routeCoords.map(c => [c.lat, c.lng])} 
                  color="#3b82f6" 
                  weight={5} 
                  opacity={0.8}
                />
              )}

              {/* Driver Vehicle Location */}
              <Marker position={[vehicle.current_lat, vehicle.current_lng]}>
                <Popup>
                  <strong>{vehicle.name}</strong><br/>
                  {vehicle.type.toUpperCase()} - {vehicle.capacity_kg}kg
                </Popup>
              </Marker>
            </MapContainer>

            {/* Map Overlay: Route Info */}
            <MapOverlayInfo>
              {distKm ? (
                <>
                  <OverlayStat><OverlayVal>{distKm}</OverlayVal><OverlayUnit>km</OverlayUnit></OverlayStat>
                  <OverlayDivider />
                  <OverlayStat><OverlayVal>{etaMin || '—'}</OverlayVal><OverlayUnit>min</OverlayUnit></OverlayStat>
                  <OverlayDivider />
                  <OverlayStat><OverlayVal>{routeCoords.length}</OverlayVal><OverlayUnit>stops</OverlayUnit></OverlayStat>
                </>
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No route loaded</span>
              )}
            </MapOverlayInfo>

            {/* Map Legend */}
            <MapLegend>
              <span><LegendDot bg="#10b981" /> Source</span>
              <span><LegendDot bg="#06b6d4" /> You</span>
              <span><LegendDot bg="#ef4444" /> Destination</span>
              <span><LegendLine /> Shortest Route</span>
            </MapLegend>
          </MapWrapper>

          {/* ── Bottom Panel: Actions + Details ──── */}
          <BottomPanel>

            {/* Schedule + Actions */}
            <ScheduleStrip>
              {hasAssignment ? (
                <>
                  <SchedulePoint>
                    <ScheduleDot className="green" />
                    <div>
                      <ScheduleLabel>DEPART</ScheduleLabel>
                      <SchedulePlace>{sourceWH?.name || 'Source'}</SchedulePlace>
                      <ScheduleTime>{fmtTime(assignment.assignment.departure_time)}</ScheduleTime>
                    </div>
                  </SchedulePoint>
                  <ScheduleArrow>
                    <ScheduleLine />
                    <span>{assignment.assignment.distance_km} km • {assignment.assignment.eta?.predicted_eta_min || '—'} min</span>
                  </ScheduleArrow>
                  <SchedulePoint>
                    <ScheduleDot className="red" />
                    <div>
                      <ScheduleLabel>ARRIVE</ScheduleLabel>
                      <SchedulePlace>{destWH?.name || 'Destination'}</SchedulePlace>
                      <ScheduleTime>
                        {fmtTime(rerouteInfo?.new_arrival_time || assignment.assignment.arrival_time)}
                        {rerouteInfo && <UpdatedBadge>Updated</UpdatedBadge>}
                      </ScheduleTime>
                    </div>
                  </SchedulePoint>
                  <ScheduleActions>
                    {tripStatus === 'waiting' && (
                      <BtnStart onClick={handleStart} disabled={actionLoading === 'start'}>
                        {actionLoading === 'start' ? '⏳ Starting...' : '🚀 Started'}
                      </BtnStart>
                    )}
                    {tripStatus === 'in_progress' && (
                      <>
                        <BtnReached onClick={handleComplete} disabled={actionLoading === 'complete'}>
                          {actionLoading === 'complete' ? '⏳ ...' : '🏁 Reached'}
                        </BtnReached>
                        <BtnReroute onClick={handleReroute} disabled={rerouting}>
                          {rerouting ? '⏳' : '🔄'} Reroute
                        </BtnReroute>
                      </>
                    )}
                    {tripStatus === 'completed' && <CompletedPill>✅ Trip Complete</CompletedPill>}
                  </ScheduleActions>
                </>
              ) : (
                <NoAssignment>
                  <span>📭</span> No active assignment — waiting for dispatch
                </NoAssignment>
              )}
            </ScheduleStrip>

            {/* Directions Steps + Alerts Row */}
            {hasAssignment && (
              <DetailsRow>
                {/* Turn-by-turn */}
                <Card>
                  <CardTitle>
                    🧭 Directions — Shortest Path
                    {directions?.conditions && (
                      <ConditionsBadge>
                        🚦 ×{directions.conditions.traffic_factor?.toFixed(1)} &nbsp; 🌤️ {directions.conditions.weather?.condition || 'clear'}
                      </ConditionsBadge>
                    )}
                  </CardTitle>
                  {steps.length > 0 ? (
                    <StepsContainer>
                      {steps.map((s, i) => (
                        <Step key={i} className={`${s.is_current ? 'cur' : ''} ${s.is_destination ? 'dest' : ''}`}>
                          <StepNum>{s.is_current ? '📍' : s.is_destination ? '🏁' : i + 1}</StepNum>
                          <StepText>
                            <StepInstr>{s.instruction}</StepInstr>
                            {s.distance_to_next_km > 0 && <StepDist>↓ {s.distance_to_next_km} km</StepDist>}
                          </StepText>
                        </Step>
                      ))}
                    </StepsContainer>
                  ) : (
                    <EmptyMsg>Start the trip to load turn-by-turn directions</EmptyMsg>
                  )}
                </Card>

                {/* Parcels + Alerts */}
                <Card>
                  <CardTitle>📦 Parcels ({assignment.assignment.shipment_count})</CardTitle>
                  <ParcelsList>
                    {assignment.assignment.shipments.map(s => (
                      <ParcelItem key={s.id}>
                        <ParcelId>{s.id}</ParcelId>
                        <ParcelRoute>{s.source_name} → {s.destination_name}</ParcelRoute>
                        <span className={`badge ${s.status}`}>{s.status}</span>
                      </ParcelItem>
                    ))}
                  </ParcelsList>
                  {alerts.length > 0 && (
                    <>
                      <CardTitle style={{ marginTop: 16 }}>⚠️ Alerts</CardTitle>
                      <AlertsCompactList>
                        {alerts.slice(0, 4).map(a => (
                          <AlertCompactItem key={a.id}>
                            <span>{a.message}</span>
                            <span className="time">{a.timestamp ? new Date(a.timestamp).toLocaleTimeString() : ''}</span>
                          </AlertCompactItem>
                        ))}
                      </AlertsCompactList>
                    </>
                  )}
                </Card>
              </DetailsRow>
            )}
          </BottomPanel>
        </MainPanel>
      </ContentArea>
    </DriverPageContainer>
  );
}

export default DriverPage;
