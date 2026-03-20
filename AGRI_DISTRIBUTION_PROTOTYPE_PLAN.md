# Centralized Agriculture Distribution System (Philippines)
## Prototype Full Structure Plan (React Vite JS + Django + DRF)

**Project Goal:**  
Build a functional prototype connecting **farmers**, **buyers**, and **distributors** in one system with real CRUD operations, order flow, and shipment tracking.

**Tech Stack:**
- Frontend: React + Vite + JavaScript
- Backend: Django + Django REST Framework
- Database: SQLite (prototype), upgradeable to PostgreSQL
- Auth: JWT (SimpleJWT)
- API: REST
- Deployment (optional prototype): Frontend (Vercel/Netlify), Backend (Render/Railway)

---

## 1) System Scope (Prototype Only)

### Core Flow
1. Farmer creates produce listing
2. Buyer browses and places order
3. Farmer confirms/prepares order
4. Dispatcher assigns shipment
5. Driver/distributor updates delivery status
6. Buyer confirms received goods
7. Dashboard updates summary metrics

### User Roles
- **Admin**
- **Farmer**
- **Buyer**
- **Dispatcher**

---

## 2) Feature Set

## 2.1 MVP Core Features
- User registration/login with role-based access
- Farmer listing management (create/edit/activate/deactivate)
- Buyer marketplace search/filter
- Order creation and status workflow
- Shipment assignment and tracking
- Basic analytics dashboard

## 2.2 Unique Tools/Features for Prototype
1. **Harvest Calendar Planner** (farmer reminders)
2. **Sell Fast Suggestion** (near spoilage/urgent badge)
3. **Batch Quality Grade + Photo**
4. **Delivery Consolidation Tool** (group nearby orders)
5. **Vehicle Capacity Checker**
6. **Proof of Delivery (POD)**
7. **Broadcast Demand Board**
8. **Traceability Timeline**

---

## 3) Functional Modules

## 3.1 Authentication & Access
- Register, login, logout
- JWT access/refresh tokens
- Role-based route and endpoint permissions

## 3.2 Farmer Module
- Manage listings
- View own orders
- Update harvest calendar
- Track simple cost and estimated margin
- Re-list previous item quickly

## 3.3 Buyer Module
- Browse/filter marketplace
- Place orders
- Track order/shipment
- Post demand requests (Demand Board)
- Rate completed orders (optional simple 1-5)

## 3.4 Dispatcher Module
- View confirmed orders queue
- Consolidate orders into a trip
- Assign vehicle/driver
- Update in-transit/delivered statuses
- Upload proof of delivery

## 3.5 Admin Module
- User management
- Product/category/unit management
- Dispute monitoring (optional lightweight)
- Dashboard/report overview

---

## 4) Order and Shipment Status Definitions

## 4.1 Order Status
- `PENDING`
- `CONFIRMED`
- `PACKED`
- `ASSIGNED`
- `IN_TRANSIT`
- `DELIVERED`
- `CANCELLED`
- `PARTIALLY_REJECTED` (optional)

## 4.2 Shipment Status
- `PENDING_ASSIGNMENT`
- `SCHEDULED`
- `LOADED`
- `IN_TRANSIT`
- `DELIVERED`
- `DELAYED`
- `FAILED`

---

## 5) Django Backend Structure

```text
backend/
  manage.py
  requirements.txt
  .env
  config/
    settings.py
    urls.py
    wsgi.py
    asgi.py
  apps/
    users/
      models.py
      serializers.py
      views.py
      urls.py
      permissions.py
    locations/
      models.py
      serializers.py
      views.py
      urls.py
    catalog/
      models.py        # Product, Category, Unit
      serializers.py
      views.py
      urls.py
    listings/
      models.py        # Listing, ListingImage
      serializers.py
      views.py
      urls.py
      services.py      # pricing suggestion / sell fast
    orders/
      models.py        # Order, OrderItem, StatusLog
      serializers.py
      views.py
      urls.py
      services.py      # stock deduction, timeline log
    logistics/
      models.py        # Shipment, Vehicle, Driver, DeliveryProof, Trip
      serializers.py
      views.py
      urls.py
      services.py      # consolidation + capacity checker
    demand_board/
      models.py        # DemandPost, DemandOffer
      serializers.py
      views.py
      urls.py
    dashboard/
      views.py
      urls.py
  media/
  static/
```

---

## 6) Suggested Django Models (Prototype-Friendly)

