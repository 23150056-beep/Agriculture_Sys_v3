# Centralized Agriculture Distribution Prototype

This workspace now contains a base full-stack implementation from the project plan:

- Frontend: React + Vite
- Backend: Django + Django REST Framework + JWT auth
- Database: SQLite

## Project Structure

- `src/`: React app with role-based pages and API clients
- `backend/`: Django API with apps for users, locations, catalog, listings, orders, logistics, demand board, and dashboard

## Frontend Setup

1. Install dependencies:

```bash
npm install
```

2. Run development server:

```bash
npm run dev
```

## Backend Setup

1. Move into backend:

```bash
cd backend
```

2. Create virtual environment and activate:

```bash
python -m venv venv
venv\Scripts\activate
```

3. Install backend dependencies:

```bash
pip install -r requirements.txt
```

4. Run migrations and start server:

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py seed_demo --reset
python manage.py runserver
```

Run backend tests:

```bash
python manage.py test apps.orders apps.logistics
```

Demo login accounts created by `seed_demo`:

- `demo_admin`
- `demo_farmer_1`
- `demo_farmer_2`
- `demo_buyer_1`
- `demo_buyer_2`
- `demo_dispatcher`

Default password: `demo12345`

## Available API Base

- `http://127.0.0.1:8000/api/`
- Auth endpoints are under `http://127.0.0.1:8000/api/auth/`

## Notes

- Frontend API client is configured to use `http://127.0.0.1:8000/api`.
- This is a base prototype implementation; forms and workflows can be expanded module by module.
