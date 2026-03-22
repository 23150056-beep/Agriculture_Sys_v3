# Agriculture Distribution System v3 - Full Technical Details

## v4 Migration Notice

This file remains the detailed reference for current v3 implementation.

For v4 migration and replacement planning, use the canonical v4 docs:

- docs/V4_SYSTEM_OVERVIEW.md
- docs/V4_ROLE_MATRIX.md
- docs/V4_WORKFLOW_STATE_MACHINE.md
- docs/V4_API_CONTRACT.md
- docs/V4_MIGRATION_MAP_FROM_V3.md
- docs/V4_GLOSSARY.md

## 1. System Overview

Agriculture Distribution System v3 is a full-stack prototype for coordinating produce listings, buyer orders, and dispatcher logistics across four roles:

- Admin
- Farmer
- Buyer
- Dispatcher

The platform supports:

- Role-based dashboards and protected navigation
- Produce listing and marketplace browsing
- Buyer order lifecycle and timeline tracking
- Dispatcher trip planning and shipment assignment
- Demand board (buyers post demand, farmers offer supply)
- Activity logging and lightweight analytics

## 2. Technology Stack

### Frontend

- React 19 + Vite 8
- React Router DOM 7
- Axios for API integration
- Lucide React icons
- ESLint for linting

### Backend

- Django 5 + Django REST Framework
- JWT authentication via djangorestframework-simplejwt
- SQLite database (development)
- django-cors-headers for CORS
- Pillow for image handling

### Deployment

- Frontend: GitHub Pages via GitHub Actions workflow
- Backend: local development setup included (production deployment not yet automated)

## 3. High-Level Architecture

```text
React (Vite, HashRouter)
  -> Axios (Bearer token interceptor)
  -> Django REST API (/api/*)
  -> SQLite DB

Auth:
- Local/dev: JWT login against Django
- GitHub Pages: demo-mode fallback auth in frontend
```

## 4. Repository and Module Layout

### Root

- `README.md`: quick setup and module summary
- `DEMO_ACCOUNTS.md`: seeded demo users
- `AGRI_DISTRIBUTION_PROTOTYPE_PLAN.md`: prototype scope and roadmap
- `.github/workflows/deploy-pages.yml`: frontend deployment pipeline

### Frontend (`src/`)

- `app/router.jsx`: full route map and route guards
- `api/`: API wrappers per module
- `pages/`: auth, dashboard, listings, orders, logistics, demand, profile
- `components/common/`: shared UI components (shell, table, badges, drawers, etc.)
- `components/charts/`: drilldown chart components
- `hooks/`: auth, saved views, keyboard shortcuts, notifications, refresh utilities
- `utils/`: constants, date/currency formatting, API error parser, CSV export, demo auth

### Backend (`backend/`)

- `config/`: project settings and top-level URLs
- `apps/users`: user model, auth APIs, role permissions, demo data command
- `apps/catalog`: categories and products
- `apps/locations`: location master data
- `apps/listings`: farmer listings and listing images
- `apps/orders`: buyer orders and status timeline
- `apps/logistics`: vehicles, drivers, trips, shipments, delivery proof
- `apps/demand_board`: demand posts and farmer offers
- `apps/dashboard`: summary APIs and activity logging

## 5. Frontend Details

## 5.1 Routing and Access Control

The app uses `HashRouter` for GitHub Pages compatibility.

Public routes:

- `/login`
- `/register`

Protected app routes:

- `/dashboard` (role-switching dashboard)
- `/marketplace`
- `/listings/farmer` (farmer/admin)
- `/listings/new` (farmer/admin)
- `/orders/buyer`
- `/orders/farmer` (farmer/admin)
- `/orders/:id`
- `/logistics/dispatch-board` (dispatcher/admin)
- `/logistics/trip-planner` (dispatcher/admin)
- `/logistics/shipment-tracking`
- `/demand-board`
- `/profile`

Role checks are enforced in `ProtectedRoute` and route-level role arrays.

## 5.2 Dashboard Switching

`DashboardSwitch` routes users to role-specific dashboards:

- Admin -> `AdminDashboard`
- Farmer -> `FarmerDashboard`
- Dispatcher -> `DispatcherDashboard`
- Buyer -> `BuyerDashboard`

## 5.3 API Integration Pattern

`src/api/axios.js` creates one API client:

- `baseURL = VITE_API_BASE_URL || http://127.0.0.1:8000/api`
- Adds `Authorization: Bearer <token>` from localStorage when available

Module APIs are split by domain:

- `authApi.js`
- `catalogApi.js`
- `dashboardApi.js`
- `demandApi.js`
- `listingsApi.js`
- `ordersApi.js`
- `logisticsApi.js`

## 5.4 Demo Mode Auth (GitHub Pages)

`src/utils/demoAuth.js` enables demo-mode auth when:

