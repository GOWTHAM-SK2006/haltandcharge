# Comprehensive Railway Deployment Guide (Root & Subfolder Configurations)

Railway provides two seamless options for deploying monorepos:

---

## METHOD A: Root Level Dockerfiles (Recommended for Direct Repo Root Deploy)

In this approach, you point Railway directly to the root repository and specify the target Dockerfile:

### 1. Backend Service (`halt-charge-backend`)
- **Railway Dashboard → Service Settings → Build**:
  - **Dockerfile Path**: `Dockerfile.backend`
- **Healthcheck Path**: `/actuator/health`
- **Port**: `8080`
- **Environment Variables**:
  ```ini
  PGHOST=<supabase-pooler-or-db-host>
  PGPORT=6543
  PGDATABASE=postgres
  PGUSER=postgres.<project-id>
  PGPASSWORD=<your-db-password>
  JWT_SECRET=<strong-random-256-bit-string>
  CORS_ALLOWED_ORIGINS=https://<your-customer-website>.up.railway.app,https://<your-admin-dashboard>.up.railway.app
  SPRING_PROFILES_ACTIVE=prod
  ```

---

### 2. Customer Website Service (`customer-website`)
- **Railway Dashboard → Service Settings → Build**:
  - **Dockerfile Path**: `Dockerfile.customer`
- **Port**: `80`
- **Environment Variables**:
  ```ini
  VITE_API_BASE_URL=https://<your-backend>.up.railway.app
  ```

---

### 3. Admin Dashboard Service (`admin-dashboard`)
- **Railway Dashboard → Service Settings → Build**:
  - **Dockerfile Path**: `Dockerfile.admin`
- **Port**: `80`
- **Environment Variables**:
  ```ini
  VITE_API_BASE_URL=https://<your-backend>.up.railway.app
  ```

---

## METHOD B: Subfolder Root Directory Setting

If you prefer keeping each project's files completely contained inside its folder, Railway supports setting the **Root Directory**:

1. **Backend**:
   - **Root Directory**: `backend`
   - Railway will automatically detect `backend/Dockerfile` and `backend/railway.toml`.
2. **Customer Website**:
   - **Root Directory**: `customer-website`
   - Railway will automatically detect `customer-website/Dockerfile`.
3. **Admin Dashboard**:
   - **Root Directory**: `admin-dashboard`
   - Railway will automatically detect `admin-dashboard/Dockerfile`.

---

## Verification Checklist After Deployment

1. Check Backend `/actuator/health` responds:
   ```json
   {"status":"UP"}
   ```
2. Verify Flyway automatically executed migrations `V1__initial_schema.sql` and `V2__seed_demo_data.sql` in Supabase without dropping tables.
3. Access the Customer Website public URL: test login with `customer@haltcharge.com` / `Password@123`.
4. Access the Admin Dashboard public URL: test login with `admin@haltcharge.com` / `Password@123` and trigger a simulated fault or offline test.
