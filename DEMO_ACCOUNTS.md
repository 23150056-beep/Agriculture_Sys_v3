# Demo Accounts

These accounts are created by running:

```bash
cd backend
python manage.py seed_demo --reset
```

Default password for all demo users:

- `demo12345`

## Available Accounts

| Role | Username | Full Name | Email |
| --- | --- | --- | --- |
| Admin | `demo_admin` | Demo Admin | demo_admin@example.com |
| Farmer | `demo_farmer_1` | Demo Farmer One | demo_farmer_1@example.com |
| Farmer | `demo_farmer_2` | Demo Farmer Two | demo_farmer_2@example.com |
| Buyer | `demo_buyer_1` | Demo Buyer One | demo_buyer_1@example.com |
| Buyer | `demo_buyer_2` | Demo Buyer Two | demo_buyer_2@example.com |
| Dispatcher | `demo_dispatcher` | Demo Dispatcher | demo_dispatcher@example.com |

## Notes

- If you run `seed_demo` with a custom password (for example `--password mypass123`), that custom password becomes the password for all accounts.
- Re-running `seed_demo --reset` refreshes demo data and accounts.
