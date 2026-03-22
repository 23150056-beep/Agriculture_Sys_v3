# V4 API Contract

Base path: `/api/v4/`

## Versioning Policy
- Keep `/api/` v3 endpoints during migration.
- New frontend paths should target `/api/v4/` under feature flag control.

## Auth
- `POST /api/v4/auth/register/`
- `POST /api/v4/auth/login/`
- `POST /api/v4/auth/refresh/`
- `GET /api/v4/auth/me/`

Behavior is equivalent to v3 unless role normalization affects payload fields.

## Requests
- `POST /api/v4/requests/`
- `GET /api/v4/requests/`
- `GET /api/v4/requests/{id}/`
- `PATCH /api/v4/requests/{id}/status/`
- `GET /api/v4/requests/{id}/timeline/`

## Manager Queue
- `GET /api/v4/manager/approval-queue/`
- `POST /api/v4/manager/requests/{id}/approve/`
- `POST /api/v4/manager/requests/{id}/reject/`

## Delivery
- `POST /api/v4/deliveries/assign/`
- `PATCH /api/v4/deliveries/{id}/status/`
- `POST /api/v4/deliveries/{id}/proof/`
- `POST /api/v4/requests/{id}/confirm/`

## Admin and Master Data
- `GET/POST /api/v4/users/`
- `GET/POST /api/v4/products/`
- `GET/POST /api/v4/locations/`

## Role Visibility
- Admin: unrestricted
- Manager: operational queue, delivery control, dashboard and demand planning
- Distributor: own requests, own confirmations, scoped tracking, demand offers

## Compatibility Notes
- Existing v3 consumer endpoints (for example buyer/distributor-specific aliases) should emit deprecation headers where feasible.
- `BUYER` and `DISPATCHER` request filters are legacy-mode only.
