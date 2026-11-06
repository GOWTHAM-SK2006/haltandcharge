# REST API Documentation

Base URL: `http://localhost:8080` (Local) or `https://<railway-domain>` (Production)

Interactive Documentation: `GET /swagger-ui/index.html`  
OpenAPI JSON Specification: `GET /v3/api-docs`

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/register`
Creates a new customer account.
- **Request Body**:
  ```json
  {
    "email": "customer@example.com",
    "password": "Password@123",
    "fullName": "Priya Sharma",
    "phoneNumber": "+91 9876543210"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "token": "eyJhbGciOi...",
    "userId": 3,
    "email": "customer@example.com",
    "fullName": "Priya Sharma",
    "role": "ROLE_CUSTOMER"
  }
  ```

### `POST /api/auth/login`
Authenticates a user and returns a signed JWT.
- **Request Body**:
  ```json
  {
    "email": "customer@haltcharge.com",
    "password": "Password@123"
  }
  ```
- **Response** (200 OK): Contains JWT `token`, `role`, and user details.

---

## 2. Stations & Chargers (`/api/stations`)

### `GET /api/stations`
Fetches all operational stations. Supports GPS distance calculation via query parameters.
- **Query Params**: `lat` (Double, optional), `lng` (Double, optional)
- **Response** (200 OK): Array of station objects with nested `chargers`, `distanceKm`, `totalChargers`, and `availableChargers`.

### `GET /api/stations/{id}`
Returns details for a specific station.

---

## 3. Vehicles (`/api/vehicles`)
*Requires `Authorization: Bearer <token>`*

### `GET /api/vehicles`
List electric vehicles registered to the authenticated customer.

### `POST /api/vehicles`
Register a vehicle in the customer's garage.
- **Request Body**:
  ```json
  {
    "brand": "Tata",
    "model": "Nexon EV Max",
    "licensePlate": "KA-01-EV-2024",
    "batteryCapacityKwh": 40.5,
    "connectorType": "CCS2",
    "maxChargingSpeedKw": 50.0,
    "isDefault": true
  }
  ```

### `DELETE /api/vehicles/{id}`
Delete a vehicle from the customer's garage.

---

## 4. Charging Sessions (`/api/charging-sessions`)
*Requires `Authorization: Bearer <token>`*

### `POST /api/charging-sessions`
Initiates a new charging session on an available charger gun.
- **Request Body**:
  ```json
  {
    "chargerIdentifier": "HC-KOR-DC-01",
    "vehicleId": 1
  }
  ```
- **Validation Rules**:
  - Customer cannot have more than 1 concurrent active session.
  - Charger must be in `AVAILABLE` state.
  - Charger must not be in use by any other session.
  - Snapshots tariff into session record.
- **Response** (200 OK): Returns `ChargingSession` object with `status: "IN_PROGRESS"`.

### `GET /api/charging-sessions/active`
Retrieves the currently active charging session for the authenticated customer.

### `POST /api/charging-sessions/{id}/stop`
Stops an active charging session.
- **Query Params**: `reason` (String, optional, defaults to `"STOPPED_BY_USER"`)
- **Action**: Marks session `COMPLETED`, releases charger to `AVAILABLE`, and halts simulator telemetry.

---

## 5. Virtual Charger Simulator Controls (`/api/admin/simulator`)
*Requires `ROLE_ADMIN` Authorization*

### `POST /api/admin/simulator/chargers/{id}/fault`
Simulates a hardware fault on the specified charger.
- **Query Params**: `reason` (e.g., `"Ground fault detected"`)

### `POST /api/admin/simulator/chargers/{id}/offline`
Simulates network connectivity loss / offline state on the specified charger.

### `POST /api/admin/simulator/chargers/{id}/restore`
Restores a faulted or offline charger back to `AVAILABLE`.

### `GET /api/admin/simulator/events`
Returns recent hardware simulator event logs.

---

## 6. Admin Analytics & Management (`/api/admin`)
*Requires `ROLE_ADMIN` Authorization*

- `GET /api/admin/stats` - Network analytics, total energy (kWh), and estimated revenue.
- `GET /api/admin/chargers` - All chargers across all stations.
- `POST /api/admin/stations` - Create a new station.
- `GET /api/admin/users` - All registered accounts.
- `PUT /api/admin/users/{id}/status` - Suspend or activate user accounts.
- `GET /api/admin/audit-logs` - Security audit trail.