## 6.1 users
- `User`
  - username, email, password
  - role (`ADMIN`, `FARMER`, `BUYER`, `DISPATCHER`)
  - full_name, phone
  - is_active, created_at

## 6.2 locations
- `Location`
  - province
  - city_municipality
  - barangay
  - postal_code (optional)

## 6.3 catalog
- `Category` (Vegetables, Fruits, Grains, etc.)
- `Product`
  - name
  - category (FK)
  - default_unit (`kg`, `sack`, `crate`)
- `Unit` (optional separate table)

## 6.4 listings
- `Listing`
  - farmer (FK User)
  - product (FK Product)
  - quantity_available
  - unit_price
  - unit
  - quality_grade (`A`, `B`, `C`)
  - harvest_date
  - available_until
  - location (FK Location)
  - urgent_sale (bool)
  - status (`ACTIVE`, `INACTIVE`, `SOLD_OUT`)
  - created_at, updated_at
- `ListingImage`
  - listing (FK)
  - image
- `FarmerCostEntry` (optional simple)
  - farmer, listing, cost_type, amount

## 6.5 orders
- `Order`
  - buyer (FK User)
  - listing (FK Listing)
  - quantity
  - unit_price_snapshot
  - total_price
  - status
  - delivery_location (FK Location)
  - expected_delivery_date
  - created_at, updated_at
- `OrderStatusLog`
  - order (FK)
  - from_status, to_status
  - changed_by (FK User)
  - note
  - changed_at
- `OrderRating` (optional)
  - order, rating, comment

## 6.6 logistics
- `Vehicle`
  - plate_number
  - vehicle_type
  - capacity_kg
  - is_active
- `Driver`
  - name, phone, license_no, is_active
- `Trip`
  - dispatcher (FK User)
  - vehicle (FK Vehicle)
  - driver (FK Driver)
  - scheduled_date
  - status
- `Shipment`
  - order (FK Order)
  - trip (FK Trip, nullable until assigned)
  - eta
  - status
  - delay_reason (optional)
- `DeliveryProof`
  - shipment (FK)
  - photo
  - receiver_name
  - note
  - delivered_at

## 6.7 demand_board
- `DemandPost`
  - buyer (FK User)
  - product (FK Product)
  - target_quantity
  - budget_min, budget_max
  - required_by_date
  - location (FK Location)
  - status (`OPEN`, `CLOSED`)
- `DemandOffer`
  - demand_post (FK)
  - farmer (FK User)
  - offered_quantity
  - offered_price
  - note
  - status (`PENDING`, `ACCEPTED`, `REJECTED`)

---

## 7) API Plan (DRF Endpoints)

## 7.1 Auth
- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `GET /api/auth/me/`

## 7.2 Catalog + Location
- `GET /api/products/`
- `GET /api/categories/`
- `GET /api/locations/` (with province/city/barangay filters)

## 7.3 Listings
- `GET /api/listings/`
- `POST /api/listings/` (farmer)
- `GET /api/listings/{id}/`
- `PATCH /api/listings/{id}/`
- `POST /api/listings/{id}/clone/` (repeat listing)
- `GET /api/listings/farmer/mine/`
- `GET /api/listings/{id}/sell-fast-suggestion/`

## 7.4 Orders
- `POST /api/orders/` (buyer)
- `GET /api/orders/my/`
- `GET /api/orders/{id}/`
- `PATCH /api/orders/{id}/status/`
- `GET /api/orders/{id}/timeline/`

## 7.5 Logistics
- `GET /api/logistics/pending-assignment/`
- `POST /api/logistics/trips/`
- `POST /api/logistics/assign-shipment/`
- `POST /api/logistics/consolidate/`
- `POST /api/logistics/capacity-check/`
- `PATCH /api/logistics/shipments/{id}/status/`
- `POST /api/logistics/shipments/{id}/proof-of-delivery/`

## 7.6 Demand Board
- `GET /api/demand-posts/`
- `POST /api/demand-posts/`
- `POST /api/demand-posts/{id}/offers/`
- `PATCH /api/demand-offers/{id}/status/`

## 7.7 Dashboard
- `GET /api/dashboard/summary/`
- `GET /api/dashboard/farmer/overview/`
- `GET /api/dashboard/dispatcher/overview/`

---

## 8) Frontend Structure (React + Vite)

