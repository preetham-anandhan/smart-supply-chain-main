-- ==============================================
-- Smart Supply Chain — PostgreSQL Schema
-- Run this against the 'supply_chain' database
-- ==============================================

-- Drop tables if they exist (for clean re-runs)
DROP TABLE IF EXISTS event_logs CASCADE;
DROP TABLE IF EXISTS routes CASCADE;
DROP TABLE IF EXISTS shipments CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS warehouses CASCADE;

-- ==============================================
-- 1. Vehicles Table (created FIRST — referenced by shipments)
-- ==============================================
CREATE TABLE IF NOT EXISTS vehicles (
    id                  VARCHAR(20) PRIMARY KEY,
    name                VARCHAR(100) NOT NULL,
    type                VARCHAR(20) DEFAULT 'van'
                        CHECK (type IN ('van', 'truck', 'bike', 'drone')),
    capacity_kg         DOUBLE PRECISION DEFAULT 200,
    current_lat         DOUBLE PRECISION NOT NULL,
    current_lng         DOUBLE PRECISION NOT NULL,
    fuel_level          INTEGER DEFAULT 100 CHECK (fuel_level BETWEEN 0 AND 100),
    status              VARCHAR(30) DEFAULT 'available'
                        CHECK (status IN ('available', 'assigned', 'in_transit',
                                          'maintenance', 'unavailable')),
    assigned_shipments  JSONB DEFAULT '[]'::jsonb,
    route               JSONB DEFAULT NULL,
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- 2. Warehouses Table
-- ==============================================
CREATE TABLE IF NOT EXISTS warehouses (
    id              VARCHAR(20) PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    lat             DOUBLE PRECISION NOT NULL,
    lng             DOUBLE PRECISION NOT NULL,
    zone            VARCHAR(50) DEFAULT 'Unknown',
    capacity        INTEGER DEFAULT 500,
    current_load    INTEGER DEFAULT 0,
    type            VARCHAR(30) DEFAULT 'warehouse'
                    CHECK (type IN ('warehouse', 'distribution', 'micro_hub',
                                    'logistics_park', 'collection_point',
                                    'cross_dock', 'transit_hub', 'central_hub'))
);

-- ==============================================
-- 3. Shipments Table (references vehicles)
-- ==============================================
CREATE TABLE IF NOT EXISTS shipments (
    id              VARCHAR(20) PRIMARY KEY,
    source_name     VARCHAR(100) NOT NULL,
    source_lat      DOUBLE PRECISION NOT NULL,
    source_lng      DOUBLE PRECISION NOT NULL,
    destination_name VARCHAR(100) NOT NULL,
    destination_lat DOUBLE PRECISION NOT NULL,
    destination_lng DOUBLE PRECISION NOT NULL,
    weight_kg       DOUBLE PRECISION DEFAULT 1.0,
    size            VARCHAR(20) DEFAULT 'small'
                    CHECK (size IN ('small', 'medium', 'large', 'xlarge')),
    priority        VARCHAR(20) DEFAULT 'standard'
                    CHECK (priority IN ('economy', 'standard', 'express', 'critical')),
    status          VARCHAR(30) DEFAULT 'pending'
                    CHECK (status IN ('pending', 'aggregated', 'routed', 'assigned',
                                      'in_transit', 'delivered', 'failed', 'cancelled')),
    transport_mode  VARCHAR(20) DEFAULT NULL,
    sla_hours       INTEGER DEFAULT 24,
    vehicle_id      VARCHAR(20) REFERENCES vehicles(id) ON DELETE SET NULL,
    route           JSONB DEFAULT NULL,
    eta_min         DOUBLE PRECISION DEFAULT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- 4. Routes Table
-- ==============================================
CREATE TABLE IF NOT EXISTS routes (
    id                  VARCHAR(20) PRIMARY KEY,
    vehicle_id          VARCHAR(20) REFERENCES vehicles(id) ON DELETE SET NULL,
    shipment_ids        JSONB DEFAULT '[]'::jsonb,
    path                JSONB DEFAULT '[]'::jsonb,
    coordinates         JSONB DEFAULT '[]'::jsonb,
    distance_km         DOUBLE PRECISION DEFAULT 0,
    estimated_time_min  DOUBLE PRECISION DEFAULT 0,
    optimization_mode   VARCHAR(20) DEFAULT 'balanced'
                        CHECK (optimization_mode IN ('fastest', 'cheapest', 'balanced')),
    status              VARCHAR(20) DEFAULT 'planned'
                        CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- 5. Event Logs Table (audit trail)
-- ==============================================
CREATE TABLE IF NOT EXISTS event_logs (
    id          SERIAL PRIMARY KEY,
    event_type  VARCHAR(50) NOT NULL,
    payload     JSONB NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- Indexes for performance
-- ==============================================
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_priority ON shipments(priority);
CREATE INDEX IF NOT EXISTS idx_shipments_vehicle ON shipments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(type);
CREATE INDEX IF NOT EXISTS idx_routes_vehicle ON routes(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_routes_status ON routes(status);
CREATE INDEX IF NOT EXISTS idx_event_logs_type ON event_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_event_logs_created ON event_logs(created_at);

-- ==============================================
-- Seed Data — Vehicles (insert first due to FK)
-- ==============================================
INSERT INTO vehicles (id, name, type, capacity_kg, current_lat, current_lng, fuel_level, status) VALUES
('VEH-001', 'Rapid Van Alpha',   'van',   200,  12.9352, 77.6245, 85,  'available'),
('VEH-002', 'Heavy Truck Beta',  'truck', 1000, 12.9767, 77.5713, 72,  'available'),
('VEH-003', 'Swift Bike Gamma',  'bike',  10,   13.0358, 77.5970, 95,  'available'),
('VEH-004', 'Express Van Delta', 'van',   200,  12.8399, 77.6770, 60,  'available'),
('VEH-005', 'Drone Eagle',       'drone', 5,    12.9698, 77.7500, 100, 'available'),
('VEH-006', 'Cargo Truck Zeta',  'truck', 1000, 13.0227, 77.5500, 45,  'available'),
('VEH-007', 'City Bike Eta',     'bike',  10,   12.9299, 77.5838, 90,  'available'),
('VEH-008', 'Metro Van Theta',   'van',   200,  13.0012, 77.6960, 78,  'available')
ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- Seed Data — Warehouses
-- ==============================================
INSERT INTO warehouses (id, name, lat, lng, zone, capacity, current_load, type) VALUES
('WH-001', 'Whitefield Distribution Center', 12.9698, 77.7500, 'East',          500, 120, 'distribution'),
('WH-002', 'Koramangala Micro Hub',           12.9352, 77.6245, 'South',         400, 85,  'micro_hub'),
('WH-003', 'Electronic City Warehouse',       12.8399, 77.6770, 'South-East',    600, 200, 'warehouse'),
('WH-004', 'Yeshwantpur Logistics Park',      13.0227, 77.5500, 'North',         450, 150, 'logistics_park'),
('WH-005', 'Jayanagar Collection Point',      12.9299, 77.5838, 'Central-South', 350, 60,  'collection_point'),
('WH-006', 'Hebbal Cross Dock',               13.0358, 77.5970, 'North',         500, 175, 'cross_dock'),
('WH-007', 'KR Puram Transit Hub',            13.0012, 77.6960, 'East',          400, 90,  'transit_hub'),
('WH-008', 'Majestic Central Hub',            12.9767, 77.5713, 'Central',       800, 310, 'central_hub')
ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- Seed Data — Shipments (25 shipments)
-- ==============================================
INSERT INTO shipments (id, source_name, source_lat, source_lng, destination_name, destination_lat, destination_lng, weight_kg, size, priority, status, sla_hours) VALUES
('SHP-001', 'Koramangala',    12.9352, 77.6245, 'Whitefield',      12.9698, 77.7500, 5.2,  'medium', 'express',   'pending', 6),
('SHP-002', 'Jayanagar',      12.9299, 77.5838, 'Electronic City', 12.8399, 77.6770, 12.0, 'large',  'standard',  'pending', 24),
('SHP-003', 'Hebbal',         13.0358, 77.5970, 'Koramangala',     12.9352, 77.6245, 0.8,  'small',  'critical',  'pending', 2),
('SHP-004', 'Whitefield',     12.9698, 77.7500, 'Yeshwantpur',     13.0227, 77.5500, 45.0, 'xlarge', 'standard',  'pending', 24),
('SHP-005', 'Majestic',       12.9767, 77.5713, 'Electronic City', 12.8399, 77.6770, 3.1,  'small',  'express',   'pending', 6),
('SHP-006', 'Indiranagar',    12.9784, 77.6408, 'Hebbal',          13.0358, 77.5970, 8.5,  'medium', 'standard',  'pending', 24),
('SHP-007', 'BTM Layout',     12.9166, 77.6101, 'KR Puram',        13.0012, 77.6960, 22.0, 'large',  'economy',   'pending', 72),
('SHP-008', 'HSR Layout',     12.9121, 77.6446, 'Yeshwantpur',     13.0227, 77.5500, 1.2,  'small',  'critical',  'pending', 2),
('SHP-009', 'Marathahalli',   12.9591, 77.6974, 'Jayanagar',       12.9299, 77.5838, 15.0, 'medium', 'express',   'pending', 6),
('SHP-010', 'Yelahanka',      13.1005, 77.5940, 'Bannerghatta',    12.8002, 77.5773, 67.0, 'xlarge', 'standard',  'pending', 24),
('SHP-011', 'Rajajinagar',    12.9883, 77.5533, 'Whitefield',      12.9698, 77.7500, 4.0,  'small',  'express',   'pending', 6),
('SHP-012', 'Basavanagudi',   12.9422, 77.5737, 'KR Puram',        13.0012, 77.6960, 30.0, 'large',  'standard',  'pending', 24),
('SHP-013', 'Malleshwaram',   13.0035, 77.5648, 'Electronic City', 12.8399, 77.6770, 2.5,  'small',  'critical',  'pending', 2),
('SHP-014', 'Sadashivanagar', 13.0076, 77.5810, 'Koramangala',     12.9352, 77.6245, 18.0, 'medium', 'economy',   'pending', 72),
('SHP-015', 'JP Nagar',       12.9063, 77.5857, 'Hebbal',          13.0358, 77.5970, 9.0,  'medium', 'standard',  'pending', 24),
('SHP-016', 'Banashankari',   12.9255, 77.5468, 'Whitefield',      12.9698, 77.7500, 55.0, 'xlarge', 'express',   'pending', 6),
('SHP-017', 'Domlur',         12.9610, 77.6387, 'Yelahanka',       13.1005, 77.5940, 6.8,  'medium', 'standard',  'pending', 24),
('SHP-018', 'Frazer Town',    12.9981, 77.6134, 'Bannerghatta',    12.8002, 77.5773, 0.5,  'small',  'critical',  'pending', 2),
('SHP-019', 'Ulsoor',         12.9815, 77.6205, 'Electronic City', 12.8399, 77.6770, 25.0, 'large',  'standard',  'pending', 24),
('SHP-020', 'RT Nagar',       13.0210, 77.5960, 'Jayanagar',       12.9299, 77.5838, 3.0,  'small',  'express',   'pending', 6),
('SHP-021', 'Bellandur',      12.9260, 77.6762, 'Majestic',        12.9767, 77.5713, 42.0, 'xlarge', 'economy',   'pending', 72),
('SHP-022', 'Sarjapur',       12.8589, 77.7866, 'Rajajinagar',     12.9883, 77.5533, 7.5,  'medium', 'standard',  'pending', 24),
('SHP-023', 'Nagarbhavi',     12.9610, 77.5125, 'Marathahalli',    12.9591, 77.6974, 1.0,  'small',  'express',   'pending', 6),
('SHP-024', 'Vijayanagar',    12.9716, 77.5370, 'HSR Layout',      12.9121, 77.6446, 35.0, 'large',  'standard',  'pending', 24),
('SHP-025', 'Shivajinagar',   12.9857, 77.6057, 'Whitefield',      12.9698, 77.7500, 11.0, 'medium', 'critical',  'pending', 2)
ON CONFLICT (id) DO NOTHING;
