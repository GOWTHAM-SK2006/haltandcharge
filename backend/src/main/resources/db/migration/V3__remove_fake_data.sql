-- V3__remove_fake_data.sql
-- Remove all fake/demo data from stations, chargers, vehicles and sessions

DELETE FROM simulator_events;
DELETE FROM audit_logs;
DELETE FROM favourites;
DELETE FROM charging_sessions;
DELETE FROM vehicles;
DELETE FROM connectors;
DELETE FROM chargers;
DELETE FROM stations;

-- Ensure admin user exists with active status and valid password (Password@123)
INSERT INTO users (email, password_hash, full_name, phone_number, role, status, wallet_balance)
SELECT 'admin@haltcharge.com', '$2a$10$tlrY2uW9/UPkg3NOzIroguhY8aLuznA4L649n8DB3JdYy9jUJGKTW', 'Halt & Charge System Admin', '+91 9876543210', 'ROLE_ADMIN', 'ACTIVE', 0.00
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@haltcharge.com');

UPDATE users 
SET password_hash = '$2a$10$tlrY2uW9/UPkg3NOzIroguhY8aLuznA4L649n8DB3JdYy9jUJGKTW',
    role = 'ROLE_ADMIN',
    status = 'ACTIVE'
WHERE email = 'admin@haltcharge.com';

-- Ensure customer user exists with active status and valid password (Password@123)
INSERT INTO users (email, password_hash, full_name, phone_number, role, status, wallet_balance)
SELECT 'customer@haltcharge.com', '$2a$10$tlrY2uW9/UPkg3NOzIroguhY8aLuznA4L649n8DB3JdYy9jUJGKTW', 'Arjun Sharma', '+91 9876543211', 'ROLE_CUSTOMER', 'ACTIVE', 500.00
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'customer@haltcharge.com');

UPDATE users 
SET password_hash = '$2a$10$tlrY2uW9/UPkg3NOzIroguhY8aLuznA4L649n8DB3JdYy9jUJGKTW',
    role = 'ROLE_CUSTOMER',
    status = 'ACTIVE'
WHERE email = 'customer@haltcharge.com';

