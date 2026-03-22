# Demo Accounts

Use these credentials to access role-based flows quickly during demos.

## Create/Refresh Accounts

Run this command from the backend folder:

```bash
python manage.py seed_demo --reset
```

## Default Password

All demo users share the same default password:

- demo12345

## Available Accounts

| Role | Username | Full Name | Email |
| --- | --- | --- | --- |
| Admin | demo_admin | Demo Admin | demo_admin@example.com |
| Manager | demo_manager_1 | Demo Manager One | demo_manager_1@example.com |
| Manager | demo_manager_2 | Demo Manager Two | demo_manager_2@example.com |
| Distributor | demo_distributor_1 | Demo Distributor One | demo_distributor_1@example.com |
| Distributor | demo_distributor_2 | Demo Distributor Two | demo_distributor_2@example.com |

## Where To Use These Accounts

- Local full-stack run: use these accounts after running seed_demo.
- GitHub Pages demo: use these same usernames and password in demo-mode login.

## Notes

- If you run seed_demo with a custom password (for example: --password mypass123), that custom password replaces demo12345 for all accounts.
- Re-running seed_demo --reset refreshes demo data and account records.