```text
frontend/
  src/
    main.jsx
    App.jsx
    api/
      axios.js
      authApi.js
      listingsApi.js
      ordersApi.js
      logisticsApi.js
      demandApi.js
      dashboardApi.js
    app/
      router.jsx
      store.js (optional)
    components/
      common/
        Navbar.jsx
        Sidebar.jsx
        ProtectedRoute.jsx
        StatusBadge.jsx
        LoadingSpinner.jsx
      listings/
      orders/
      logistics/
      demand/
      dashboard/
    pages/
      auth/
        LoginPage.jsx
        RegisterPage.jsx
      dashboard/
        AdminDashboard.jsx
        FarmerDashboard.jsx
        BuyerDashboard.jsx
        DispatcherDashboard.jsx
      listings/
        MarketplacePage.jsx
        FarmerListingsPage.jsx
        ListingFormPage.jsx
      orders/
        BuyerOrdersPage.jsx
        FarmerOrdersPage.jsx
        OrderDetailsPage.jsx
      logistics/
        DispatchBoardPage.jsx
        TripPlannerPage.jsx
        ShipmentTrackingPage.jsx
      demand/
        DemandBoardPage.jsx
      profile/
        ProfilePage.jsx
    hooks/
      useAuth.js
      useRoleGuard.js
    utils/
      formatCurrency.js
      date.js
      constants.js
    styles/
      globals.css
```

---

## 9) UI Pages (Prototype Final List)

1. Login/Register  
2. Marketplace Listings  
3. Farmer Listings Manager  
4. Buyer Orders  
5. Order Details + Timeline  
6. Dispatcher Board  
7. Trip/Consolidation Planner  
8. Demand Board  
9. Role-Based Dashboards  
10. Profile Page

---

## 10) Dynamic Behaviors to Demonstrate

- Auto-calculate total order cost (`qty x unit_price`)
- Listing quantity auto-decreases after order confirmation
- Capacity checker warning before assigning trip
- Timeline logs every status update
- Dashboard cards refresh from DB data
- Sell-fast badge toggles based on availability window
- Dependent location dropdowns (Province → City → Barangay)

---

## 11) Security + Validation (Prototype Minimum)

- JWT auth + token refresh
- Role-based permissions on endpoints
- Server-side validation for quantity/price/status transitions
- CORS config for frontend domain
- Basic rate limit (optional)
- Image upload validation (type + max size)

---

## 12) Development Milestones (Simple)

## Week 1
- Project setup (frontend/backend)
- Auth + role permissions
- Catalog + locations seed data

## Week 2
- Listings + marketplace
- Order placement + status transitions
- Timeline logging

## Week 3
- Logistics dispatch + trip consolidation + capacity check
- Proof of delivery
- Dashboard + demand board
- Final testing and demo script

---

## 13) Testing Checklist (Manual QA)

- [ ] User can register/login by role
- [ ] Farmer can create listing with grade + photo
- [ ] Buyer can filter and place order
- [ ] Order status updates follow valid sequence
- [ ] Dispatcher can assign shipment and update statuses
- [ ] POD upload works and marks delivered
- [ ] Demand post and offers work
- [ ] Dashboard totals reflect latest actions
- [ ] Unauthorized roles are blocked from restricted endpoints

---

## 14) Seed Data Plan (for Demo)

Create demo accounts:
- 2 Farmers
- 2 Buyers
- 1 Dispatcher
- 1 Admin

Seed:
- 10 Products
- 20 Listings across multiple locations
- 8 Orders in mixed statuses
- 3 Trips with shipments
- 5 Demand posts

---

## 15) Future Upgrades After Prototype

- Real-time WebSocket updates
- E-payment integration (GCash/Bank)
- Map-based route optimization
- SMS notifications
- Multi-language (English/Filipino)
- Advanced analytics forecasting

---

## 16) Quick Start Commands

## Backend
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install django djangorestframework djangorestframework-simplejwt django-cors-headers pillow
django-admin startproject config .
python manage.py startapp users
python manage.py startapp locations
python manage.py startapp catalog
python manage.py startapp listings
python manage.py startapp orders
python manage.py startapp logistics
python manage.py startapp demand_board
python manage.py startapp dashboard

python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Frontend
```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install axios react-router-dom
npm run dev
```

---

## 17) Final Notes

This plan is intentionally **prototype-first**:
- Functional end-to-end flow
- Minimal complexity
- Unique features that are demo-friendly
- Easy to extend into production architecture later

You can now start implementation module by module without overengineering.