- `VITE_DEMO_MODE=true`, or
- hostname ends with `github.io`

Behavior:

- Accepts known demo usernames with password `demo12345`
- Stores demo user in localStorage
- Clears access/refresh/demo user on logout helper

This allows static frontend demos without live backend auth.

## 5.5 UX/Interaction Features

Implemented dynamic UX includes:

- Command palette shortcut (`Ctrl/Cmd + K`)
- Role-aware notification feed
- Saved views with localStorage persistence
- Auto-refresh hook with visibility-aware updates
- Last-updated live timestamp display
- Density mode toggle (cozy/compact)
- Activity feed components
- CSV export utility

## 6. Backend Details

## 6.1 Global API Configuration

Django REST Framework defaults:

- Authentication: JWT
- Permission: IsAuthenticated by default

JWT settings:

- Access token lifetime: 60 minutes
- Refresh token lifetime: 7 days

CORS:

- Reads `CORS_ALLOWED_ORIGINS`
- Falls back to allow-all if no origins are set

## 6.2 Users App (`apps.users`)

### Model

Custom `User` extends `AbstractUser` with:

- `role`: ADMIN, FARMER, BUYER, DISPATCHER
- `full_name`
- `phone`
- `created_at`

### Auth Endpoints

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `GET /api/auth/me/`

### Permissions

Role-based permission classes are defined for farmer, buyer, and dispatcher actions.

### Demo Seeder

Management command: `python manage.py seed_demo --reset`

- creates demo users
- seeds products, locations, listings, orders, trips, shipments, and demand data

## 6.3 Catalog App (`apps.catalog`)

Models:

- `Category`
- `Product` (FK to category)

Endpoints:

- `GET/POST /api/categories/`
- `GET/POST /api/products/`

## 6.4 Locations App (`apps.locations`)

Model:

- `Location` (province, city/municipality, barangay, postal_code)

Endpoint:

- `GET/POST /api/locations/` (+ search support)

## 6.5 Listings App (`apps.listings`)

Models:

- `Listing` (farmer, product, quantity, unit_price, quality, dates, location, status)
- `ListingImage` (multiple images per listing)

Business rule:

- `urgent_sale` flag auto-computed if listing is close to `available_until`

Endpoints:

- `GET/POST /api/listings/`
- `GET /api/listings/farmer/mine/`
- `POST /api/listings/{id}/clone/`
- `GET /api/listings/{id}/sell-fast-suggestion/`

## 6.6 Orders App (`apps.orders`)

Models:

- `Order` (buyer, listing, quantity, price snapshot, total, status, delivery fields)
- `OrderStatusLog` (from/to status, changed_by, note, timestamp)

Status flow (guarded transitions):

- `PENDING -> CONFIRMED -> PACKED -> ASSIGNED -> IN_TRANSIT -> DELIVERED`
- cancellation supported per transition rules

Endpoints:

- `GET/POST /api/orders/`
- `GET /api/orders/my/`
- `GET /api/orders/farmer/mine/`
- `PATCH /api/orders/{id}/status/`
- `GET /api/orders/{id}/timeline/`

## 6.7 Logistics App (`apps.logistics`)

Models:

- `Vehicle`
- `Driver`
- `Trip` (dispatcher, vehicle, driver, schedule, status)
- `Shipment` (one-to-one with order, optional trip assignment)
- `DeliveryProof` (one-to-one with shipment, photo + receiver + notes)

Core behavior:

- Assignment checks trip capacity before attaching shipment
- Shipment status transitions are validated
- Shipment status updates can synchronize related order status

Endpoints:

- `GET/POST /api/vehicles/`
- `GET/POST /api/drivers/`
- `GET/POST /api/trips/`
- `GET/POST /api/shipments/`
- `GET /api/shipments/pending-assignment/`
- `POST /api/shipments/assign-shipment/`
- `POST /api/shipments/capacity-check/`
- `POST /api/shipments/consolidate/`
- `PATCH /api/shipments/{id}/status/`
- `POST /api/shipments/{id}/proof-of-delivery/`

## 6.8 Demand Board App (`apps.demand_board`)

Models:

- `DemandPost` (buyer, product, quantity, budget range, required date, location, status)
- `DemandOffer` (farmer response with quantity and offered price)

Endpoints:

- `GET/POST /api/demand-posts/`
- `GET/POST /api/demand-offers/`
- `POST /api/demand-posts/{id}/offers/`

## 6.9 Dashboard App (`apps.dashboard`)

Model:

- `ActivityLog` (actor, role, module, action, message, metadata, created_at)

Endpoints:

- `GET /api/dashboard/summary/`
- `GET /api/dashboard/farmer/overview/`
- `GET /api/dashboard/dispatcher/overview/`
- `GET/POST/DELETE /api/dashboard/activity/`

