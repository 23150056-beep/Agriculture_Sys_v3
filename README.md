# Agriculture Sys v3

A full-stack agriculture distribution platform prototype with role-based workflows for admins, farmers, buyers, and dispatchers.

## Tech Stack

- Frontend: React + Vite + React Router + Axios
- Backend: Django + Django REST Framework + JWT
- Database: SQLite
- Deployment: GitHub Pages (frontend), GitHub Actions workflow

## Core Modules

- Authentication (JWT + demo mode for GitHub Pages)
- Catalog and locations
- Listings and marketplace
- Orders (buyer and farmer flows)
- Logistics (dispatch board and shipment tracking)
- Demand board
- Role-based dashboards

## Dynamic UI Features Implemented

- Command palette (Ctrl/Cmd + K)
- Notification center (live, role-aware)
- Saved views (local storage) for key pages
- Auto-refresh badge with last updated timestamp
- Drilldown dashboard charts to filtered lists
- Density toggle (Cozy/Compact)
- Inline quick edit (farmer listings)
- Bulk actions (farmer orders status updates)
- Export Center (CSV export of currently filtered rows)

## Live Demo (GitHub Pages)

Frontend is deployed via GitHub Actions to GitHub Pages.

- Repository: https://github.com/23150056-beep/Agriculture_Sys_v3
- Expected live URL: https://23150056-beep.github.io/Agriculture_Sys_v3/

### GitHub Pages Login Note

Because GitHub Pages hosts a static frontend, the app uses demo-mode auth on github.io.

- Use any demo account username from DEMO_ACCOUNTS.md
- Default password: demo12345

## Local Development

### 1) Frontend

From project root:

```bash
npm install
npm run dev
```

Frontend runs at:

- http://localhost:5173

### 2) Backend

From backend folder:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo --reset
python manage.py runserver
```

Backend API base:

- http://127.0.0.1:8000/api/

## Demo Accounts

See full list in DEMO_ACCOUNTS.md.

Default password for all demo accounts:

- demo12345

## Scripts

From project root:

```bash
npm run dev
npm run build
npm run lint
```

From backend folder:

```bash
python manage.py test apps.orders apps.logistics
```

## Deployment Workflow

The GitHub Actions workflow at .github/workflows/deploy-pages.yml builds and deploys the frontend to GitHub Pages on every push to main.

## Notes

- Frontend API defaults to http://127.0.0.1:8000/api unless VITE_API_BASE_URL is provided.
- Vite base path is auto-adjusted in GitHub Actions for repository pages deployment.
