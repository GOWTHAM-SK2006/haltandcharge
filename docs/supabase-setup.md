# Supabase PostgreSQL Configuration Guide for Halt & Charge

Halt & Charge utilizes Supabase as a managed PostgreSQL database in production with Flyway running migrations automatically on startup.

## 1. Connection Details
Obtain your credentials from your Supabase Dashboard:
**Supabase Dashboard → Project Settings → Database → Connection string**

Choose **Session Pooler** (recommended for Railway / containerized cloud environments):
- **Host**: `aws-0-[region].pooler.supabase.com`
- **Port**: `6543` (Pooler) or `5432` (Direct)
- **Database**: `postgres`
- **User**: `postgres.[project-ref]`
- **Password**: `<your-db-password>`

## 2. Spring Boot JDBC URL Format
In production, Spring Boot constructs the JDBC connection with SSL enforcement:
```properties
jdbc:postgresql://${PGHOST}:${PGPORT}/${PGDATABASE}?sslmode=require
```

## 3. Flyway Migrations Safety Policy
- Never DROP or TRUNCATE existing tables.
- All migrations (`V1__initial_schema.sql`, `V2__seed_demo_data.sql`) use idempotent statements:
  - `CREATE TABLE IF NOT EXISTS`
  - `CREATE INDEX IF NOT EXISTS`
  - `INSERT INTO ... WHERE NOT EXISTS ...`
- Existing user data and sessions are preserved safely without overwrite.

## 4. Environment Variables Checklist
Set these in your Railway service (`halt-charge-backend`):
- `PGHOST`
- `PGPORT`
- `PGDATABASE`
- `PGUSER`
- `PGPASSWORD`
- `JWT_SECRET`
- `CORS_ALLOWED_ORIGINS`
- `SPRING_PROFILES_ACTIVE=prod`

