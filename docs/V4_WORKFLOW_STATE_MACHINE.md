# V4 Workflow State Machine

## Canonical Request Lifecycle
`DRAFT -> SUBMITTED -> UNDER_REVIEW -> APPROVED|REJECTED -> IN_DELIVERY -> DELIVERED -> CONFIRMED`

## Transition Rules
- `DRAFT -> SUBMITTED`
- `SUBMITTED -> UNDER_REVIEW`
- `UNDER_REVIEW -> APPROVED`
- `UNDER_REVIEW -> REJECTED`
- `APPROVED -> IN_DELIVERY`
- `IN_DELIVERY -> DELIVERED`
- `DELIVERED -> CONFIRMED`

## Role Ownership by Transition
- Distributor:
  - create `DRAFT`
  - submit to `SUBMITTED`
  - confirm `DELIVERED -> CONFIRMED`
- Manager:
  - queue processing (`UNDER_REVIEW`)
  - decision (`APPROVED`/`REJECTED`)
  - delivery progression (`IN_DELIVERY`, `DELIVERED`)
- Admin:
  - any transition by override policy

## Forbidden Transitions (examples)
- `DRAFT -> APPROVED`
- `SUBMITTED -> DELIVERED`
- `REJECTED -> IN_DELIVERY`
- `CONFIRMED -> any`

## Audit Requirements
Each transition must:
1. Create status log row with actor, role, previous state, next state.
2. Write activity log event for dashboard timelines.
3. Preserve legacy state in metadata during migration.

## State Ownership Notes
- `REJECTED` is terminal unless an explicit reopen policy is added.
- `CONFIRMED` is terminal for v4 prototype.
