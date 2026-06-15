# Airlink Migration Documentation

PHPMixBill (legacy PHP) → Laravel 13 + Inertia + React 19 + Tailwind v4 + ShadCN, MySQL.

| Doc | Contents |
|---|---|
| [00_OVERVIEW.md](00_OVERVIEW.md) | Stack, architecture, glossary, status |
| [01_SCHEMA_MAPPING.md](01_SCHEMA_MAPPING.md) | Legacy→new tables, data migration, password handling |
| [02_FEATURE_ROUTE_MAP.md](02_FEATURE_ROUTE_MAP.md) | Web + API routes ↔ legacy features |
| [03_INTEGRATIONS.md](03_INTEGRATIONS.md) | FreeRADIUS + RouterOS provisioning, expiry |
| [04_PHASE_PLAN.md](04_PHASE_PLAN.md) | Phase-by-phase status + acceptance checks |
| [05_SETUP_AND_DEPLOY.md](05_SETUP_AND_DEPLOY.md) | Local dev + fresh-VPS runbook (FreeRADIUS, queue, deploy) |
| [06_SECURITY.md](06_SECURITY.md) | OWASP Top 10 mapping + hardening checklist |
| `legacy-introspection/core_schema.sql` | Real DDL introspected from `nalrd_backup.sql` |
