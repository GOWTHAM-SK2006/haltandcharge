# Halt & Charge – EV Charging Management Platform

Halt & Charge is a production-grade, enterprise EV Charging Management Platform engineered with a clean modular architecture.

## Platform Architecture

- **Backend**: Java 21, Spring Boot 3.3.5, Spring Security (Stateless JWT), Spring `JdbcClient`, Flyway migrations, STOMP WebSockets, and Actuator health metrics.
- **Database**: Supabase PostgreSQL (with HikariCP connection pooling and SSL mode).
- **Virtual Charger Simulator**: Real-time asynchronous telemetry engine with dynamic power ramp-up, SOC tracking, energy accumulation, and fault simulation.
- **Deployment Strategy**: 3 dedicated Railway services:
  1. `halt-charge-backend` (Spring Boot API + Simulator)
  2. `customer-website` (React + Vite Web App)
  3. `admin-dashboard` (React + Vite Admin Center)

---

## Backend REST API Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create customer account
- `POST /api/auth/login` - Authenticate customer or admin, return JWT
- `POST /api/auth/logout` - Session invalidation

### Stations (`/api/stations`)
- `GET /api/stations` - Fetch all operational stations (supports `lat`, `lng` spatial distance calculations)
- `GET /api/stations/{id}` - Fetch station details and real-time charger status

### User & Vehicles (`/api/me`, `/api/vehicles`)
- `GET /api/me` - Profile overview
- `PUT /api/me` - Update profile
- `GET /api/me/favourites` - User saved stations
- `POST /api/me/favourites/{stationId}` - Add favourite
- `DELETE /api/me/favourites/{stationId}` - Remove favourite
- `GET /api/vehicles` - List EV vehicles
- `POST /api/vehicles` - Register new vehicle
- `DELETE /api/vehicles/{id}` - Remove vehicle

### Charging Lifecycle (`/api/charging-sessions`)
- `POST /api/charging-sessions` - Initiate session on available charger (concurrency locked, tariff snapshotted)
- `GET /api/charging-sessions/active` - Retrieve current active charging session
- `POST /api/charging-sessions/{id}/stop` - Safely stop charging session, compute final energy & costs

### Simulator & Admin Controls (`/api/admin`)
- `GET /api/admin/stats` - Network analytics (chargers, energy, revenue)
- `GET /api/admin/chargers` - Fleet view
- `POST /api/admin/simulator/chargers/{id}/fault` - Inject simulated hardware fault
- `POST /api/admin/simulator/chargers/{id}/offline` - Simulate charger offline state
- `POST /api/admin/simulator/chargers/{id}/restore` - Restore charger to AVAILABLE
- `GET /api/admin/simulator/events` - Live simulator telemetry events stream

---

## Running Backend Locally

### Prerequisites
- JDK 21
- Maven (or bundled Maven wrapper `mvnw`)

### Commands
```bash
cd backend
mvn clean test        # Run automated test suites (9/9 pass)
mvn spring-boot:run   # Start API server on http://localhost:8080
```
Swagger UI will be available at: `http://localhost:8080/swagger-ui.html`
Actuator Health at: `http://localhost:8080/actuator/health`

