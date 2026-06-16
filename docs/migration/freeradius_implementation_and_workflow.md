# PHPMixBill System Workflow & FreeRADIUS Implementation Document

This document provides a comprehensive technical breakdown of how **FreeRADIUS** is integrated with the PHPMixBill system, along with the complete operational workflow of the application from request routing to back-end AAA authentication and automated scheduling.

---

## 1. FreeRADIUS Database Integration Details

Instead of exchanging network packets directly between PHPMixBill and FreeRADIUS, the system implements a **Shared Database Model**. Both systems connect to the same MariaDB/MySQL database (`nalrd`).

```
 +----------------------------------+          +----------------------------------+
 |            PHPMixBill            |          |            FreeRADIUS            |
 |         (Web Application)        |          |           (AAA Server)           |
 +-----------------+----------------+          +----------------+-----------------+
                   |                                            |
                   | Writes Credentials,                        | Queries Credentials
                   | Profiles, Validity, Limits                 | & Logs Session State
                   |                                            |
                   +-------------------> [ MySQL DB ] <---------+
                                          (Shared 'nalrd')
                                                 ^
                                                 | Authenticates & Logs
                                                 v
                                       +------------------+
                                       |  MikroTik Router |
                                       |   (NAS Client)   |
                                       +------------------+
```

### 1.1. Schema Tables Managed by PHPMixBill

#### A. `radcheck` (Authentication Check Attributes)
PHPMixBill inserts user credentials, validity durations, and quota limits directly into this table:
* **`Cleartext-Password`**: Stores the raw client password or voucher code.
* **`User-Profile`**: Maps the client to their purchased plan name (e.g., ` Namche_24H`).
* **`Expire-After`**: Stores the validity period in seconds (e.g., `$validity * 24 * 60 * 60`). The RADIUS server tracks the duration starting from the user's first login and denies access once it expires.
* **`Total-Volume-Limit`**: Enforces a total data cap (upload + download) in bytes (e.g., `$data_usage_gb * 1024 * 1024 * 1024`).
* **`Daily-Quota-Limit`**: Imposes a daily reset quota in bytes.

#### B. `radreply` (Authorization Reply Attributes)
Dictates attributes returned to the MikroTik NAS upon successful authentication:
* **`Mikrotik-Rate-Limit`**: Sent in format `rate_up` + `M/` + `rate_down` + `M` (e.g., `5M/10M`). Dictates the dynamic speed queue limit assigned to the user on the router.

#### C. `radusergroup` (Group Assignment Mapping)
Assigns plans to bandwidth control profiles:
* **`username`**: Set to the Plan Profile Name (e.g., ` Namche_24H`).
* **`groupname`**: Set to the corresponding Bandwidth Profile Name (e.g., `5Mbps`).
* **`priority`**: Set to `1`.
* *FreeRADIUS uses this table to resolve plan-specific group profiles.*

#### D. `radacct` (RADIUS Session Accounting)
Populated automatically by FreeRADIUS using accounting packets (`Accounting-Request`) from the MikroTik router. PHPMixBill queries this table for:
* **Data Volume Auditing**: Computes total usage using SQL aggregations:
  * Download: `SUM(radacct.acctinputoctets)`
  * Upload: `SUM(radacct.acctoutputoctets)`
* **Active Connections & MAC Throttling**: Monitors session start times (`acctstarttime`) and device MAC addresses (`callingstationid`).
* **MAC Binding Lock**: Re-assigns MAC address lock directly:
  ```sql
  UPDATE radacct SET callingstationid = '$new_mac' WHERE username = '$username';
  ```

---

## 2. Complete System Workflow

The system operates across three separate planes: Request/Routing (Web), Control Plane (Database/API), and AAA Data Plane (RADIUS).

### 2.1. Request Lifecycle & Routing (MVC Web Plane)
A client or admin HTTP request follows this pathway:

```mermaid
graph TD
    A[Client Request] --> B[index.php]
    B --> C[system/boot.php]
    C --> D[Initialize Session & Load config.php]
    D --> E[Initialize Idiorm ORM connection]
    E --> F[Load configurations from tbl_appconfig]
    F --> G[Initialize Smarty & Load Language pack]
    G --> H[Register autoloader spl_autoload_register]
    H --> I[Parse route parameter _route]
    I --> J{Does controller exist in system/controllers/?}
    J -- Yes --> K[Include system/controllers/{handler}.php]
    J -- No --> L[Render Error & Exit]
    K --> M[Process controller logic & query Database]
    M --> N[Assign template variables & Render Smarty Template]
    N --> O[Send Response to Client]
```

1. **Authentication Gates**:
   * **`_auth()`**: Directs standard users to client portal login.
   * **`_admin()`**: Enforces administrative login; filters based on role types (`Admin`, `Sales`, `PPPOE`, `POS`, `Regular`).

---

### 2.2. Control Plane & Administration Workflow
How packages are configured, purchased, and synchronized:

#### A. Service Plan Creation (`system/controllers/services.php`)
1. Admin creates a bandwidth speed limit in `tbl_bandwidth`.
2. Admin configures a Hotspot/PPPoE service plan in `tbl_plans`.
3. In RADIUS mode, the system automatically writes a row to `radusergroup` linking the plan profile name (`username` field) with the bandwidth profile group name (`groupname` field).

