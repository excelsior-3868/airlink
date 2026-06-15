# Schema Mapping (legacy `tbl_*` → modernized)

Authoritative source: **`nalrd_backup.sql`** (MariaDB dump). The live schema drifted
from the installer SQL — extra columns/tables were introspected from the dump
(see `legacy-introspection/core_schema.sql`). Migrations are finalized against the dump.

## Table map

| Legacy table | New table / Model | Notes |
|---|---|---|
| `tbl_users` | `users` / `User` | login by **username**; `user_type`→`role` enum (admin/sales/regular/pos); `crypt()`→bcrypt on first login; `legacy_id` kept |
| `tbl_customers` | `customers` / `Customer` | own auth guard; columns incl. `profile`,`batch`,`generated_by`,`validity` preserved |
| `tbl_appconfig` | `settings` / `Setting` | key/value, cached |
| `tbl_language` | `languages` / — | reference |
| `tbl_bandwidth` | `bandwidths` / `Bandwidth` | rate up/down + unit enums |
| `tbl_routers` | `routers` / `Router` | `password` **encrypted** cast; +`api_port`,`use_ssl` |
| `tbl_pool` | `pools` / `Pool` | |
| `tbl_plans` | `plans` / `Plan` | `id_bw`→FK `bandwidth_id`; `typebp`→`bandwidth_policy`; `routers`→`router_name`; incl. `access_control`,`data_usage_gb`,`daily_quota` |
| `tbl_voucher` | `vouchers` / `Voucher` | `id_plan`→FK `plan_id`; `created_date`→`issued_on` |
| `tbl_user_recharges` | `recharges` / `Recharge` | `customer_id` (legacy varchar) kept as `customer_ref` + nullable FK `customer_id`; `namebp`→`plan_name`; index on `(status,expiration)` |
| `tbl_transactions` | `transactions` / `Transaction` | billing ledger |
| `wallet` | `wallets` / `Wallet` | seller/POS credit ledger |
| `walletCompany` | `company_wallet` / `CompanyWallet` | |
| `tbl_message` | `messages` / `Message` | `status`→`is_read` bool; `date`→`sent_at` |
| `tbl_logs` | `activity_logs` / `ActivityLog` | |
| `tbl_ip_binding` | `ip_bindings` / `IpBinding` | |
| `radcheck`/`radreply`/`radusergroup`/`radacct`/`radpostauth`/`radgroupcheck`/`radgroupreply`/`nas` | **kept verbatim** / `RadCheck`,`RadReply`,`RadUserGroup`,`RadAcct`,`RadPostAuth` | FreeRADIUS owns the schema — names + columns unchanged |

Every migrated row keeps its `legacy_id` for FK remapping and audit.

## Data migration

`php artisan airlink:migrate-legacy [--fresh] [--dry-run] [--with-radius]`

- Reads the imported legacy DB via the `legacy` connection (configure `DB_LEGACY_*` in `.env`).
- Maps `bandwidth`/`plan`/`customer` legacy ids → new ids for FK remapping.
- Passwords copied **verbatim**; upgraded to bcrypt on first login.
- Duplicate customer usernames are disambiguated (`<code>_dup<id>`) to satisfy the unique index.
- `--dry-run` prints source vs target row counts.

## Password handling

`App\Auth\LegacyEloquentUserProvider` verifies legacy MD5-crypt (`$1$…`), DES-crypt, and plaintext passwords, then re-saves as bcrypt on the first successful login (web **and** API). The `password` cast on `User`/`Customer` is `hashed`, so new writes are always bcrypt.
