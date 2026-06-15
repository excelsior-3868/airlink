# Airlink Migration — Overview

PHPMixBill (legacy PHP MikroTik ISP billing panel) re-platformed to a modern stack.

## Target stack (built)

| Layer | Technology |
|---|---|
| Backend | **Laravel 13** (PHP 8.3+) |
| Frontend | **Inertia.js + React 19 + TypeScript** (monolith) |
| UI | **Tailwind v4 + ShadCN/ui**, lucide-react icons, sonner toasts |
| Build | Vite 8 |
| Database | **MySQL** (utf8mb4) |
| Auth | Session (web) + **Sanctum tokens** (API); legacy `crypt()` → bcrypt rehash-on-login |
| RouterOS | `evilfreelancer/routeros-api-php` |
| RADIUS | FreeRADIUS shared-DB model (`rad*` tables kept legacy-named) |

## Architecture

```
Web (React) ── Inertia ──┐
                          ├─> thin Controllers ─> SERVICE LAYER ─> Eloquent ─> MySQL
Flutter (P7) ── JSON API ─┘     CustomerService, VoucherService, RechargeService,
   (Sanctum tokens)             WalletService, RadiusService, RouterOSService
                                       │
                                       └─ Scheduler: airlink:expire-recharges (replaces cron.php)
```

Both web and API controllers delegate to the **same service layer** — no business-logic duplication, so the Flutter app reuses everything.

## Domain glossary

- **Hotspot / PPPoE** — the two MikroTik access types plans target.
- **Voucher** — a prepaid code; generation also pre-creates a customer whose username equals the code (legacy behaviour).
- **Recharge** — activating a plan for a customer: writes recharge + transaction rows, updates the customer, and provisions FreeRADIUS (or a RouterOS device).
- **NAS** — Network Access Server (a MikroTik router) that authenticates against RADIUS.

## Phase roadmap (all delivered)

0. Scaffold · 1. Schema/auth/data-migration/dashboard · 2. Customers · 3. Plans/Bandwidth/Routers/Pools · 4. Vouchers/Recharge/RADIUS-RouterOS/scheduler · 5. Reports/Wallet/Messaging · 6. Monitoring/security gates · 7. JSON API.

See `04_PHASE_PLAN.md` for per-phase detail, `01_SCHEMA_MAPPING.md` for data, `02_FEATURE_ROUTE_MAP.md` for routes, `03_INTEGRATIONS.md` for RADIUS/RouterOS, `05_SETUP_AND_DEPLOY.md` for the VPS runbook, `06_SECURITY.md` for OWASP.

## Verification snapshot

- **63 feature tests green** (`php artisan test`), `composer audit` + `npm audit` report 0 vulnerabilities, production build clean.
- Data imported from `nalrd_backup.sql`: 10,151 customers, 8,151 vouchers, 6 staff, RADIUS tables.
