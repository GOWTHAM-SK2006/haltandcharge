-- V1__initial_schema.sql
-- Halt & Charge EV Charging Management Platform Complete Schema

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(30),
    role VARCHAR(30) NOT NULL DEFAULT 'ROLE_CUSTOMER',
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, SUSPENDED, DEACTIVATED
    wallet_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. Stations Table
CREATE TABLE IF NOT EXISTS stations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    latitude NUMERIC(10, 7) NOT NULL CHECK (latitude >= -90.0 AND latitude <= 90.0),
    longitude NUMERIC(10, 7) NOT NULL CHECK (longitude >= -180.0 AND longitude <= 180.0),
    operating_hours VARCHAR(100) NOT NULL DEFAULT '24/7',
    amenities TEXT, -- JSON or comma-separated: Restroom, Cafe, Wifi, Parking
    status VARCHAR(30) NOT NULL DEFAULT 'OPERATIONAL', -- OPERATIONAL, UNDER_MAINTENANCE, DECOMMISSIONED
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stations_lat_lng ON stations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_stations_status ON stations(status, is_active);

-- 3. Chargers Table
CREATE TABLE IF NOT EXISTS chargers (
    id BIGSERIAL PRIMARY KEY,
    station_id BIGINT NOT NULL REFERENCES stations(id) ON DELETE RESTRICT,
    identifier VARCHAR(50) NOT NULL UNIQUE, -- E.g. HC-BLR-001-A
    name VARCHAR(100) NOT NULL,
    charger_type VARCHAR(20) NOT NULL DEFAULT 'DC', -- AC, DC
    max_power_kw NUMERIC(6, 2) NOT NULL CHECK (max_power_kw > 0),
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE', -- AVAILABLE, CHARGING, FAULTED, OFFLINE, RESERVED
    tariff_per_kwh NUMERIC(8, 2) NOT NULL CHECK (tariff_per_kwh >= 0),
    is_simulated BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chargers_station ON chargers(station_id);
CREATE INDEX IF NOT EXISTS idx_chargers_status ON chargers(status);

-- 4. Connectors Table
CREATE TABLE IF NOT EXISTS connectors (
    id BIGSERIAL PRIMARY KEY,
    charger_id BIGINT NOT NULL REFERENCES chargers(id) ON DELETE CASCADE,
    connector_type VARCHAR(50) NOT NULL, -- CCS2, CHAdeMO, Type 2, GB/T
    power_kw NUMERIC(6, 2) NOT NULL CHECK (power_kw > 0),
    connector_number INT NOT NULL DEFAULT 1,
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_charger_connector UNIQUE (charger_id, connector_number)
);

-- 5. Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    license_plate VARCHAR(50) NOT NULL,
    battery_capacity_kwh NUMERIC(6, 2) NOT NULL CHECK (battery_capacity_kwh > 0),
    connector_type VARCHAR(50) NOT NULL, -- CCS2, Type 2, etc.
    max_charging_speed_kw NUMERIC(6, 2) NOT NULL CHECK (max_charging_speed_kw > 0),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vehicles_user ON vehicles(user_id);

-- 6. Favourites Table
CREATE TABLE IF NOT EXISTS favourites (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    station_id BIGINT NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_station UNIQUE (user_id, station_id)
);

-- 7. Charging Sessions Table
CREATE TABLE IF NOT EXISTS charging_sessions (
    id BIGSERIAL PRIMARY KEY,
    session_uid VARCHAR(64) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    station_id BIGINT NOT NULL REFERENCES stations(id) ON DELETE RESTRICT,
    charger_id BIGINT NOT NULL REFERENCES chargers(id) ON DELETE RESTRICT,
    vehicle_id BIGINT REFERENCES vehicles(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, COMPLETED, STOPPED_BY_USER, FAULTED, CANCELLED
    is_simulated BOOLEAN NOT NULL DEFAULT TRUE,
    tariff_snapshot_per_kwh NUMERIC(8, 2) NOT NULL,
    energy_kwh NUMERIC(8, 3) NOT NULL DEFAULT 0.000,
    current_power_kw NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    estimated_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    duration_seconds BIGINT NOT NULL DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    stop_reason VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON charging_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_charger ON charging_sessions(charger_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON charging_sessions(status);

-- 8. Session Readings Table (Telemetry snapshots)
CREATE TABLE IF NOT EXISTS session_readings (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES charging_sessions(id) ON DELETE CASCADE,
    energy_kwh NUMERIC(8, 3) NOT NULL,
    power_kw NUMERIC(6, 2) NOT NULL,
    voltage_v NUMERIC(6, 2),
    current_a NUMERIC(6, 2),
    soc_percentage INT CHECK (soc_percentage >= 0 AND soc_percentage <= 100),
    reading_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_readings_session ON session_readings(session_id);

-- 9. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    station_id BIGINT NOT NULL REFERENCES stations(id) ON DELETE RESTRICT,
    charger_id BIGINT NOT NULL REFERENCES chargers(id) ON DELETE RESTRICT,
    vehicle_id BIGINT REFERENCES vehicles(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED', -- CONFIRMED, CANCELLED, COMPLETED, EXPIRED
    estimated_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_charger ON bookings(charger_id);

-- 10. Simulator Events Table
CREATE TABLE IF NOT EXISTS simulator_events (
    id BIGSERIAL PRIMARY KEY,
    charger_id BIGINT NOT NULL REFERENCES chargers(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- START_CHARGING, TICK_READING, STOP_CHARGING, SIMULATE_FAULT, SIMULATE_OFFLINE, RESTORE_ONLINE
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sim_events_charger ON simulator_events(charger_id);

-- 11. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

-- 12. Support Tickets & Notifications
CREATE TABLE IF NOT EXISTS support_tickets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, RESOLVED, CLOSED
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    type VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

