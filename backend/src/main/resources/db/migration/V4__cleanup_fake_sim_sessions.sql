-- V4__cleanup_fake_sim_sessions.sql
-- 1. Clean up simulated sessions where admin was incorrectly marked as a customer
DELETE FROM charging_sessions 
WHERE session_uid LIKE 'HC-SIM-%' 
   OR user_id IN (SELECT id FROM users WHERE role = 'ROLE_ADMIN');

-- 2. Clean up simulator events associated with admin pseudo-sessions
DELETE FROM simulator_events 
WHERE details LIKE '%HC-SIM-%';

-- 3. Reset all chargers without an active customer session back to AVAILABLE
UPDATE chargers 
SET status = 'AVAILABLE' 
WHERE id NOT IN (
    SELECT charger_id FROM charging_sessions WHERE status = 'IN_PROGRESS'
);
