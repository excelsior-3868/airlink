# Security (OWASP Top 10)

How the app addresses each category, and the per-phase checks.

| # | Category | Controls in this app |
|---|---|---|
| A01 | Broken Access Control | `role:` middleware + Policies (CustomerPolicy); deny-by-default; all mutations are POST/PUT/DELETE (no GET side-effects); API gated by Sanctum tokens |
| A02 | Cryptographic Failures | bcrypt password hashing (legacy `crypt()` upgraded on login); router/RADIUS secrets via `encrypted` cast (AES-256/`APP_KEY`); HSTS on HTTPS; secrets only in `.env` |
| A03 | Injection | Eloquent/query-builder bindings (no string-concatenated SQL); React auto-escapes; RouterOS via typed query lib |
| A04 | Insecure Design | centralized service-layer validation + authorization; rate-limited auth |
| A05 | Security Misconfiguration | `SecurityHeaders` middleware (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS); `APP_DEBUG=false` in prod |
| A06 | Vulnerable Components | pinned `composer.lock`/`package-lock.json`; `composer audit` + `npm audit` clean; dropped the abandoned PEAR2/legacy Mikrotik class |
| A07 | Auth Failures | login throttling (web 5/min, API 10/min), session regeneration, inactive/non-staff rejected, short-lived API tokens |
| A08 | Integrity Failures | CSRF on web forms (Inertia automatic); validated inputs via FormRequests |
| A09 | Logging & Monitoring | `activity_logs` table; RADIUS auth log view (radpostauth) |
| A10 | SSRF | router hosts come from the admin-managed `routers`/`nas` tables, not user-supplied URLs |

## Per-phase gate

Each phase: `composer audit` + `npm audit` clean, authorization tests (unauthorized → 403),
CSRF + HTTPS-only cookies, encrypted secrets, no secrets in git.

## Production hardening checklist

- [ ] `APP_DEBUG=false`, `APP_ENV=production`
- [ ] Force-change the seeded `admin` password
- [ ] HTTPS enforced (certbot); `SANCTUM_STATEFUL_DOMAINS` set for the web SPA
- [ ] DB user scoped to the app schema; separate RADIUS DB grant
- [ ] Firewall: 443 public; RADIUS 1812/1813 from NAS IPs; RouterOS API egress only
