# Agriculture Distribution System v4 - System Overview

## Purpose
This document defines the official v4 execution model for replacing v3 role semantics and flow ownership without changing the core stack foundation.

## Core Direction
Keep the proven v3 foundation:
- React + Vite frontend
- Django + DRF backend
- JWT authentication
- Modular app boundaries

Refactor only business semantics and ownership:
- Role model: 4 roles -> 3 roles
- Unified request lifecycle
- Clear manager-centric operational control

## Canonical v4 Roles
- `ADMIN`
- `MANAGER`
- `DISTRIBUTOR`

After cutover, no backend or frontend path should rely on `BUYER` or `DISPATCHER`.

## Canonical v4 Scope
1. Auth and RBAC
2. Inventory/Produce Supply Board
3. Request Lifecycle
4. Distribution and Delivery Tracking
5. Demand/Offer Board (simplified)
6. Activity and KPI Dashboard

## Unified Lifecycle
`DRAFT -> SUBMITTED -> UNDER_REVIEW -> APPROVED|REJECTED -> IN_DELIVERY -> DELIVERED -> CONFIRMED`

Role ownership:
- Distributor: `DRAFT`, `SUBMITTED`, `CONFIRMED`
- Manager: `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `IN_DELIVERY`, `DELIVERED`
- Admin: global override

## Cutover Rule
v4 is done only when:
1. Buyer/Dispatcher role references are removed from active logic.
2. All flows operate under Admin/Manager/Distributor.
3. Request lifecycle guards enforce the unified chain.
4. Delivery proof and request timeline are available in v4 endpoints.
5. Demo data and docs are v4-only.
