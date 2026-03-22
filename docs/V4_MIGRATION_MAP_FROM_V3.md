# V4 Migration Map from v3

## Objective
Perform a controlled migration from v3 to v4 semantics without destabilizing existing demo capability.

## Phase A - Role Compatibility
1. Add new enum values: `MANAGER`, `DISTRIBUTOR`.
2. Backfill users:
   - `DISPATCHER` + `BUYER` -> `MANAGER`
   - `FARMER` -> `DISTRIBUTOR`
3. Keep legacy roles readable only during transition.

## Phase B - Status Normalization
1. Map old order/shipment states into v4 lifecycle.
2. Preserve raw legacy state in metadata field for audit traceability.
3. Validate timeline ordering after conversion.

## Phase C - Endpoint Dual-Run
1. Keep v3 `/api/` live.
2. Introduce v4 `/api/v4/` in parallel.
3. Frontend switch controlled by `VITE_API_VERSION=v4`.

## Phase D - Cutover
1. Make frontend default to v4.
2. Freeze writes on v3 endpoints.
3. Remove v3 role checks and legacy labels from active UI/API.

## Backend App Mapping
- `apps.users`: role enum and permission normalization
- `apps.listings` and `apps.catalog`: naming and serializer semantics for distributor-side supply
- `apps.orders`: lifecycle guard rewrite and role-neutral queue endpoints
- `apps.logistics`: manager ownership of dispatcher operations
- `apps.demand_board`: manager demand plans, distributor offers
- `apps.dashboard`: activity and KPI role normalization

## Frontend Route Migration Targets
- Keep public: `/login`, `/register`
- Role switch dashboard: `/dashboard`
- Add/normalize:
  - `/requests/new`
  - `/requests/mine`
  - `/requests/queue`
  - `/requests/:id`
  - `/distribution/board`
  - `/distribution/tracking`
  - `/demand-board`
  - `/admin/users`
  - `/admin/inventory`
  - `/profile`
- Remove old semantics:
  - `/orders/buyer`
  - `/logistics/dispatch-board` (rename to `/distribution/board`)
  - `/listings/farmer` (rename to `/supply/distributor`)

## Demo Account Target (v4)
- `demo_admin`
- `demo_manager_1`
- `demo_manager_2`
- `demo_distributor_1`
- `demo_distributor_2`

Prototype password remains: `demo12345`.
