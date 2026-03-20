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
| Farmer | demo_farmer_1 | Demo Farmer One | demo_farmer_1@example.com |
| Farmer | demo_farmer_2 | Demo Farmer Two | demo_farmer_2@example.com |
| Buyer | demo_buyer_1 | Demo Buyer One | demo_buyer_1@example.com |
| Buyer | demo_buyer_2 | Demo Buyer Two | demo_buyer_2@example.com |
| Dispatcher | demo_dispatcher | Demo Dispatcher | demo_dispatcher@example.com |

## Where To Use These Accounts

- Local full-stack run: use these accounts after running seed_demo.
- GitHub Pages demo: use these same usernames and password in demo-mode login.

## Notes

- If you run seed_demo with a custom password (for example: --password mypass123), that custom password replaces demo12345 for all accounts.
- Re-running seed_demo --reset refreshes demo data and account records.
