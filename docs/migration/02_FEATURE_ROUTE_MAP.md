# Feature / Route Map

Legacy `index.php?_route=controller/action` → Laravel routes + Inertia React pages.
All web routes are behind `auth`; roles enforced by the `role:` middleware / policies.

## Web (Inertia)

| Feature | Route name(s) | Controller | Page(s) | Access |
|---|---|---|---|---|
| Login (by username) | `login` | Auth\AuthenticatedSessionController | `Auth/Login` | guest |
| Dashboard | `dashboard` | DashboardController | `Dashboard` | staff |
| Customers | `customers.*` (+`customers.bulk-action`) | CustomerController | `Customers/{Index,Create,Edit,Show}` | admin, sales |
| Recharge | `recharge.create`,`recharge.store` | RechargeController | `Recharge/Create` | admin, sales |
| Vouchers | `vouchers.index/create/store/destroy` | VoucherController | `Vouchers/{Index,Generate}` | admin, sales |
| Plans | `plans.*` | PlanController | `Plans/{Index,Form}` | admin |
| Bandwidth | `bandwidth.*` | BandwidthController | `Bandwidth/{Index,Form}` | admin |
| Routers | `routers.*` | RouterController | `Routers/{Index,Form}` | admin |
| Pools | `pools.*` | PoolController | `Pools/{Index,Form}` | admin |
| Reports | `reports.index` | ReportController | `Reports/Index` | admin, sales |
| Wallet | `wallet.index`,`wallet.load` | WalletController | `Wallet/Index` | admin |
| Messages | `messages.*` | MessageController | `Messages/{Index,Create,Show}` | staff |
| Monitor NAS | `monitor.sessions`,`monitor.logs` | MonitorController | `Monitor/{Sessions,Logs}` | admin |
| Profile | `profile.*` | ProfileController | `Profile/Edit` | staff |

Public staff self-registration is **disabled** (operators are admin-created).

## Sidebar ↔ legacy nav

`Home`, `Customer ▸ User Details`, `Plan ▸ Plans/Bandwidth`, `Hotspot ▸ Vouchers`, `NAS ▸ Routers/IP Pools`, `Monitor NAS ▸ Active Sessions/Auth Logs`, `Wallet`, `Reports`, `Messages`, `Administration` (Users/Settings/Localization — placeholders for a later pass).

## JSON API (`/api/v1`, Sanctum)

| Method | Endpoint | Action |
|---|---|---|
| POST | `/login` | issue token (throttled 10/min) |
| GET | `/me` | current user |
| POST | `/logout` | revoke current token |
| GET | `/customers`, `/customers/{id}` | list / show (CustomerService) |
| GET | `/plans` | list plans |
| POST | `/customers/{id}/recharge` | recharge (RechargeService) |

API controllers are thin wrappers over the same services as the web side.