#### B. Voucher Batch Printing (`system/controllers/hotspot.php`)
1. Admin or POS Distributor specifies the plan, quantity, and batch number.
2. The system calculates the invoice cost: `Total Bill = Plan Price * Voucher Quantity`.
3. If generated by a POS Agent, the system checks their `wallet` balance. If `available_balance >= Total Bill`:
   * Balance is adjusted: `available_balance` is decremented and `credit_balance` is incremented.
4. Loop creates each voucher:
   * Generates a unique code (`$code`) using random hash generation.
   * Inserts the code into `tbl_voucher`.
   * Inserts the voucher as a new client record in `tbl_customers` (username/password = `$code`).
   * Writes the credentials to `radcheck` (attributes: `Cleartext-Password`, `User-Profile`, `Expire-After`, `Total-Volume-Limit`, `Daily-Quota-Limit`).
   * Writes speed profiles to `radreply` (`Mikrotik-Rate-Limit`).
5. Generates the PDF or Smarty view for voucher prints.

#### C. Account Recharge (`system/controllers/prepaid.php`)
1. Admin or POS Agent initiates a manual recharge for an existing customer.
2. Verifies the Agent's balance (if POS) and updates the ledger.
3. Inserts or updates the active recharge row in `tbl_user_recharges` with `status = 'on'`, a current timestamp, and calculated expiration date (`expiration`).
4. Generates a billing invoice in `tbl_transactions`.
5. Updates the expiration parameters in `tbl_customers`.
6. If RADIUS mode is enabled (indicated by router ID `0`), the system populates the corresponding rows in `radcheck` and `radreply` with the credentials, expiration, volume quota limits, and speed profiles.

---

### 2.3. AAA Data Plane Workflow (FreeRADIUS & Router)
When a client connects to the wireless network or PPPoE tunnel:

```
  Client           MikroTik (NAS)               FreeRADIUS               Database (nalrd)
    |                    |                           |                           |
    |-- Auth Request --->|                           |                           |
    |   (Credentials)    |--- Access-Request ------->|                           |
    |                    |    (User, Pass, MAC)      |--- Query Cleartext-Pass ->|
    |                    |                           |<-- Cleartext-Password ----|
    |                    |                           |                           |
    |                    |                           |--- Query User Attributes->|
    |                    |                           |<-- Rate/Volume limits ----|
    |                    |<-- Access-Accept ---------|                           |
    |                    |    (Throttling Queue)     |                           |
    |<-- DHCP / Connected|                           |                           |
    |                    |                           |                           |
    |                    |--- Accounting-Request --->|                           |
    |                    |    (Session Start)        |--- Write Accounting ----->|
    |                    |                           |    Record (radacct)       |
```

1. **Connection Initiated**: Client inputs credentials on the login portal.
2. **Access-Request**: MikroTik Router package sends an access request with client username, password, and MAC address.
3. **Authentication**: FreeRADIUS reads `radcheck` to match the passwords.
4. **Authorization & Throttling**: FreeRADIUS fetches group profiles and reply attributes from `radusergroup` and `radreply`, and transmits the `Access-Accept` back to MikroTik alongside the speed limits (`Mikrotik-Rate-Limit`).
5. **Accounting Logging**: MikroTik fires off `Accounting-Request` (Start/Stop) updates. FreeRADIUS writes session details, durations, IP allocations, and byte transfer logs directly to `radacct`.

---

### 2.4. Direct RouterOS API Workflow (Fallback/Hybrid)
If a router configuration uses local database synchronization or immediate session tear-downs (hybrid configuration):
* **API Socket connection**: PHPMixBill creates a direct raw TCP socket stream to MikroTik's API port (`8728` / `8729` SSL).
* **Direct Provisioning**: Performs provisioning commands:
  * Hotspot: `/ip/hotspot/user/add`
  * PPPoE: `/ppp/secret/add`
* **Session Teardown**: Deletes active dynamic sessions to kick a client offline and enforce updates:
  * Hotspot: `/ip/hotspot/active/remove`
  * PPPoE: `/ppp/active/remove`

---

### 2.5. Expiration Scheduler Engine (`system/cron.php`)
A background cron job runs every minute to manage package lifecycles:
1. Queries all rows in `tbl_user_recharges` where `status = 'on'`.
2. Compares the current local server timestamp against the expiration timestamp (`expiration` date + `time`).
3. If the plan has expired:
   * **For Hotspot**: Connects to the MikroTik router via API, sets the account `limit-uptime` to `00:00:05`, and removes active sessions (kicking the user offline).
   * **For PPPoE**: Connects to the MikroTik router via API, disables the secret profile, and terminates the active PPP tunnel session.
   * Updates the status in `tbl_user_recharges` to `'off'`.
   * *Note: In RADIUS mode, FreeRADIUS's sql module automatically denies authentication upon expiration via `Expire-After` or `Total-Volume-Limit` attributes. The cron job synchronizes this state back inside the application database.*
