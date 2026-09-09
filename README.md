# 🪖 Syrian Military Supply

Full-stack tactical gear & military surplus **e-commerce platform** — React (Vite) frontend, Node/Express API, MongoDB, Cloudinary image hosting. Built to deploy live on **Render**.

---

## Quick Start (Local Development)

```bash
# 1. Backend deps
npm install

# 2. Frontend deps
npm install --prefix client

# 3. Copy env and fill in MongoDB / Cloudinary / JWT values
cp .env.example .env

# 4. Seed sample data (16 products + admin user)
npm run seed

# 5. Run backend (port 5000) + client dev server (port 5173, proxies /api)
npm run dev            # backend
npm run dev --prefix client   # frontend
```

Open http://localhost:5173 — visitor in the armory is live.

## Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `changeme123` |

> On first login at `/admin`, you are **forced to change the password** before accessing the dashboard.

## Seeding the Database

Two ways:

```bash
# CLI
npm run seed
```

or, after deployment, hit the guarded HTTP endpoint once (then disable it):

```
GET https://<your-app>.onrender.com/api/seed?    # requires ALLOW_SEED=true
```

Set `ALLOW_SEED=true` on Render, call it, then set `ALLOW_SEED=false`. The seed upserts 16 products by SKU (idempotent) and creates/resets the admin user.

## Environment Variables

Everything lives in `.env` (never committed). Copy `.env.example`:

| Variable | Required | Notes |
|----------|----------|-------|
| `MONGODB_URI` | ✅ | Atlas connection string: `mongodb+srv://user:pass@cluster.mongodb.net/syrian-military-supply` |
| `JWT_SECRET` | ✅ | `openssl rand -hex 32` |
| `CLOUDINARY_CLOUD_NAME` | for image upload | Cloudinary dashboard keys |
| `CLOUDINARY_API_KEY` | for image upload | |
| `CLOUDINARY_API_SECRET` | for image upload | |
| `CORS_ORIGIN` | optional | Comma-separated allowed origins; empty = allow all |
| `ALLOW_SEED` | optional | `true` temporarily enables `/api/seed` |
| `PORT` | optional | default `5000` |
| `SITE_URL` | optional | Your public URL |

If Cloudinary credentials are missing, the admin image upload **falls back to local disk storage** (`/uploads/`) — note this is ephemeral on Render's free plan. Use Cloudinary for persistent images.

## Deployment on Render

Primary method — **Blueprint** (one click):

1. Push this repo to GitHub.
2. In Render: **New → Blueprint**, connect the repo.
3. Render reads `render.yaml` and creates a web service (`syrian-military-supply`) with:

   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm start`
   - **Health check:** `/api/health`

4. In the web service → **Environment**, set the values marked `sync: false` (these are asking for input):
   - `MONGODB_URI` (Atlas)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `SITE_URL`
   - `ALLOW_SEED=true` (temporarily, to seed!)

5. Deploy. Once live:
   - `GET /api/seed` to populate the database → then set `ALLOW_SEED=false` and redeploy.
   - Log in at `/admin` with `admin / changeme123`.

> **MongoDB Atlas**: create a free M0 cluster → Database Access user → Network Access: allow `0.0.0.0/0` (or add Render's egress IPs). Grab the connection string and paste into `MONGODB_URI`.

> **Cloudinary**: free account → Dashboard → API Keys.

## Deployment without Blueprint — Manual Web Service

Blueprint not behaving? Create a plain Web Service by hand (2 minutes):

1. **Push the repo to GitHub.**

2. **Render → Dashboard → New + → Web Service** (pick this, NOT "Blueprint").

3. **Connect the repository** → select `syrian-military-supply`.

4. **Fill the form:**

   | Field | Value |
   |-------|-------|
   | Name | `syrian-military-supply` |
   | Root Directory | *(leave blank)* — app lives at repo root |
   | Runtime | `Node` |
   | Region | Nearest to your audience |
   | Branch | `main` |
   | Build Command | `npm install && npm run build` |
   | Start Command | `npm start` |
   | Plan | Free |

   > `npm run build` installs the Vite client and builds it into `client/dist`; Express serves that at runtime, so one web service is enough (no separate static site).

5. **Expand "Advanced"** while creating (or open **Environment → Environment Variables** after creation) and add:

   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/syrian-military-supply
   JWT_SECRET=<openssl rand -hex 32>
   CLOUDINARY_CLOUD_NAME=<your-cloud>
   CLOUDINARY_API_KEY=<key>
   CLOUDINARY_API_SECRET=<secret>
   ALLOW_SEED=true
   SITE_URL=https://<your-app>.onrender.com
   ```

   - `MONGODB_URI`: MongoDB Atlas → Cluster → Connect → "MongoDB for Drivers" connection string. Create a DB user with read/write and under **Network Access** add `0.0.0.0/0` (simplest) or Render's egress IPs.
   - `CLOUDINARY_*`: Cloudinary → Dashboard → "Account Details" / API Keys.
   - `ALLOW_SEED=true` **temporarily** so you can seed once.

