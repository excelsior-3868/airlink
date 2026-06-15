# Integrations — FreeRADIUS & RouterOS

The legacy deployment is **RADIUS-centric** (the dump has ~40k `radcheck`, ~10k
`radreply`, ~25k `radpostauth` rows; `tbl_routers` is empty). Recharge therefore
provisions FreeRADIUS by default; direct RouterOS is used when a plan targets a
named router.

## FreeRADIUS (shared-DB model) — `App\Services\Provisioning\RadiusService`

On recharge, `provision(Customer, Plan, ?plainPassword)` writes (mirrors legacy `prepaid.php`):

**radcheck**
| attribute | value |
|---|---|
| `Cleartext-Password` | plaintext (voucher code / admin-entered; falls back to username) |
| `User-Profile` | plan name |
| `Expire-After` | `validity × 86400` (seconds) |
| `Total-Volume-Limit` | `data_usage_gb × 1024³` (bytes) |

**radreply**
| attribute | value |
|---|---|
| `Mikrotik-Rate-Limit` | `{rate_up}M/{rate_down}M` |

`deprovision(username)` removes the user's radcheck + radreply rows (used on expiry).

> **Migration note:** new customer passwords are bcrypt-hashed and cannot feed
> `Cleartext-Password`. The recharge flow supplies the plaintext (voucher code or
> admin-entered RADIUS password); default is the username.

## RouterOS — `App\Services\Provisioning\RouterOSService`

Uses `evilfreelancer/routeros-api-php`. `provision()` creates/updates a hotspot
user or PPPoE secret with profile + rate-limit + uptime; `deprovision()` disables
the entry and kills the active session. `Router::$password` is stored with the
`encrypted` cast. A `static $clientFactory` seam allows mocking in tests.

## Expiry — `airlink:expire-recharges` (replaces `cron.php`)

Scheduled every minute (`routes/console.php`). For each `recharges.status='on'`
past `expiration` (respecting the recorded time-of-day): de-provisions
(RADIUS rows removed, or RouterOS user disabled + session killed) and sets
`status='off'`. RouterOS errors are caught/logged so one offline router doesn't
stall the batch.

## NAS / RADIUS clients

MikroTik routers are RADIUS clients via the `nas` table (`read_clients = yes` in
FreeRADIUS). Manage secrets there rather than flat files. Monitoring reads
`radacct` (online = `acctstoptime IS NULL`) and `radpostauth` (auth results).
