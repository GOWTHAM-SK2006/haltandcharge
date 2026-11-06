# Database Schema Documentation

Halt & Charge utilizes PostgreSQL (hosted on Supabase) managed by Flyway migrations.

## 1. Schema Diagram

```
users (id, email, password_hash, role, status, wallet_balance, ...)
  │
  ├── vehicles (id, user_id, brand, model, license_plate, battery_capacity_kwh, ...)
  ├── favourites (id, user_id, station_id)
  └── charging_sessions (id, session_uid, user_id, station_id, charger_id, vehicle_id, status, ...)
        │
        └── session_readings (id, session_id, energy_kwh, power_kw, soc_percentage, ...)

stations (id, name, address, latitude, longitude, operating_hours, status, ...)
  │
  └── chargers (id, station_id, identifier, charger_type, max_power_kw, status, tariff_per_kwh, ...)
        │
        ├── connectors (id, charger_id, connector_type, power_kw, ...)
        └── simulator_events (id, charger_id, event_type, details, ...)

audit_logs (id, user_id, user_email, action, resource_type, resource_id, details, ip_address, created_at)
```

## 2. Table Definitions

### `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGSERIAL | PRIMARY KEY | Unique user ID |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Account email (login credential) |
| `password_hash` | VARCHAR(255) | NOT NULL | BCrypt password hash |
| `full_name` | VARCHAR(150) | NOT NULL | Customer/Admin full name |
| `phone_number` | VARCHAR(30) | NULL | Contact phone number |
| `role` | VARCHAR(30) | NOT NULL | `ROLE_CUSTOMER` or `ROLE_ADMIN` |
| `status` | VARCHAR(30) | NOT NULL | `ACTIVE`, `SUSPENDED`, `DEACTIVATED` |
| `wallet_balance` | NUMERIC(12,2)| NOT NULL DEFAULT 0.00 | Simulated wallet ledger |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation timestamp |

### `stations`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGSERIAL | PRIMARY KEY | Unique station ID |
| `name` | VARCHAR(200) | NOT NULL | Station name |
| `address` | TEXT | NOT NULL | Street address |
| `city` | VARCHAR(100) | NOT NULL | City |
| `latitude` | NUMERIC(10,7)| -90 to +90 | GPS latitude coordinate |
| `longitude` | NUMERIC(10,7)| -180 to +180 | GPS longitude coordinate |
| `operating_hours` | VARCHAR(100) | DEFAULT '24/7' | Operating hours |
| `status` | VARCHAR(30) | NOT NULL | `OPERATIONAL`, `UNDER_MAINTENANCE`, `DECOMMISSIONED` |
| `is_active` | BOOLEAN | NOT NULL DEFAULT true | Soft-deletion flag |

### `chargers`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGSERIAL | PRIMARY KEY | Unique charger ID |
| `station_id` | BIGINT | REFERENCES stations(id) | Associated station |
| `identifier` | VARCHAR(50) | UNIQUE, NOT NULL | Hardware ID (e.g. `HC-KOR-DC-01`) |
| `name` | VARCHAR(100) | NOT NULL | Charger display name |
| `charger_type` | VARCHAR(20) | NOT NULL | `AC` or `DC` |
| `max_power_kw` | NUMERIC(6,2)| > 0 | Peak power rating |
| `status` | VARCHAR(30) | NOT NULL | `AVAILABLE`, `CHARGING`, `FAULTED`, `OFFLINE` |
| `tariff_per_kwh` | NUMERIC(8,2)| >= 0 | Tariff rate in INR |
| `is_simulated` | BOOLEAN | NOT NULL DEFAULT true | Distinguishes virtual hardware from physical hardware |

### `charging_sessions`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGSERIAL | PRIMARY KEY | Internal session ID |
| `session_uid` | VARCHAR(64) | UNIQUE, NOT NULL | Public session identifier (`HC-SES-...`) |
| `user_id` | BIGINT | REFERENCES users(id) | Customer ID |
| `station_id` | BIGINT | REFERENCES stations(id) | Station ID |
| `charger_id` | BIGINT | REFERENCES chargers(id) | Charger ID |
| `vehicle_id` | BIGINT | REFERENCES vehicles(id) | EV vehicle ID (optional) |
| `status` | VARCHAR(30) | NOT NULL | `IN_PROGRESS`, `COMPLETED`, `STOPPED_BY_USER`, `FAULTED` |
| `tariff_snapshot_per_kwh` | NUMERIC(8,2)| NOT NULL | Snapshot of tariff at session inception |
| `energy_kwh` | NUMERIC(8,3)| NOT NULL DEFAULT 0 | Accumulated energy delivered |
| `current_power_kw` | NUMERIC(6,2)| NOT NULL DEFAULT 0 | Instantaneous power |
| `estimated_cost` | NUMERIC(10,2)| NOT NULL DEFAULT 0 | Calculated cost (`energy_kwh * tariff_snapshot`) |
| `duration_seconds` | BIGINT | NOT NULL DEFAULT 0 | Total elapsed charging seconds |
| `started_at` | TIMESTAMPTZ | NOT NULL | Start timestamp |
| `endedAt` | TIMESTAMPTZ | NULL | Termination timestamp |

### `simulator_events`
Stores all virtual charger lifecycle events: `START_CHARGING`, `STOP_CHARGING`, `SIMULATE_FAULT`, `SIMULATE_OFFLINE`, and `RESTORE_ONLINE`.

### `audit_logs`
Tracks administrative operations, user logins, and charging authorizations with timestamp, user ID, action, and resource identifiers.