6. **Health Check** (optional but recommended): in the service → **Settings → Health Check Path**: set `/api/health`.

7. **Create Web Service** → watch the logs until `[sms] Syrian Military Supply running on port 10000` appears.

8. **Seed the database once:**
   ```
   GET https://<your-app>.onrender.com/api/seed
   ```
   You should see a JSON summary (`totalProducts: 16`, `admin: "exists"/"created"`). Then set `ALLOW_SEED=false` and redeploy (Deploy dropdown → "Deploy latest commit") so the route is disabled.

9. **Log in** at `https://<your-app>.onrender.com/admin` with `admin` / `changeme123` — change the password on first login.

**Troubleshooting**

- **Service deploys but shows HTTP errors / can't reach MONGODB** → double-check the Atlas connection string, that the DB user has readWrite, and that your IP (or `0.0.0.0/0`) is whitelisted in Network Access.
- **Build fails at `npm install --prefix client`** → make sure `client/package-lock.json` is committed (it is). Free plan builds have limited memory; retrying usually succeeds.
- **Deploys but pages come back as JSON 404** → you're hitting an `/api` route that doesn't exist; bare static routes return the SPA.
- **First load after sleep is slow (~30–60s)** → normal on the free tier; add a UptimeRobot ping to `/api/health` to keep it warm.
- **Admin uploads 500 about Cloudinary** → Cloudinary env vars are wrong or missing; set the three `CLOUDINARY_*` values and redeploy.

### Manual `render.yaml` reference

```yaml
services:
  - type: web
    name: syrian-military-supply
    runtime: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        generateValue: true
      ... (see render.yaml in repo)
```

## Architecture

```
src/                       # Express backend
├── app.js                 # app assembly + static serve + SPA fallback
├── config/                # db, cloudinary
├── middleware/            # auth (JWT), upload (multer→Cloudinary), error handling
├── models/                # Product, Order, Visitor, Feedback, Admin, Settings
├── routes/
│   ├── public.js          # storefront API (products, orders, feedback, visitor tracking)
│   └── admin.js           # /api/admin/* (auth, dashboard, CRUD, logs, settings)
└── utils/                 # seed script, helpers

client/                    # React (Vite) frontend
├── src/context/           # Cart (localStorage + squad easter egg), Visitor tracking, Auth
├── src/pages/             # Home, Shop, Product, Cart, Checkout, About, Contact, M.I.A.
├── src/admin/             # Command panel: dashboard, products, orders, feedback, visitors, settings
└── src/styles/            # military theme (olive / matte-black / steel + flag accents)
```

In production the **Express server serves the built SPA** from `client/dist` with history-fallback for all non-API routes.

## Feature Checklist

**Storefront**
- [x] Homepage hero (rotating), category tiles, New Arrivals + Best Sellers carousels, newsletter
- [x] Shop: category/price filters, sort, live search suggestions, pagination, stock badges 🟢🟡🔴
- [x] Product detail: gallery, spec table, qty, related gear, "Field Reports" reviews
- [x] Cart: qty edit, shipping estimator, free-shipping progress, **squad easter egg** 🪖 at 10+ items
- [x] Checkout → order creation → stock decrement → confirmation page
- [x] About, Contact + feedback form (1–5★), custom **M.I.A. 404**
- [x] **Rank system** in footer (Private → Sergeant → Captain → General) via localStorage visit count

**Admin (`/admin`)**
- [x] JWT login, forced password change on first login
- [x] Dashboard: visitor stats + peak-hours chart, sales/revenue, pending orders, low-stock alerts, recent feedback
- [x] Products: table, search, bulk activate/deactivate/delete, add/edit with Cloudinary image upload, delete with confirmation
- [x] Orders: filterable list, expandable detail, status updates
- [x] Feedback log: filter by rating, search, sort, mark read, delete
- [x] Visitor log: IP/ID/device/pages/entry/exit/duration, search, paging, purge
- [x] Settings: store name, currency, shipping rates, emails + profile/password change

**Data & tracking**
- [x] Visitor sessions tracked (enter/page/exit heartbeat) → MongoDB, unique visitors + peak hours
- [x] Product views tracked, sales counts, effective-price (sale-aware) filtering & sorting

## Notes & Tips

- **Free Render tier**: the service sleeps after inactivity — first request after a sleep may take ~30–60s to warm up. Set `ALLOW_SEED=false` after seeding.
- Cart, rank and search persist client-side; everything else lives in MongoDB.
- If you clear a Cloudinary upload and use local uploads instead, product images only survive while the disk does — switch product images to Cloudinary URLs for permanence.

---

**Good hunting. 🫡**