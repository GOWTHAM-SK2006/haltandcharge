# Halt & Charge System Architecture

## 1. High-Level Overview

Halt & Charge is an enterprise EV charging management platform composed of three independent applications:

```
[ Customer Web Application ] (React + Vite + TypeScript)
               │ (HTTPS REST + WSS)
               ▼
[ Spring Boot 3 Backend API ] ────► [ Virtual Charger Simulator Engine ]
               │ (JDBC + HikariCP)
               ▼
[ Supabase Managed PostgreSQL Database ]
               ▲
               │ (HTTPS REST)
[ Admin Web Command Dashboard ] (React + Vite + TypeScript)
```

## 2. Components

### A. Spring Boot Backend (`backend/`)
- **Runtime**: Java 21 LTS
- **Framework**: Spring Boot 3.3.5
- **Security**: Spring Security with stateless JWT (`io.jsonwebtoken 0.12.6`), BCrypt password hashing, and `@PreAuthorize` method security.
- **Data Access**: Spring `JdbcClient` with HikariCP connection pooling and parameterized SQL queries to prevent injection.
- **Database Migrations**: Flyway automatic database migrations (`db/migration/V1__initial_schema.sql`, `V2__seed_demo_data.sql`).
- **Telemetry & Simulator**: Asynchronous scheduled task engine (`@Scheduled(fixedRate = 2000)`) updating continuous power curves, kilowatt-hour meters, and battery state-of-charge (SOC).
- **WebSockets**: STOMP over SockJS (`/ws`) broadcasting to user-specific and session-specific channels.
- **Monitoring**: Spring Boot Actuator (`/actuator/health`, `/actuator/metrics`).
- **API Documentation**: OpenAPI / Swagger 3 (`/swagger-ui.html`, `/v3/api-docs`).

### B. Customer Web Application (`customer-website/`)
- **Framework**: React 18 + Vite 5 + TypeScript
- **Design Language**: Halt & Charge Neon-Green (`#00FF88`) & Deep Slate (`#07090e`, `#0d121c`)
- **Key Modules**:
  - Live Station Finder & Haversine Distance Calculator
  - EV Trip & Highway Charging Route Planner
  - Instant Plug & Charge / QR Simulator
  - Real-Time Charging Telemetry Dashboard
  - Electric Vehicle Garage Manager
  - Profile & Simulated Ledger Account

### C. Admin Web Dashboard (`admin-dashboard/`)
- **Framework**: React 18 + Vite 5 + TypeScript
- **Key Modules**:
  - Network KPI Dashboard (Stations, Chargers, Energy Delivered, Estimated Revenue)
  - Virtual Hardware Simulator Controls (Fault Injection, Offline State, Recovery)
  - Station & Charger Hub CRUD
  - Charging Sessions & Metering Logs
  - User Account Administration & Status Controls
  - Comprehensive Security Audit Trail

### D. Supabase PostgreSQL Database
- Managed PostgreSQL with connection pooling.
- Safe migrations ensuring zero data loss and idempotent schema validation.

## 3. Communication Patterns

- **RESTful HTTPS**: JSON payloads for CRUD and control operations.
- **WebSocket (STOMP)**: Live telemetry streaming during active charging sessions.
- **Stateless Bearer JWT**: Passed via HTTP `Authorization: Bearer <token>` header.

