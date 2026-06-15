# Phase Plan & Status

All phases delivered, each committed, with feature tests. Run `php artisan test` (63 green).

| Phase | Scope | Key artifacts | Tests |
|---|---|---|---|
| 0 | Scaffold | Laravel 13 + Inertia/React 19/TS + Tailwind v4 + ShadCN; MySQL; legacy dump imported | build |
| 1 | Schema + auth + data migration | 16 migrations + `rad*`; Eloquent models; `LegacyEloquentUserProvider`; `airlink:migrate-legacy`; Dashboard | LegacyPasswordTest |
| 2 | Customers | CustomerService, policy, CRUD + history, legacy action bar (Activate/Deactivate/Disable bulk, Search/Search By ID) | CustomerManagementTest |
| 3 | Plans/Bandwidth/Routers/Pools | admin CRUD, FormRequests, encrypted router secret, CrudIndex/Form | NetworkConfigTest |
| 4 | Vouchers + Recharge | VoucherService, RechargeService, RadiusService, RouterOSService, `airlink:expire-recharges` scheduler | VoucherRechargeTest |
| 5 | Reports + Wallet + Messaging | ReportController, WalletService, MessageController | ReportsWalletMessagingTest |
| 6 | Monitoring + gates | MonitorController (radacct/radpostauth), SecurityHeaders; audits | MonitoringTest |
| 7 | JSON API | Sanctum, `/api/v1`, thin controllers over shared services | ApiTest |

## Acceptance checks per phase

- **P1:** migrated `admin`/`123456` logs in and is rehashed to bcrypt.
- **P2:** search/paginate over 10k customers; bulk status; delete cascades recharges.
- **P3:** plan↔bandwidth wiring; router secret encrypted at rest (raw column ≠ plaintext).
- **P4:** recharge writes the exact RADIUS attributes (`5M/10M`, `Expire-After`, `Total-Volume-Limit`); expiry flips status + clears RADIUS.
- **P5:** report totals sum transactions in range; wallet load accumulates; message read-on-open.
- **P6:** only online sessions listed; admin-only; security headers present.
- **P7:** token login (+legacy upgrade), full recharge via API.

## Local commands

```sh
php artisan migrate:fresh --seed
php artisan airlink:migrate-legacy --fresh      # import legacy data
php artisan airlink:expire-recharges --dry-run  # preview expiries
php artisan test
npm run dev      # + php artisan serve
```
