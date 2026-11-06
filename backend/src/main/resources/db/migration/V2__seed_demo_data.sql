-- V2__seed_demo_data.sql
-- Seed initial Halt & Charge stations, chargers and demo accounts
-- Password: Password@123 (BCrypt hash)

INSERT INTO users (email, password_hash, full_name, phone_number, role, status, wallet_balance)
SELECT 'admin@haltcharge.com', '$2a$10$tlrY2uW9/UPkg3NOzIroguhY8aLuznA4L649n8DB3JdYy9jUJGKTW', 'Halt & Charge System Admin', '+91 9876543210', 'ROLE_ADMIN', 'ACTIVE', 0.00
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@haltcharge.com');

INSERT INTO users (email, password_hash, full_name, phone_number, role, status, wallet_balance)
SELECT 'customer@haltcharge.com', '$2a$10$tlrY2uW9/UPkg3NOzIroguhY8aLuznA4L649n8DB3JdYy9jUJGKTW', 'Arjun Sharma', '+91 9876543211', 'ROLE_CUSTOMER', 'ACTIVE', 500.00
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'customer@haltcharge.com');

-- Seed Stations
INSERT INTO stations (name, address, city, state, postal_code, latitude, longitude, operating_hours, amenities, status, is_active)
SELECT 'Halt & Charge - Koramangala Hub', '100 Feet Road, 4th Block, Koramangala', 'Bengaluru', 'Karnataka', '560034', 12.9352, 77.6245, '24/7', 'Restroom,Cafe,Free WiFi,Waiting Lounge', 'OPERATIONAL', TRUE
WHERE NOT EXISTS (SELECT 1 FROM stations WHERE name = 'Halt & Charge - Koramangala Hub');

INSERT INTO stations (name, address, city, state, postal_code, latitude, longitude, operating_hours, amenities, status, is_active)
SELECT 'Halt & Charge - Indiranagar Supercharger', '12th Main Road, HAL 2nd Stage, Indiranagar', 'Bengaluru', 'Karnataka', '560038', 12.9719, 77.6412, '24/7', 'Cafe,Restroom,EV Accessories', 'OPERATIONAL', TRUE
WHERE NOT EXISTS (SELECT 1 FROM stations WHERE name = 'Halt & Charge - Indiranagar Supercharger');

INSERT INTO stations (name, address, city, state, postal_code, latitude, longitude, operating_hours, amenities, status, is_active)
SELECT 'Halt & Charge - Whitefield Tech Zone', 'ITPB Main Road, Whitefield', 'Bengaluru', 'Karnataka', '560066', 12.9866, 77.7376, '06:00 - 23:00', 'Restroom,Food Court,Covered Parking', 'OPERATIONAL', TRUE
WHERE NOT EXISTS (SELECT 1 FROM stations WHERE name = 'Halt & Charge - Whitefield Tech Zone');

INSERT INTO stations (name, address, city, state, postal_code, latitude, longitude, operating_hours, amenities, status, is_active)
SELECT 'Halt & Charge - Electronic City Phase 1', 'Hosur Road, Near Toll Plaza, Electronic City', 'Bengaluru', 'Karnataka', '560100', 12.8452, 77.6602, '24/7', 'Restroom,Convenience Store,24/7 Security', 'OPERATIONAL', TRUE
WHERE NOT EXISTS (SELECT 1 FROM stations WHERE name = 'Halt & Charge - Electronic City Phase 1');

-- Seed Chargers
INSERT INTO chargers (station_id, identifier, name, charger_type, max_power_kw, status, tariff_per_kwh, is_simulated, is_active)
SELECT (SELECT id FROM stations WHERE name = 'Halt & Charge - Koramangala Hub'), 'HC-KOR-DC-01', 'Koramangala DC HyperFast 1', 'DC', 120.00, 'AVAILABLE', 18.50, TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM chargers WHERE identifier = 'HC-KOR-DC-01');

INSERT INTO chargers (station_id, identifier, name, charger_type, max_power_kw, status, tariff_per_kwh, is_simulated, is_active)
SELECT (SELECT id FROM stations WHERE name = 'Halt & Charge - Koramangala Hub'), 'HC-KOR-DC-02', 'Koramangala DC HyperFast 2', 'DC', 60.00, 'AVAILABLE', 16.00, TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM chargers WHERE identifier = 'HC-KOR-DC-02');

INSERT INTO chargers (station_id, identifier, name, charger_type, max_power_kw, status, tariff_per_kwh, is_simulated, is_active)
SELECT (SELECT id FROM stations WHERE name = 'Halt & Charge - Koramangala Hub'), 'HC-KOR-AC-01', 'Koramangala AC Destination', 'AC', 22.00, 'AVAILABLE', 12.00, TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM chargers WHERE identifier = 'HC-KOR-AC-01');

INSERT INTO chargers (station_id, identifier, name, charger_type, max_power_kw, status, tariff_per_kwh, is_simulated, is_active)
SELECT (SELECT id FROM stations WHERE name = 'Halt & Charge - Indiranagar Supercharger'), 'HC-IND-DC-01', 'Indiranagar DC Rapid 1', 'DC', 150.00, 'AVAILABLE', 19.00, TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM chargers WHERE identifier = 'HC-IND-DC-01');

INSERT INTO chargers (station_id, identifier, name, charger_type, max_power_kw, status, tariff_per_kwh, is_simulated, is_active)
SELECT (SELECT id FROM stations WHERE name = 'Halt & Charge - Indiranagar Supercharger'), 'HC-IND-DC-02', 'Indiranagar DC Rapid 2', 'DC', 60.00, 'AVAILABLE', 16.00, TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM chargers WHERE identifier = 'HC-IND-DC-02');

INSERT INTO chargers (station_id, identifier, name, charger_type, max_power_kw, status, tariff_per_kwh, is_simulated, is_active)
SELECT (SELECT id FROM stations WHERE name = 'Halt & Charge - Whitefield Tech Zone'), 'HC-WHT-DC-01', 'Whitefield Express DC', 'DC', 120.00, 'AVAILABLE', 18.00, TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM chargers WHERE identifier = 'HC-WHT-DC-01');

INSERT INTO chargers (station_id, identifier, name, charger_type, max_power_kw, status, tariff_per_kwh, is_simulated, is_active)
SELECT (SELECT id FROM stations WHERE name = 'Halt & Charge - Electronic City Phase 1'), 'HC-EC-DC-01', 'Electronic City UltraFast DC', 'DC', 180.00, 'AVAILABLE', 20.00, TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM chargers WHERE identifier = 'HC-EC-DC-01');

-- Seed Connectors
INSERT INTO connectors (charger_id, connector_type, power_kw, connector_number, status)
SELECT (SELECT id FROM chargers WHERE identifier = 'HC-KOR-DC-01'), 'CCS2', 120.00, 1, 'AVAILABLE'
WHERE NOT EXISTS (SELECT 1 FROM connectors WHERE connector_type = 'CCS2' AND charger_id = (SELECT id FROM chargers WHERE identifier = 'HC-KOR-DC-01'));

-- Seed Customer Demo Vehicle
INSERT INTO vehicles (user_id, brand, model, license_plate, battery_capacity_kwh, connector_type, max_charging_speed_kw, is_default)
SELECT (SELECT id FROM users WHERE email = 'customer@haltcharge.com'), 'Tata', 'Nexon EV Max', 'KA-01-EV-2024', 40.50, 'CCS2', 50.00, TRUE
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'KA-01-EV-2024');
