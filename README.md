# Smart AutoCare

A full-stack vehicle service workshop management platform: customers book doorstep/walk-in service online, get transparent estimates and live job updates, while staff run bookings, job cards, inspection, billing, inventory, payroll-facing employees, reminders and analytics from one dashboard.

The app ships **without any demo data or demo accounts**. There are no seed users, no sample bookings and no hard-coded passwords. On first boot the server creates a single **administrator** from environment variables, and every customer, vehicle, service and record is entered through the application itself — see [Getting started](#getting-started).

---

## Features

**Customer side (public website + customer portal)**
- Browse services / pricing / video-free detail pages, book a walk-in or doorstep service with pickup
- Live booking status, own vehicles with health scores, service history, invoices & online payments, reminders, and canned reviews

**Workshop side (role-based admin UI)**
- Bookings & appointments, job cards (assignment, inspection, labour/parts, estimates, invoicing)
- Customers, vehicles, services catalog, employees, inventory (parts, suppliers, purchase orders), payments, reports, reviews, notifications (in-app broadcast), and business settings

**Platform**
- Socket.IO live updates, PWA client, PDF invoices, optional SMTP email, role-based access control (admin / manager / service advisor / mechanic / inventory / accountant / super admin)

---

## Tech stack

| Layer    | Technology                                                        |
|----------|-------------------------------------------------------------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, React Router, Framer Motion, PWA |
| Backend  | Node.js, Express, TypeScript, Socket.IO                            |
| Data     | MongoDB (Mongoose) + local counters for document numbering         |
| Auth     | JWT in an httpOnly cookie, bcrypt password hashing                 |

---

## Repository layout

```
.
├── client/                 # React + Vite PWA frontend
│   ├── src/
│   │   ├── api/            # REST client + TanStack Query hooks
│   │   ├── components/     # UI kit, layouts, marketing components
│   │   ├── constants/      # enums, catalogs (service/vehicle types, etc.)
│   │   ├── contexts/       # auth, theme
│   │   ├── pages/          # public, customer, auth, admin sections
│   │   └── types/          # shared TypeScript models
│   └── public/             # index.html, PWA assets (robots/sitemap here)
├── server/                 # Express API
│   ├── src/
│   │   ├── config/         # env, db, socket, bootstrap (admin creation)
│   │   ├── controllers/    # route handlers
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # business logic (estimates, inventory, reports, email)
│   │   ├── seed/           # DB "factory reset" + admin bootstrap
│   │   └── validators/     # Zod request schemas
│   └── uploads/            # locally stored images (git-ignored)
└── package.json            # root scripts (run everything)
```

---

## Prerequisites

- **Node.js** ≥ 18 (developed on 20+)
- **MongoDB** running locally or remotely — default `mongodb://127.0.0.1:27017/smart_autocare`

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the server

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

| Variable            | Purpose                                                        |
|---------------------|----------------------------------------------------------------|
| `PORT`              | API port (default `5001`)                                      |
| `MONGO_URI`         | MongoDB connection string                                      |
| `JWT_SECRET`        | Long random secret — **must change in production**             |
| `JWT_EXPIRES_IN`    | Cookie/token lifetime (default `7d`)                           |
| `CLIENT_URL`        | Frontend origin (CORS + cookie scope), e.g. `https://app.you.com` |
| `SERVER_URL`        | Public API base URL                                             |
| `COOKIE_SECURE`     | `true` when serving over HTTPS                                  |
| `ADMIN_EMAIL`       | **Initial admin login** (used on first boot — required)        |
| `ADMIN_PASSWORD`    | **Initial admin password** (min. 8 chars — never commit it)    |
| `ADMIN_NAME`        | Display name for the admin (default `Administrator`)           |
| `ADMIN_PHONE`       | Optional phone                                                  |
| `SMTP_HOST/PORT/USER/PASS/FROM` | Optional — emails log to console when unset |
| `CLOUDINARY_*`      | Optional — uploads stored under `server/uploads` otherwise      |

> **Why `ADMIN_*`?** The old demo seed (fake customers, sample bookings, `Demo@1234` accounts) was removed. Now the only way an admin account appears is via these env vars on first boot, or via `npm run seed`. Never put real values in committed files.

### 3. Start everything (development)

```bash
npm run dev
```

- Client: http://localhost:5173
- API: http://localhost:5001  (health check: `GET /api/health`)
- Source changes hot-reload both sides.

Individual commands:

```bash
npm run dev:server     # API only
npm run dev:client     # frontend only
```

### 4. Reset the database / (re)create the admin

`npm run seed` **deletes every document** in every collection, recreates the default business settings, and creates or resets the admin from your `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars.

```bash
npm run seed
```

It prints a confirmation and a reminder that no demo data is created. Warning: this is destructive — run it only on an empty database or when you deliberately want to start over.

### 4a. Optional: realistic sample data (demos / screen previews)

A separate script populates the database with **clearly fictional** sample data so the app doesn't start out empty when you're showcasing it:

```bash
npm run seed:samples
```

It adds (no admin, no collections are wiped):

- 6 staff + 6 employees (workshop manager, 2 mechanics, service advisor, inventory, accountant)
- 12 customers and 14 vehicles (Indian brands/plates, mixed fuel types incl. an EV)
- 12 services, 6 suppliers, 20 parts (some low stock) and 2 purchase orders
- 12 bookings → job cards → inspections with health scores, 10 invoices (paid / partially paid / overdue), 9 payments
- 3 upcoming bookings + appointments, reminders, published reviews, notifications

Every sample account (staff and customers) signs in with password `Sample@1234`. A few staff emails: `sam.rao@example.net`, `arjun.mech@example.net`, `kiran.advisor@example.net`. A few customers: `rahul.sharma@example.net`, `priya.mehta@example.net`, `sneha.reddy@example.net`.

> Sample data is **opt-in** — it is never created by `npm run seed`, boot, or normal usage. Remove it any time with `npm run seed` (factory reset) or by deleting the `@example.net` users via `deleteMany({ email: /@example\.net$/ })`. All sample accounts share one documented password, so never enable this on a public-facing database.

### 5. Log in and add real data

1. Open http://localhost:5173/login and sign in as the admin you created.
2. In the admin dashboard go to **Services** → create your service catalog first (used throughout booking/invoicing).
3. **Customers** are created when people register on the public site, or by staff from the Customers page.
4. Work down the left-hand menu as the flow hits each stage: Bookings → Job Cards → Inventory, Invoices/Payments, Reports, Settings.

New customer accounts can only self-register with the **customer** role. All staff/admin roles are only created by you through the env bootstrap or the Employees page.

---

## Data model (MongoDB collections)

| Collection              | Purpose                                                        |
|-------------------------|----------------------------------------------------------------|
| `users`                 | Customers + staff (roles: customer, service_advisor, mechanic, workshop_manager, inventory_manager, accountant, admin, super_admin) |
| `vehicles`              | Customer vehicles, health score, mileage, fuel/type metadata    |
| `services`              | Service catalog (price, ETA, includes, vehicle types)           |
| `bookings`              | Booking requests with slot, pickup/drop-off, status lifecycle   |
| `appointments`          | Walk-in workshop appointments                                   |
| `jobcards`              | Work orders — staff assignment, inspection, estimate, invoice   |
| `inspections`           | Multi-section health-scan results, computed health score        |
| `estimates`             | Itemised cost breakdowns awaiting customer approval             |
| `servicerecords`        | Completed services per vehicle (history)                        |
| `invoices` / `payments` | Billing, partial payments, outstanding balances                 |
| `parts` / `suppliers` / `purchaseorders` / `inventorytransactions` | Spares, vendors, procurement, stock movements |
| `employees`             | Staff directory & payroll-side info linked to `users`           |
| `reminders`             | Due-for-service reminders (date or mileage)                     |
| `reviews`               | Customer ratings, moderation (pending/published/hidden)         |
| `notifications`         | In-app notifications + broadcasts                                |
| `settings`              | Company profile, document prefixes, tax, business hours, channels |
| `counters`              | Sequential document numbers (INV-, JB-, BKG-, EST-, PO-)        |

Entity relations (populated references in the API): `booking -> customer/vehicle/services`, `jobCard -> booking/vehicle/assigned staff`, `estimate -> jobCard`, `invoice -> customer/vehicle/jobCard/booking`, `payment -> invoice`, `part -> supplier`, `serviceRecord -> customer/vehicle/booking`.

---

## Roles & permissions

| Role               | Can access                  |
|--------------------|-----------------------------|
| `customer`         | Own dashboard, bookings, vehicles, invoices/payments, reminders, reviews |
| `service_advisor`  | Staff dashboard, bookings, job cards |
| `mechanic`         | Assigned job cards, inspection, estimates |
| `inventory_manager`| Parts, suppliers, purchase orders |
| `accountant`       | Invoices, payments, reports |
| `workshop_manager` | Everything staff can + creating/updating services, employees, reminders, settings, broadcasts |
| `admin` / `super_admin` | Full access |

---

## Building & deployment

The client and API are built separately.

```bash
npm run build            # typecheck + build server (server/dist) and client (client/dist)
npm start                # run the compiled server only
```

For production:

1. Set a strong `JWT_SECRET`, your real `MONGO_URI`, `CLIENT_URL`, `SERVER_URL`, `COOKIE_SECURE=true`, and the `ADMIN_*` bootstrap vars in `server/.env`.
2. `npm run build`.
3. Serve the **API** (`npm start`, or `node server/dist/index.js`) and the **frontend** (`client/dist`) on your infrastructure. The server **does** serve the built client in production when `client/dist` exists — you can host everything on a single Node process (as the Render blueprint does), or split the API and the static files across hosts.
4. Point the client's requests at the API. In development Vite proxies `/api` → `http://localhost:5001`; in production make sure both apps share the domain (API under `/api` on the same origin) or configure CORS properly — the whitelist lives in `server/src/app.ts` and the cookie is scoped to the API origin.
5. Socket.IO must be routable (e.g. nginx `proxy_set_header Upgrade` / `Connection` for the API websocket endpoint).

Environment-specific defaults are in `server/src/config/env.ts` and `client/vite.config.ts` (proxy settings).

### Deploying on Render (single service)

A `render.yaml` blueprint is included, so the easiest path is:

1. Click **New + → Blueprint** in the Render dashboard and pick this repo (after pushing it to GitHub).
2. Set the sync'd env vars in the "Environment" tab of the created service:
   - `MONGO_URI` — your database connection string (Render's managed MongoDB via **New + → MongoDB**, or MongoDB Atlas). The free tier has no persistent disk, so uploads under `server/uploads` are ephemeral.
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` — created/reset on first boot (unset = no admin).
3. `JWT_SECRET` is auto-generated; `NODE_ENV=production` and `COOKIE_SECURE=true` are set for you; `CLIENT_URL` / `SERVER_URL` fall back to Render's `RENDER_EXTERNAL_URL` automatically.
4. Deploy. The service listens on `$PORT`, serves the built SPA from `client/dist`, and the API under `/api` — same origin, so cookies and Socket.IO need no extra config.

In the dashboard you can also deploy manually: **New + → Web Service**, repo, build `npm install && npm run build`, start `npm start`, health check `/api/health`, same env vars. In production the server serves the client it built, so no separate static host or nginx is needed.

> The build uses `npm install`, not `npm ci`. Rollup/Vite's platform-specific binary is a Linux-only optional dependency; the lockfile here is generated on macOS (see [npm/cli#4828](https://github.com/npm/cli/issues/4828)), so a strict `npm ci` on a fresh Linux host can fail with `Cannot find module @rollup/rollup-linux-x64-gnu`. `npm install` still installs the exact versions in the lockfile but resolves that one optional platform package on the target machine.

---

## Common scripts

| Command              | What it does                                        |
|----------------------|-----------------------------------------------------|
| `npm run dev`        | Run API + client with hot reload                    |
| `npm run dev:server` | API only                                            |
| `npm run dev:client` | Client only                                         |
| `npm run seed`       | Reset DB + create/reset admin from env              |
| `npm run seed:samples` | Add realistic (fictional) sample data, opt-in     |
| `npm run typecheck`  | Typecheck server + client                           |
| `npm run build`      | Typecheck, then compile server + client             |
| `npm test`           | Run the server API smoke tests (needs a local MongoDB) |
| `npm start`          | Run compiled server                                 |

## Tests

`npm test` boots the real Express app on a random port and runs an end-to-end smoke suite (`server/src/__tests__/api.test.ts`) using Node's built-in test runner: health check, admin login, sign-up (role elevation blocked), `/me`, RBAC guards, service/vehicle/booking creation, and 401 on unauthenticated access.

- Uses a scratch database — `TEST_MONGO_URI` or defaults to `mongodb://127.0.0.1:27017/sac_api_test` (dropped after the run).
- Requires a local MongoDB instance and `.env` with `ADMIN_EMAIL` / `ADMIN_PASSWORD` (used to bootstrap the admin under test).

## CI

`.github/workflows/ci.yml` runs on every push/PR to `main`: `npm ci`, typecheck, build, then the test suite against a MongoDB service container. Env vars such as `ADMIN_EMAIL`, `JWT_SECRET`, and `TEST_MONGO_URI` are injected there, so a gitignored `server/.env` is never needed in CI.

---

## Security notes

- Passwords are hashed with bcrypt; auth uses an httpOnly cookie (`sac_token`) with configurable secure flag.
- Public registration is locked to the **customer** role; staff/admin roles are never creatable from the public API.
- There are no demo accounts or default passwords in the codebase — the initial admin comes only from `ADMIN_*` environment variables.
- Rate limits are applied to the API and to auth endpoints (tunable via `RATE_LIMIT_API` / `RATE_LIMIT_AUTH`).
- Do not commit `server/.env` or any real secrets. `.env.example` contains placeholders only.
- `npm audit` is clean except for the **Vite dev server** used while developing the client (moderate/high, local-only: dev-server path traversal and Windows-only issues). It is never present in the production bundle or the served API; a fix would require a breaking Vite 8 upgrade (and its plugin chain), so it is consciously deferred. `esbuild` and all server dependencies audit clean.