## 7. Data Relationships

```text
User
  - has many Listings (as farmer)
  - has many Orders (as buyer)
  - has many Trips (as dispatcher)
  - has many DemandPosts (as buyer)

Listing
  - belongs to Product and Location
  - has many ListingImages
  - has many Orders

Order
  - belongs to Buyer and Listing
  - has many OrderStatusLogs
  - has one Shipment

Shipment
  - belongs to one Order
  - optionally belongs to a Trip
  - has one DeliveryProof

DemandPost
  - belongs to Buyer
  - has many DemandOffers
```

## 8. Role-Based Workflows

### Buyer

1. Browse marketplace listings
2. Create order
3. Track order timeline
4. Post demand entry and review farmer offers

### Farmer

1. Create and manage listings
2. Receive buyer orders
3. Update order status through farmer-owned stages
4. Monitor listing urgency and relist when needed

### Dispatcher

1. Review pending shipments
2. Create trip with vehicle and driver
3. Assign shipments with capacity checks
4. Advance shipment status and upload proof of delivery

### Admin

1. View global dashboards and metrics
2. Access all role capabilities via role checks
3. Manage records through APIs/admin tools

## 9. Environment and Configuration

### Frontend Environment

- `VITE_API_BASE_URL` controls API base URL
- `VITE_DEMO_MODE=true` forces demo mode

### Backend Environment

- `SECRET_KEY`
- `DEBUG`
- `ALLOWED_HOSTS` (comma-separated)
- `CORS_ALLOWED_ORIGINS` (comma-separated)

### Vite Base Path for Pages

`vite.config.js` sets base dynamically in GitHub Actions using repo name, enabling proper asset paths on GitHub Pages.

## 10. Setup, Run, and Commands

## 10.1 Frontend (project root)

```bash
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

Dev URL: `http://localhost:5173`

## 10.2 Backend (`backend/`)

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo --reset
python manage.py runserver
```

API base URL: `http://127.0.0.1:8000/api/`

## 10.3 Useful Backend Commands

```bash
python manage.py createsuperuser
python manage.py test apps.orders apps.logistics
```

## 11. Testing Status

Automated tests are present for at least:

- order permissions and status transitions (`apps.orders.tests`)
- logistics assignment, transitions, and capacity checks (`apps.logistics.tests`)

The system is still prototype-stage, so broader coverage (frontend tests, integration tests, load/security tests) is not yet complete.

## 12. Deployment and Operations

### Frontend CI/CD

GitHub workflow `.github/workflows/deploy-pages.yml`:

- install dependencies with `npm ci`
- build with `npm run build`
- upload `dist/`
- deploy to GitHub Pages

### Backend Deployment Readiness

Not yet fully productionized in-repo. For production, add:

- managed database (for example PostgreSQL)
- stricter CORS and host settings
- static/media strategy (for example object storage)
- process manager and HTTPS reverse proxy
- observability (error monitoring and logs)

## 13. Demo Accounts

Default password for all demo users: `demo12345`

- `demo_admin`
- `demo_farmer_1`
- `demo_farmer_2`
- `demo_buyer_1`
- `demo_buyer_2`
- `demo_dispatcher`

See full table in `DEMO_ACCOUNTS.md`.

## 14. Current Limitations and Next Improvements

Known gaps for production readiness:

- no production backend deployment pipeline in this repo
- limited advanced business flows (disputes/ratings/traceability enhancements)
- no websocket real-time events (polling-oriented frontend updates)
- local media storage by default
- security hardening and rate limiting can be expanded

## 15. Quick API Index

```text
Auth
- /api/auth/register/
- /api/auth/login/
- /api/auth/refresh/
- /api/auth/me/

Dashboard
- /api/dashboard/summary/
- /api/dashboard/farmer/overview/
- /api/dashboard/dispatcher/overview/
- /api/dashboard/activity/

Core resources (router)
- /api/locations/
- /api/categories/
- /api/products/
- /api/listings/
- /api/orders/
- /api/vehicles/
- /api/drivers/
- /api/trips/
- /api/shipments/
- /api/demand-posts/
- /api/demand-offers/

Custom actions
- /api/listings/farmer/mine/
- /api/listings/{id}/clone/
- /api/listings/{id}/sell-fast-suggestion/
- /api/orders/my/
- /api/orders/farmer/mine/
- /api/orders/{id}/status/
- /api/orders/{id}/timeline/
- /api/shipments/pending-assignment/
- /api/shipments/assign-shipment/
- /api/shipments/capacity-check/
- /api/shipments/consolidate/
- /api/shipments/{id}/status/
- /api/shipments/{id}/proof-of-delivery/
- /api/demand-posts/{id}/offers/
```

---

This document is intended as a comprehensive technical baseline for onboarding, handoff, and extension planning of Agriculture Distribution System v3.
