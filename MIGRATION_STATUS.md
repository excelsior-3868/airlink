# Airlink Migration — Status Summary

**Project:** Re-platform PHPMixBill (legacy PHP MikroTik ISP billing panel) → modern stack.
**Repo:** `/Users/subin/Github/airlink-laravel` (new, local). Legacy app at `/Users/subin/Github/Airlink/nalrd` is reference-only.
**As of:** 2026-06-15 · **Status:** all 7 phases + docs complete & committed (not yet pushed).

---

## Stack delivered

| Layer | Technology |
|---|---|
| Backend | Laravel 13 (PHP 8.3+) |
| Frontend | Inertia.js + React 19 + TypeScript (monolith) |
| UI | Tailwind v4 + ShadCN/ui, lucide-react, sonner |
| Build | Vite 8 |
| Database | MySQL (utf8mb4) |
| Auth | Session (web) + Sanctum tokens (API); legacy `crypt()` → bcrypt on first login |
| RouterOS | `evilfreelancer/routeros-api-php` |
| RADIUS | FreeRADIUS shared-DB model (`rad*` tables kept verbatim) |

**Health:** 63 feature tests green · `composer audit` + `npm audit` = 0 vulnerabilities · production build clean.

---

## What was built, phase by phase

### Phase 0 — Scaffold
Laravel 13 + Breeze (Inertia/React/TS), upgraded to React 19 + Tailwind v4 + Vite 8, ShadCN initialized. MySQL wired (`airlink`, `airlink_legacy`, `airlink_test`). Legacy `nalrd_backup.sql` imported into a scratch DB and the **real schema introspected** (found drift vs the installer SQL).

### Phase 1 — Schema · Auth · Data migration · Dashboard
- 16 modernized migrations + FreeRADIUS tables (`radcheck/radreply/radusergroup/radacct/radpostauth/radgroupcheck/radgroupreply/nas`).
- Eloquent models with casts/relations; `Setting` cache; `UserRole` enum.
- **`LegacyEloquentUserProvider`** — verifies legacy MD5-crypt/DES/plaintext passwords and rehashes to bcrypt on first login (web + API). Username-based staff login; separate `customer` guard.
- **`airlink:migrate-legacy`** command (`--fresh`/`--dry-run`/`--with-radius`) — imported **10,151 customers, 8,151 vouchers, 6 staff**, remapping FKs and de-duplicating usernames.
- Dashboard with live metrics. Verified: `admin`/`123456` logs in and upgrades to bcrypt.

### Phase 2 — Customers
`CustomerService` + `CustomerPolicy` + FormRequests; CRUD with server-side search/pagination over 10k rows; detail page with recharge/billing history. **Legacy "Manage Contact" parity:** row checkboxes, action bar (Add New / Change Password / Disable / Activate / Deactivate / Recharge / Change MAC with matching colours), Search + Search By ID, columns S.N./Username/Profile/Batch/Created_date/POS Owner. Bulk Activate/Deactivate/Disable wired.

### Phase 3 — Plans / Bandwidth / Routers / Pools
Admin-only CRUD for all four, matching legacy form fields. Router secrets stored **encrypted**. Shared `CrudIndex` + single `Form` page per module.

### Phase 4 — Vouchers · Recharge · Provisioning · Expiry
- `VoucherService` — md5 uppercase codes + a customer account per voucher (legacy behaviour).
- `RechargeService` — expiry = today + validity; writes recharge + `INV-#####` transaction; updates customer; provisions **FreeRADIUS** (`radcheck`: Cleartext-Password/User-Profile/Expire-After/Total-Volume-Limit; `radreply`: `{up}M/{down}M`) **or RouterOS**.
- `RadiusService` + `RouterOSService` (mockable).
- **`airlink:expire-recharges`** scheduled every minute — replaces legacy `cron.php`.

### Phase 5 — Reports · Wallet · Messaging
Revenue reports by date range/type/user; seller/POS credit ledger + company balance with load-credit; internal staff messaging (inbox/sent, compose, read-on-open).

### Phase 6 — Monitoring · Security gates
Live Monitor NAS: active sessions (`radacct`, online = no stop time) with NAS/framed IP, MAC, data in/out; auth logs (`radpostauth`). `SecurityHeaders` middleware (OWASP A05). Dependency audits clean.

### Phase 7 — JSON API (Sanctum) for Flutter
`/api/v1`: token login (+legacy upgrade), me, logout, customers list/show, plans, recharge. Thin controllers over the **same services** as the web side — zero logic duplication. Login throttled.

### Navigation & Docs
ShadCN sidebar mirrors the legacy nav. Full documentation in **`docs/migration/`** (overview, schema mapping, route map, RADIUS/RouterOS integrations, phase plan, fresh-VPS deploy runbook, OWASP security) + introspected legacy DDL.

---

## Commit history

```
fa115fa  Docs: migration documentation set
71777dc  Phase 7: JSON API (Sanctum) for Flutter readiness
b29757b  Phase 6: Live monitoring + security gates
a87b60c  Phase 5: Reports + Wallet + Messaging
01017ff  Phase 4: Vouchers + Recharge + RADIUS/RouterOS + expiry scheduler
96cef8b  Phase 3: Plans / Bandwidth / Routers / Pools
6a5727a  Sidebar layout + legacy customer-page parity
6063dfa  Customers list: match legacy columns
409291e  Phase 2: Customers module (CRUD + history)
ffda799  Phase 0-1: scaffold + schema + auth + legacy data migration
```

---

## Run it locally

```sh
cd /Users/subin/Github/airlink-laravel
php artisan migrate:fresh --seed
php artisan airlink:migrate-legacy --fresh    # import legacy data
npm run dev          # terminal 1
php artisan serve    # terminal 2 → http://127.0.0.1:8000
```
Login: **admin / 123456**. Tests: `php artisan test`.

---

## Not yet done (future work)

- Customer self-registration portal (voucher-gated).
- Administration sub-pages: Users / Settings / Localization (currently sidebar placeholders).
- PDF export of reports/invoices.
- Push to a git remote (none configured yet), then deploy to the fresh VPS per `docs/migration/05_SETUP_AND_DEPLOY.md`.
- Live RouterOS/FreeRADIUS integration test on the VPS (code is mockable & unit-tested; needs a real device/server).
