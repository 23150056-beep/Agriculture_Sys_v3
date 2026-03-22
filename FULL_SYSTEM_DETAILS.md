# Agriculture Distribution System - Current Technical Details

This document reflects the current implemented state of the system in this repository.

## 1. Current System Snapshot

The project currently runs on a v4 business model with three active roles:

- `ADMIN`
- `MANAGER`
- `DISTRIBUTOR`

The application supports:

- Role-based dashboards and guarded routes
- Supply listing management for distributors
- Unified request lifecycle and manager approval queue
- Delivery and shipment operations with POD upload
- Demand board planning and offers
- Activity logging and summary metrics
- Admin whole-system report page with one-click CSV export

## 2. Technology Stack

### Frontend

- React 19
- Vite 8
- React Router DOM 7 (`HashRouter`)
- Axios
- Lucide React
- ESLint

### Backend

- Django 5
- Django REST Framework
- Simple JWT (`djangorestframework-simplejwt`)
- SQLite (development)
- CORS via `django-cors-headers`

## 3. Core Architecture

```text
React (Vite, HashRouter)
  -> Axios client (JWT Bearer token)
  -> Django REST API (/api/* and /api/v4/*)
  -> SQLite
```

## 4. Role Model and Access

Current role enum in `users.User`:

- `ADMIN`
- `MANAGER`
- `DISTRIBUTOR`

Permission helpers are implemented in `backend/apps/users/permissions.py`:

- `IsAdmin`
- `IsManager`
- `IsDistributor`

## 5. Frontend Routes (Current)

Public:

- `/login`
- `/register`

Protected:

- `/dashboard`
- `/marketplace`
- `/supply/distributor`
- `/listings/new`
- `/requests/new`
- `/requests/mine`
- `/requests/queue`
- `/requests/:id`
- `/distribution/board`
- `/distribution/tracking`
- `/distribution/planner`
- `/admin/reports`
- `/demand-board`
- `/profile`

Legacy redirects are preserved for compatibility:

- `/orders/buyer` -> `/requests/mine`
- `/orders/farmer` -> `/requests/queue`
- `/orders/:id` -> `/requests/:id`
- `/logistics/dispatch-board` -> `/distribution/board`
- `/logistics/trip-planner` -> `/distribution/planner`
- `/logistics/shipment-tracking` -> `/distribution/tracking`
- `/listings/farmer` -> `/supply/distributor`

## 6. Admin Whole-System Report (New)

Frontend report center:

- Route: `/admin/reports`
- Page: `src/pages/admin/UnifiedReportsPage.jsx`
- API aggregator: `src/api/reportApi.js`

Data sources combined dynamically for one consolidated snapshot:

- `/dashboard/summary/`
- `/dashboard/activity/`
- `/listings/`
- `/orders/`
- `/shipments/`
- `/trips/`
- `/demand-posts/`
- `/products/`
- `/locations/`

Export:

- Button: `Export Whole CSV`
- Output file: `whole-system-report.csv`

## 7. Backend API Surface (Current)

### Auth

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `GET /api/auth/me/`

v4 alias:

- `/api/v4/auth/*` (same handlers)

### Dashboard

- `GET /api/dashboard/summary/`
- `GET /api/dashboard/manager/overview/`
- `GET /api/dashboard/distributor/overview/`
- `GET /api/dashboard/farmer/overview/` (legacy alias)
- `GET /api/dashboard/dispatcher/overview/` (legacy alias)
- `GET/POST/DELETE /api/dashboard/activity/`

v4 alias:

- `/api/v4/dashboard/*`

### Core Routers

`/api/` exposes:

- `locations`
- `categories`
- `products`
- `listings`
- `orders`
- `requests` (alias of orders)
- `vehicles`
- `drivers`
- `trips`
- `shipments`
- `deliveries` (alias of shipments)
- `demand-posts`
- `demand-offers`

`/api/v4/` exposes v4 router resources and explicit manager/delivery actions:

- `GET /api/v4/manager/approval-queue/`
- `POST /api/v4/manager/requests/{id}/approve/`
- `POST /api/v4/manager/requests/{id}/reject/`
- `POST /api/v4/requests/{id}/confirm/`
- `POST /api/v4/deliveries/assign/`
- `PATCH /api/v4/deliveries/{id}/status/`
- `POST /api/v4/deliveries/{id}/proof/`

## 8. Unified Request Workflow

Current order/request statuses:

- `DRAFT`
- `SUBMITTED`
- `UNDER_REVIEW`
- `APPROVED`
- `REJECTED`
- `IN_DELIVERY`
- `DELIVERED`
- `CONFIRMED`

Transitions are enforced in `backend/apps/orders/services.py` and used by `orders`/`requests` view actions.

## 9. Logistics and POD

Primary logistics models:

- `Vehicle`
- `Driver`
- `Trip`
- `Shipment`
- `DeliveryProof`

Implemented operations include:

- Pending assignment queue
- Capacity checks
- Shipment assignment to trip
- Shipment status progression
- Proof-of-delivery upload
- Synchronization of shipment status into request status where applicable

## 10. Demand Board

Demand board model set:

- `DemandPost`
- `DemandOffer`

Current role behavior:

- Manager/Admin can create demand posts
- Distributor/Admin can submit offers

## 11. Demo Data

Seed command:

```bash
python manage.py seed_demo --reset
```

Default demo password:

- `demo12345`

Current demo users:

- `demo_admin`
- `demo_manager_1`
- `demo_manager_2`
- `demo_distributor_1`
- `demo_distributor_2`

## 12. Local Run Commands

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo --reset
python manage.py runserver
```

### Frontend

```bash
npm install
npm run dev
npm run build
npm run lint
```

## 13. Current Validation Baseline

Common validation commands used for this repo:

```bash
cd backend
python manage.py test
python manage.py makemigrations --check --dry-run

cd ..
npm run lint
npm run build
```

## 14. Canonical v4 Reference Docs

For v4 policy and migration references, use:

- `docs/V4_SYSTEM_OVERVIEW.md`
- `docs/V4_ROLE_MATRIX.md`
- `docs/V4_WORKFLOW_STATE_MACHINE.md`
- `docs/V4_API_CONTRACT.md`
- `docs/V4_MIGRATION_MAP_FROM_V3.md`
- `docs/V4_GLOSSARY.md`
