import React, { useState, useEffect } from 'react';
import { getShipments, createShipment } from '../services/api';
import { useAuth } from '../store/AuthContext';
import ShipmentCard from '../components/Shipment/ShipmentCard';
import { PageContainer, PageHeader, StatsGrid, StatCard, StatIcon, StatValue, StatLabel, Card, CardHeader, CardTitle, Badge, Button } from '../components/SharedStyles';
import { TabsContainer, TabButton, CustomerInput, FiltersContainer, FilterBtn, DataTable, AlertBox, FormSection, FormSectionTitle, FormGrid, FormGroup, SizeSelector, SizeBtn, PriorityGrid, PriorityBtn, FormActions, ProfileSection, ProfileAvatar, ProfileInfo, SessionCard } from './CustomerPage.styles';

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
  { name: 'HSR Layout', lat: 12.9121, lng: 77.6446 },
  { name: 'Marathahalli', lat: 12.9591, lng: 77.6974 },
  { name: 'Yelahanka', lat: 13.1005, lng: 77.5940 },
  { name: 'JP Nagar', lat: 12.9063, lng: 77.5857 },
  { name: 'Banashankari', lat: 12.9255, lng: 77.5468 },
  { name: 'Sarjapur', lat: 12.8589, lng: 77.7866 },
];

const INITIAL_FORM = {
  source: 0,
  destination: 1,
  weight_kg: '5',
  size: 'medium',
  priority: 'standard',
  senderName: '',
  senderPhone: '',
  receiverName: '',
  receiverPhone: '',
  description: '',
};

function CustomerPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('shipments');
  const [shipments, setShipments] = useState([]);
  const [trackingId, setTrackingId] = useState('');
  const [tracked, setTracked] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadShipments = () => {
    getShipments()
      .then((res) => setShipments(res.data.data || []))
      .catch(() => {});
  };

  useEffect(() => {
    loadShipments();
  }, []);

  // Track shipment
  const handleTrack = () => {
    const found = shipments.find((s) => s.id === trackingId.toUpperCase());
    setTracked(found || null);
  };

  // Create shipment
  const handleCreateShipment = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    setFormSuccess('');

    const src = LOCATIONS[form.source];
    const dst = LOCATIONS[form.destination];

    if (form.source === form.destination) {
      setFormError('Source and destination cannot be the same.');
      setFormLoading(false);
      return;
    }

    try {
      const res = await createShipment({
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
      const newId = res.data?.data?.id || 'N/A';
      setFormSuccess(`Shipment ${newId} created successfully!`);
      setForm(INITIAL_FORM);
      loadShipments();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create shipment. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  // Filtered shipments
  const filteredShipments = statusFilter === 'all'
    ? shipments
    : shipments.filter(s => s.status === statusFilter);

  // Stats
  const stats = {
    total: shipments.length,
    pending: shipments.filter(s => s.status === 'pending').length,
    in_transit: shipments.filter(s => s.status === 'in_transit').length,
    delivered: shipments.filter(s => s.status === 'delivered').length,
  };

  const tabs = [
    { id: 'shipments', icon: '📦', label: 'My Shipments' },
    { id: 'create', icon: '➕', label: 'Create Shipment' },
    { id: 'account', icon: '👤', label: 'Account' },
  ];

  return (
    <PageContainer>
      <PageHeader>
        <h1>📦 Order Portal</h1>
        <p>Welcome back, {user?.full_name || user?.username || 'User'}</p>
      </PageHeader>

      {/* Tab Navigation */}
      <TabsContainer>
        {tabs.map(tab => (
          <TabButton
            key={tab.id}
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </TabButton>
        ))}
      </TabsContainer>

      {/* ═══════════════════════════════════════════════════════
          TAB 1: My Shipments
          ═══════════════════════════════════════════════════════ */}
      {activeTab === 'shipments' && (
        <div className="fade-in">
          {/* Quick Stats */}
          <StatsGrid>
            <StatCard color="accentBlue">
              <StatIcon>📊</StatIcon>
              <StatValue>{stats.total}</StatValue>
              <StatLabel>Total Shipments</StatLabel>
            </StatCard>
            <StatCard color="accentAmber">
              <StatIcon>⏳</StatIcon>
              <StatValue>{stats.pending}</StatValue>
              <StatLabel>Pending</StatLabel>
            </StatCard>
            <StatCard color="accentGreen">
              <StatIcon>🚛</StatIcon>
              <StatValue>{stats.in_transit}</StatValue>
              <StatLabel>In Transit</StatLabel>
            </StatCard>
            <StatCard color="accentGreen">
              <StatIcon>✅</StatIcon>
              <StatValue>{stats.delivered}</StatValue>
              <StatLabel>Delivered</StatLabel>
            </StatCard>
          </StatsGrid>

          {/* Track Shipment */}
          <Card style={{ marginBottom: 20 }}>
            <CardHeader>
              <CardTitle>🔍 Track Shipment</CardTitle>
            </CardHeader>
            <div style={{ display: 'flex', gap: 12 }}>
              <CustomerInput
                type="text"
                placeholder="Enter Shipment ID (e.g. SHP-001)"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
              />
              <Button $variant="primary" onClick={handleTrack}>
                🔍 Track
              </Button>
            </div>

            {tracked && (
              <div style={{ marginTop: 16 }}>
                <ShipmentCard shipment={tracked} />
              </div>
            )}

            {trackingId && !tracked && (
              <p style={{ marginTop: 12, color: 'var(--accent-red)', fontSize: '0.85rem' }}>
                Shipment not found. Check the ID and try again.
              </p>
            )}
          </Card>

          {/* Shipment List with Filters */}
          <Card>
            <CardHeader>
              <CardTitle>All Shipments</CardTitle>
              <FiltersContainer>
                {['all', 'pending', 'assigned', 'in_transit', 'delivered'].map(f => (
                  <FilterBtn
                    key={f}
                    className={statusFilter === f ? 'active' : ''}
                    onClick={() => setStatusFilter(f)}
                  >
                    {f === 'all' ? 'All' : f.replace('_', ' ')}
                  </FilterBtn>
                ))}
              </FiltersContainer>
            </CardHeader>
            <DataTable>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Weight</th>
                  <th>SLA</th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No shipments found</td></tr>
                ) : (
                  filteredShipments.map((s) => (
                    <tr key={s.id} onClick={() => { setTrackingId(s.id); setTracked(s); }} style={{ cursor: 'pointer' }}>
                      <td style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{s.id}</td>
                      <td>{s.source_name}</td>
                      <td>{s.destination_name}</td>
                      <td><Badge $type={s.priority === 'High' ? 'high' : 'standard'}>{s.priority}</Badge></td>
                      <td><Badge $type={s.status}>{s.status}</Badge></td>
                      <td>{s.weight_kg} kg</td>
                      <td>{s.sla_hours}h</td>
                    </tr>
                  ))
                )}
              </tbody>
            </DataTable>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB 2: Create Shipment
          ═══════════════════════════════════════════════════════ */}
      {activeTab === 'create' && (
        <div className="fade-in">
          <Card>
            <CardHeader>
              <CardTitle>📦 New Shipment</CardTitle>
            </CardHeader>

            {formSuccess && (
              <AlertBox className="success">✅ {formSuccess}</AlertBox>
            )}
            {formError && (
              <AlertBox className="error">❌ {formError}</AlertBox>
            )}

            <form onSubmit={handleCreateShipment}>
              {/* Sender & Receiver Info */}
              <FormSection>
                <FormSectionTitle>👤 Sender & Receiver Details</FormSectionTitle>
                <FormGrid>
                  <FormGroup>
                    <label>Sender Name</label>
                    <CustomerInput
                      type="text"
                      placeholder="Your full name"
                      value={form.senderName}
                      onChange={e => setForm({...form, senderName: e.target.value})}
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Sender Phone</label>
                    <CustomerInput
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={form.senderPhone}
                      onChange={e => setForm({...form, senderPhone: e.target.value})}
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Receiver Name</label>
                    <CustomerInput
                      type="text"
                      placeholder="Receiver's full name"
                      value={form.receiverName}
                      onChange={e => setForm({...form, receiverName: e.target.value})}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Receiver Phone</label>
                    <CustomerInput
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={form.receiverPhone}
                      onChange={e => setForm({...form, receiverPhone: e.target.value})}
                      required
                    />
                  </FormGroup>
                </FormGrid>
              </FormSection>

              {/* Package Details */}
              <FormSection>
                <FormSectionTitle>📦 Package Details</FormSectionTitle>
                
                <FormGroup style={{ marginBottom: 16 }}>
                  <label>Package Content Description</label>
                  <CustomerInput
                    type="text"
                    placeholder="E.g., Electronics, Books, Clothing..."
                    value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                    required
                  />
                </FormGroup>

                <FormGrid>
                  <FormGroup>
                    <label>Weight (kg)</label>
                    <CustomerInput
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="e.g. 5"
                      value={form.weight_kg}
                      onChange={e => setForm({...form, weight_kg: e.target.value})}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Package Size</label>
                    <SizeSelector>
                      {['small', 'medium', 'large', 'pallet'].map(sz => (
                        <SizeBtn
                          key={sz}
                          type="button"
                          className={form.size === sz ? 'active' : ''}
                          onClick={() => setForm({...form, size: sz})}
                        >
                          {sz === 'small' ? '📦' : sz === 'medium' ? '🎒' : sz === 'large' ? '🛋️' : '🏗️'}
                          {sz.charAt(0).toUpperCase() + sz.slice(1)}
                          <span>{sz === 'small' ? '< 5kg' : sz === 'medium' ? '5-20kg' : sz === 'large' ? '20-50kg' : '> 50kg'}</span>
                        </SizeBtn>
                      ))}
                    </SizeSelector>
                  </FormGroup>
                </FormGrid>
              </FormSection>

              {/* Routing Details */}
              <FormSection>
                <FormSectionTitle>🗺️ Routing & Delivery</FormSectionTitle>
                <FormGrid>
                  <FormGroup>
                    <label>Pickup Location</label>
                    <select
                      value={form.source}
                      onChange={(e) => setForm({ ...form, source: parseInt(e.target.value) })}
                    >
                      {LOCATIONS.map((loc, i) => (
                        <option key={i} value={i}>{loc.name}</option>
                      ))}
                    </select>
                  </FormGroup>

                  <FormGroup>
                    <label>Destination Location</label>
                    <select
                      value={form.destination}
                      onChange={(e) => setForm({ ...form, destination: parseInt(e.target.value) })}
                    >
                      {LOCATIONS.map((loc, i) => (
                        <option key={i} value={i}>{loc.name}</option>
                      ))}
                    </select>
                  </FormGroup>
                </FormGrid>

                <FormGroup style={{ marginTop: 24 }}>
                  <label>Delivery Priority & SLA</label>
                  <PriorityGrid>
                    {[
                      { id: 'critical', icon: '🚨', label: 'Critical', sla: '2 Hours', price: '₹450', color: 'var(--accent-red)' },
                      { id: 'express', icon: '⚡', label: 'Express', sla: '6 Hours', price: '₹250', color: 'var(--accent-amber)' },
                      { id: 'standard', icon: '🚚', label: 'Standard', sla: '24 Hours', price: '₹120', color: 'var(--accent-blue)' },
                      { id: 'economy', icon: '🐢', label: 'Economy', sla: '3 Days', price: '₹60', color: 'var(--accent-green)' }
                    ].map(p => (
                      <PriorityBtn
                        key={p.id}
                        type="button"
                        className={form.priority === p.id ? 'active' : ''}
                        color={p.color}
                        onClick={() => setForm({...form, priority: p.id})}
                      >
                        <span className="icon">{p.icon}</span>
                        <span className="label">{p.label}</span>
                        <span className="sla">{p.sla}</span>
                        <span className="price">{p.price}</span>
                      </PriorityBtn>
                    ))}
                  </PriorityGrid>
                </FormGroup>
              </FormSection>

              <FormActions>
                <Button type="button" $variant="secondary" onClick={() => setForm(INITIAL_FORM)}>Clear Form</Button>
                <Button type="submit" $variant="primary" disabled={formLoading}>
                  {formLoading ? '⏳ Generating...' : '✨ Create Shipment'}
                </Button>
              </FormActions>
            </form>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB 3: Account
          ═══════════════════════════════════════════════════════ */}
      {activeTab === 'account' && (
        <div className="fade-in">
          <Card style={{ marginBottom: 20 }}>
            <ProfileSection>
              <ProfileAvatar>
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'C'}
              </ProfileAvatar>
              <ProfileInfo>
                <h2>{user?.full_name || 'Customer Account'}</h2>
                <p>Member since {new Date().getFullYear()}</p>
                <div style={{ marginTop: 12, display: 'flex', gap: 20 }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Username</span>
                    <div style={{ fontWeight: 600 }}>{user?.username}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email</span>
                    <div style={{ fontWeight: 600 }}>{user?.email || '—'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Role</span>
                    <div><Badge $type={user?.role}>{user?.role}</Badge></div>
                  </div>
                </div>
              </ProfileInfo>
            </ProfileSection>

            <CardHeader style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <CardTitle>📊 Activity Summary</CardTitle>
            </CardHeader>
            <StatsGrid>
              <StatCard color="accentBlue">
                <StatValue>{stats.total}</StatValue>
                <StatLabel>Total Shipments</StatLabel>
              </StatCard>
              <StatCard color="accentGreen">
                <StatValue>{stats.delivered}</StatValue>
                <StatLabel>Delivered</StatLabel>
              </StatCard>
              <StatCard color="accentAmber">
                <StatValue>{stats.in_transit}</StatValue>
                <StatLabel>In Transit</StatLabel>
              </StatCard>
            </StatsGrid>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔐 Session</CardTitle>
            </CardHeader>
            <SessionCard>
              <p>You are signed in as <strong>{user?.full_name || user?.username}</strong>.</p>
              <Button $variant="secondary" onClick={logout}>
                🚪 Sign Out
              </Button>
            </SessionCard>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}

export default CustomerPage;
