# V4 Role Matrix

## Canonical Mapping from v3
- `ADMIN` -> `ADMIN`
- `DISPATCHER` -> `MANAGER`
- `BUYER` -> `MANAGER`
- `FARMER` -> `DISTRIBUTOR`

## Role Responsibilities

### ADMIN
- Full system visibility and override
- User and master data administration
- Policy and workflow guardrail control

### MANAGER
- Operational owner for planning and approvals
- Manages approval queue and request decisions
- Owns delivery assignment and delivery state progression
- Posts demand plans and monitors fulfillment

### DISTRIBUTOR
- Field/operator identity (farmer-side)
- Creates and submits requests
- Tracks assigned delivery progress
- Confirms completed deliveries
- Submits demand board offers/commits

## Capability Matrix
| Capability | Admin | Manager | Distributor |
|---|---|---|---|
| Register/Login/Profile | Yes | Yes | Yes |
| View dashboard/KPIs | Yes | Yes | Yes (scoped) |
| Manage users | Yes | No | No |
| Manage products/locations | Yes | Optional read | Optional read |
| Create request draft | Yes | Optional | Yes |
| Submit request | Yes | Optional | Yes |
| Review requests | Yes | Yes | No |
| Approve/Reject requests | Yes | Yes | No |
| Assign delivery | Yes | Yes | No |
| Upload/verify delivery proof | Yes | Yes | Upload only when allowed |
| Confirm delivery completion | Yes | Optional override | Yes |
| Post demand plans | Yes | Yes | No |
| Submit demand offers | Yes | Optional | Yes |

## Enforcement Rule
- `BUYER` and `DISPATCHER` are legacy-only transition values.
- New logic, permissions, and route guards must only reference `ADMIN`, `MANAGER`, and `DISTRIBUTOR`.
