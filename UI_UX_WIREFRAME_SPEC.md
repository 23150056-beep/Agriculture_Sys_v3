# UI/UX Wireframe Specification (Logic-Safe)

This document captures the Agrilo-style UI/UX direction and maps it to the existing module structure only.

## 0. Global Layout (All Authenticated Pages)

### Desktop
- Left sidebar for module navigation
- Top header for search, notifications, profile actions
- Main content container with responsive gutters and max-width

### Tablet
- Collapsible sidebar
- Compact top header and spacing

### Mobile
- Top app bar plus bottom navigation
- Tabs: Dashboard, Demand, Listings, Orders, Profile
- Logistics entry via More if required by width constraints

### Global zones
1. Header zone
2. Filter/action zone (optional per page)
3. Primary content zone
4. Secondary context zone (drawer/right panel where relevant)

## 1. Dashboard Wireframe

### Purpose
Instant visibility into system health and next actions.

### Layout blocks
1. KPI row (4 cards)
   - Total active listings
   - Open demand items
   - In-progress logistics jobs
   - Pending/active orders
2. Insights grid (2 columns on desktop)
   - Left: trend and summary cards
   - Right: status distribution and recent changes
3. Activity and actions
   - Recent activity feed
   - Priority actions with deep links to module routes

### UX rules
- KPI cards navigate to filtered module views.
- Priority actions remain visible above fold on desktop.
- Empty states include direct CTA aligned with existing flows.

## 2. Demand Wireframe

### Purpose
Manage demand posts quickly with clear statuses.

### Layout blocks
1. Header with title, count, and primary CTA
2. Filter bar
   - Search
   - Status
   - Date
   - Location
3. Main content
   - Desktop: list or kanban toggle
   - Mobile: stacked demand cards
4. Detail interaction
   - Row/card click opens detail drawer or route already present

### UX rules
- Standardized status chip colors.
- Preserve current filtering and sorting behavior from existing logic.
- Batch actions only if already supported.

## 3. Listings Wireframe

### Purpose
High-scannability listing management.

### Layout blocks
1. Header and primary CTA
2. Filter/sort row
3. Desktop table columns
   - Item
   - Category/type (if provided)
   - Quantity/price
   - Status
   - Last updated
   - Actions
4. Mobile cards with condensed equivalent data

### UX rules
- Row actions map exactly to existing endpoints.
- Status and action availability respects existing permissions and state.
- Empty state includes create listing CTA.

## 4. Logistics Wireframe

### Purpose
Track and manage fulfillment movement.

### Layout blocks
1. Summary cards
   - Queued
   - In-progress
   - Completed
2. Operations list with stage indicators
3. Detail panel
   - Timeline
   - Metadata
   - Allowed actions

### UX rules
- Stage progression mirrors existing backend statuses.
- Route/location visualization only when payload data exists.
- Timeline component for history events.

## 5. Orders Wireframe

### Purpose
Clear pipeline with actionable detail views.

### Layout blocks
1. Status summary strip
2. Order list/table
3. Order detail pane/page
   - Basic info
   - Items
   - Timeline/history
   - Allowed actions

### UX rules
- Action visibility is conditional by order state.
- Blockers are visually highlighted.
- Existing order transitions remain unchanged.

## 6. Profile Wireframe

### Purpose
Simple account and preference management.

### Layout blocks
1. Profile header card
2. Account information section
3. Preferences/notifications section
4. Security section (if supported)
5. Activity snippet (if supported)

### UX rules
- Explicit validation and save feedback.
- No new form fields unless backend support already exists.

## 7. Auth Wireframe

### Purpose
Lower friction and improve error clarity.

### Layout blocks
1. Brand panel (desktop) or compact brand header (mobile)
2. Auth form card
3. Error/help text area
4. Secondary links (register, recovery if available)

### UX rules
- Inline validation before submit.
- Actionable error states.
- Submit loading state.

## 8. Shared Component Inventory

Required reusable components:
- AppShell
- PageHeader
- KpiCard
- StatusBadge
- FilterBar
- DataTable
- MobileDataCard
- Timeline
- DetailDrawer
- EmptyState
- ErrorState
- SkeletonLoader
- Toast

## 9. Visual System (Agrilo-inspired)

- Green-forward primary palette with calm neutrals
- Strong contrast for critical statuses
- Rounded surfaces (12px to 16px)
- Soft depth shadows
- KPI numbers with strong visual hierarchy
- Consistent icon stroke style
- 8px spacing scale

## 10. QA Checklist (UI only, logic-safe)

- All routes in frontend router remain reachable.
- Action buttons map to existing backend actions only.
- No new required fields are introduced.
- Responsive behavior validated across mobile/tablet/desktop.
- Loading, empty, and error states exist for each page.
- Status labels/colors remain consistent across Demand, Listings, Logistics, and Orders.

## Existing Route and Module Mapping

### Frontend route file
- src/app/router.jsx

### Frontend page modules
- src/pages/auth
- src/pages/dashboard
- src/pages/demand
- src/pages/listings
- src/pages/logistics
- src/pages/orders
- src/pages/profile

### Backend route files
- backend/config/urls.py
- backend/apps/users/urls.py
- backend/apps/dashboard/urls.py

### Backend handler modules
- backend/apps/catalog/views.py
- backend/apps/demand_board/views.py
- backend/apps/listings/views.py
- backend/apps/locations/views.py
- backend/apps/logistics/views.py
- backend/apps/orders/views.py
- backend/apps/users/views.py
- backend/apps/dashboard/views.py
