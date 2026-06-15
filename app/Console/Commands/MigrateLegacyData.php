<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * One-time import of legacy PHPMixBill data (the `legacy` connection / nalrd_backup.sql)
 * into the modernized Airlink schema.
 *
 * Passwords are copied verbatim; LegacyEloquentUserProvider re-hashes them to bcrypt
 * on first successful login. Legacy ids are preserved in each table's `legacy_id`
 * column so foreign keys can be remapped.
 *
 *   php artisan airlink:migrate-legacy --dry-run
 *   php artisan airlink:migrate-legacy --fresh
 */
class MigrateLegacyData extends Command
{
    protected $signature = 'airlink:migrate-legacy
        {--fresh : Wipe and re-run all migrations before importing}
        {--dry-run : Report source/target row counts without writing}
        {--with-radius : Also copy the FreeRADIUS tables (radcheck/radreply/...)}';

    protected $description = 'Import legacy PHPMixBill data into the modernized schema';

    private const CHUNK = 1000;

    /** @var array<string,array<int,int>> legacy_id => new_id maps */
    private array $maps = [];

    public function handle(): int
    {
        $legacy = DB::connection('legacy');

        try {
            $legacy->getPdo();
        } catch (\Throwable $e) {
            $this->error('Cannot connect to the legacy database: '.$e->getMessage());

            return self::FAILURE;
        }

        if ($this->option('dry-run')) {
            return $this->reportCounts($legacy);
        }

        if ($this->option('fresh')) {
            $this->warn('Running migrate:fresh ...');
            $this->call('migrate:fresh', ['--force' => true]);
        }

        DB::transaction(function () use ($legacy) {
            $this->importSettings($legacy);
            $this->importLanguages($legacy);
            $this->importBandwidths($legacy);
            $this->importRouters($legacy);
            $this->importPools($legacy);
            $this->importPlans($legacy);
            $this->importUsers($legacy);
            $this->importCustomers($legacy);
            $this->importVouchers($legacy);
            $this->importRecharges($legacy);
            $this->importTransactions($legacy);
            $this->importWallets($legacy);
            $this->importCompanyWallet($legacy);
            $this->importMessages($legacy);
            $this->importLogs($legacy);
            $this->importIpBindings($legacy);
        });

        if ($this->option('with-radius')) {
            $this->importRadius($legacy);
        }

        $this->newLine();
        $this->info('Legacy data import complete.');

        return self::SUCCESS;
    }

    private function reportCounts($legacy): int
    {
        $tables = [
            'tbl_appconfig' => 'settings',
            'tbl_language' => 'languages',
            'tbl_bandwidth' => 'bandwidths',
            'tbl_routers' => 'routers',
            'tbl_pool' => 'pools',
            'tbl_plans' => 'plans',
            'tbl_users' => 'users',
            'tbl_customers' => 'customers',
            'tbl_voucher' => 'vouchers',
            'tbl_user_recharges' => 'recharges',
            'tbl_transactions' => 'transactions',
            'wallet' => 'wallets',
            'tbl_message' => 'messages',
            'tbl_logs' => 'activity_logs',
            'tbl_ip_binding' => 'ip_bindings',
        ];

        $rows = [];
        foreach ($tables as $src => $dst) {
            $rows[] = [
                $src,
                $this->safeCount($legacy, $src),
                $dst,
                DB::table($dst)->count(),
            ];
        }

        $this->table(['Legacy table', 'Legacy rows', 'New table', 'New rows'], $rows);

        return self::SUCCESS;
    }

    private function safeCount($legacy, string $table): int|string
    {
        try {
            return $legacy->table($table)->count();
        } catch (\Throwable) {
            return '—';
        }
    }

    private function importSettings($legacy): void
    {
        $rows = $legacy->table('tbl_appconfig')->get()
            ->map(fn ($r) => [
                'key' => $r->setting,
                'value' => $r->value,
                'created_at' => now(),
                'updated_at' => now(),
            ])->all();
        DB::table('settings')->insert($rows);
        $this->line('settings: '.count($rows));
    }

    private function importLanguages($legacy): void
    {
        $rows = $legacy->table('tbl_language')->get()
            ->map(fn ($r) => [
                'name' => $r->name, 'folder' => $r->folder, 'author' => $r->author,
                'created_at' => now(), 'updated_at' => now(),
            ])->all();
        DB::table('languages')->insert($rows);
        $this->line('languages: '.count($rows));
    }

    private function importBandwidths($legacy): void
    {
        foreach ($legacy->table('tbl_bandwidth')->orderBy('id')->get() as $r) {
            $id = DB::table('bandwidths')->insertGetId([
                'name' => $r->name_bw,
                'rate_down' => $r->rate_down,
                'rate_down_unit' => $r->rate_down_unit,
                'rate_up' => $r->rate_up,
                'rate_up_unit' => $r->rate_up_unit,
                'legacy_id' => $r->id,
                'created_at' => now(), 'updated_at' => now(),
            ]);
            $this->maps['bandwidths'][$r->id] = $id;
        }
        $this->line('bandwidths: '.count($this->maps['bandwidths'] ?? []));
    }

    private function importRouters($legacy): void
    {
        $n = 0;
        foreach ($legacy->table('tbl_routers')->orderBy('id')->get() as $r) {
            // password is stored via the encrypted cast -> use the model
            \App\Models\Router::create([
                'name' => $r->name,
                'ip_address' => $r->ip_address,
                'username' => $r->username,
                'password' => $r->password,
                'description' => $r->description,
                'legacy_id' => $r->id,
            ]);
            $n++;
        }
        $this->line("routers: {$n}");
    }

    private function importPools($legacy): void
    {
        $rows = $legacy->table('tbl_pool')->get()
            ->map(fn ($r) => [
                'pool_name' => $r->pool_name, 'range_ip' => $r->range_ip,
                'router_name' => $r->routers, 'legacy_id' => $r->id,
                'created_at' => now(), 'updated_at' => now(),
            ])->all();
        DB::table('pools')->insert($rows);
        $this->line('pools: '.count($rows));
    }

    private function importPlans($legacy): void
    {
        foreach ($legacy->table('tbl_plans')->orderBy('id')->get() as $r) {
            $id = DB::table('plans')->insertGetId([
                'name' => $r->name_plan,
                'bandwidth_id' => $this->maps['bandwidths'][$r->id_bw] ?? null,
                'price' => is_numeric($r->price) ? (int) $r->price : null,
                'type' => $r->type,
                'bandwidth_policy' => $r->typebp,
                'limit_type' => $r->limit_type,
                'time_limit' => $r->time_limit,
                'time_unit' => $r->time_unit,
                'data_limit' => $r->data_limit,
                'data_unit' => $r->data_unit,
                'validity' => $r->validity,
                'validity_unit' => $r->validity_unit,
                'shared_users' => $r->shared_users,
                'router_name' => $r->routers ?? '0',
                'pool' => $r->pool,
                'access_control' => $r->access_control ?? 0,
                'data_usage_gb' => $r->data_usage_gb ?? 0,
                'daily_quota' => $r->daily_quota ?? 0,
                'legacy_id' => $r->id,
                'created_at' => now(), 'updated_at' => now(),
            ]);
            $this->maps['plans'][$r->id] = $id;
        }
        $this->line('plans: '.count($this->maps['plans'] ?? []));
    }

    private function importUsers($legacy): void
    {
        $rows = [];
        foreach ($legacy->table('tbl_users')->orderBy('id')->get() as $r) {
            $rows[] = [
                'username' => $r->username,
                'name' => $r->fullname ?: $r->username,
                'password' => $r->password,                       // legacy crypt() -> rehashed on login
                'role' => strtolower($r->user_type ?? 'regular'),
                'access_control' => (string) ($r->access_control ?? '0'),
                'status' => strtolower($r->status ?? 'active'),
                'last_login_at' => $this->date($r->last_login),
                'legacy_id' => $r->id,
                'created_at' => $this->date($r->creationdate) ?? now(),
                'updated_at' => now(),
            ];
        }
        DB::table('users')->insert($rows);
        $this->line('users: '.count($rows));
    }

    private function importCustomers($legacy): void
    {
        $total = 0;
        $deduped = 0;
        $seen = [];   // lowercased username => true (mirror case-insensitive unique index)
        $legacy->table('tbl_customers')->orderBy('id')->chunk(self::CHUNK, function ($chunk) use (&$total, &$deduped, &$seen) {
            $rows = [];
            foreach ($chunk as $r) {
                $username = $r->username;
                if ($username !== null && $username !== '') {
                    $key = mb_strtolower($username);
                    if (isset($seen[$key])) {
                        $username = $username.'_dup'.$r->id;   // disambiguate collision
                        $deduped++;
                    }
                    $seen[$key] = true;
                }
                $rows[] = [
                    'username' => $username,
                    'password' => $r->password,
                    'fullname' => $r->fullname,
                    'batch' => $r->batch,
                    'address' => $r->address,
                    'phonenumber' => $r->phonenumber,
                    'validity' => $r->validity,
                    'validity_unit' => $r->validity_unit,
                    'profile' => $r->profile,
                    'type' => $r->type,
                    'generated_by' => $r->generated_by,
                    'generated_for' => $r->generated_for,
                    'status' => $r->status ?: 'activate',
                    'last_login_at' => $this->date($r->last_login),
                    'legacy_id' => $r->id,
                    'created_at' => $this->date($r->created_at) ?? now(),
                    'updated_at' => now(),
                ];
            }
            DB::table('customers')->insert($rows);
            $total += count($rows);
            $this->maps['customers_pending'] = true; // map built lazily below
        });

        // Build legacy_id => new id map for FK remapping (recharges).
        foreach (DB::table('customers')->select('id', 'legacy_id')->whereNotNull('legacy_id')->get() as $c) {
            $this->maps['customers'][$c->legacy_id] = $c->id;
        }
        $this->line("customers: {$total}".($deduped ? " ({$deduped} username collisions disambiguated)" : ''));
    }

    private function importVouchers($legacy): void
    {
        $total = 0;
        $legacy->table('tbl_voucher')->orderBy('id')->chunk(self::CHUNK, function ($chunk) use (&$total) {
            $rows = [];
            foreach ($chunk as $r) {
                $rows[] = [
                    'type' => $r->type,
                    'router_name' => $r->routers,
                    'plan_id' => $this->maps['plans'][$r->id_plan] ?? null,
                    'code' => $r->code,
                    'batch' => $r->batch,
                    'user' => $r->user,
                    'status' => $r->status,
                    'generated_by' => $r->generated_by,
                    'generated_for' => $r->generated_for,
                    'expired' => $r->expired,
                    'allocation' => $r->allocation,
                    'issued_on' => $this->dateOnly($r->created_date),
                    'user_status' => $r->user_status ?: 'activate',
                    'legacy_id' => $r->id,
                    'created_at' => now(), 'updated_at' => now(),
                ];
            }
            DB::table('vouchers')->insert($rows);
            $total += count($rows);
        });
        $this->line("vouchers: {$total}");
    }

    private function importRecharges($legacy): void
    {
        $rows = [];
        foreach ($legacy->table('tbl_user_recharges')->orderBy('id')->get() as $r) {
            $custId = (is_numeric($r->customer_id) ? ($this->maps['customers'][(int) $r->customer_id] ?? null) : null);
            $rows[] = [
                'customer_id' => $custId,
                'customer_ref' => $r->customer_id,
                'username' => $r->username,
                'plan_id' => $this->maps['plans'][$r->plan_id] ?? null,
                'plan_name' => $r->namebp,
                'recharged_on' => $this->dateOnly($r->recharged_on),
                'expiration' => $this->dateOnly($r->expiration),
                'time' => $r->time,
                'status' => $r->status,
                'method' => $r->method,
                'router_name' => $r->routers,
                'type' => $r->type,
                'legacy_id' => $r->id,
                'created_at' => now(), 'updated_at' => now(),
            ];
        }
        if ($rows) {
            DB::table('recharges')->insert($rows);
        }
        $this->line('recharges: '.count($rows));
    }

    private function importTransactions($legacy): void
    {
        $rows = [];
        foreach ($legacy->table('tbl_transactions')->orderBy('id')->get() as $r) {
            $rows[] = [
                'invoice' => $r->invoice,
                'username' => $r->username,
                'plan_name' => $r->plan_name,
                'price' => $r->price,
                'recharged_on' => $this->dateOnly($r->recharged_on),
                'expiration' => $this->dateOnly($r->expiration),
                'time' => $r->time,
                'method' => $r->method,
                'router_name' => $r->routers,
                'type' => $r->type,
                'legacy_id' => $r->id,
                'created_at' => now(), 'updated_at' => now(),
            ];
        }
        if ($rows) {
            DB::table('transactions')->insert($rows);
        }
        $this->line('transactions: '.count($rows));
    }

    private function importWallets($legacy): void
    {
        $rows = $legacy->table('wallet')->get()->map(fn ($r) => [
            'username' => $r->username,
            'user_type' => $r->user_type,
            'credit_limit' => $r->credit_limit,
            'credit_balance' => $r->credit_balance,
            'available_balance' => $r->available_balance,
            'last_loaded_date' => $this->dateOnly($r->last_loaded_date),
            'loaded_by' => $r->loaded_by,
            'last_collected_by' => $r->last_collected_by,
            'last_registered_by' => $r->last_registered_by,
            'legacy_id' => $r->id,
            'created_at' => now(), 'updated_at' => now(),
        ])->all();
        if ($rows) {
            DB::table('wallets')->insert($rows);
        }
        $this->line('wallets: '.count($rows));
    }

    private function importCompanyWallet($legacy): void
    {
        $rows = $legacy->table('walletCompany')->get()->map(fn ($r) => [
            'account_balance' => $r->account_balance,
            'balance_to_collect' => $r->balance_to_collect,
            'last_loaded_date' => $this->dateOnly($r->last_loaded_date),
            'created_at' => now(), 'updated_at' => now(),
        ])->all();
        if ($rows) {
            DB::table('company_wallet')->insert($rows);
        }
        $this->line('company_wallet: '.count($rows));
    }

    private function importMessages($legacy): void
    {
        $rows = $legacy->table('tbl_message')->get()->map(fn ($r) => [
            'from_user' => $r->from_user,
            'to_user' => $r->to_user,
            'title' => $r->title,
            'message' => $r->message,
            'is_read' => $r->status === '1',
            'sent_at' => $this->date($r->date) ?? now(),
            'legacy_id' => $r->id,
            'created_at' => now(), 'updated_at' => now(),
        ])->all();
        if ($rows) {
            DB::table('messages')->insert($rows);
        }
        $this->line('messages: '.count($rows));
    }

    private function importLogs($legacy): void
    {
        $total = 0;
        $legacy->table('tbl_logs')->orderBy('id')->chunk(self::CHUNK, function ($chunk) use (&$total) {
            $rows = [];
            foreach ($chunk as $r) {
                $rows[] = [
                    'logged_at' => $this->date($r->date),
                    'type' => $r->type,
                    'description' => $r->description,
                    'user_id' => $r->userid,
                    'username' => $r->username ?? null,
                    'ip' => is_string($r->ip ?? null) ? substr($r->ip, 0, 100) : null,
                    'legacy_id' => $r->id,
                    'created_at' => now(), 'updated_at' => now(),
                ];
            }
            DB::table('activity_logs')->insert($rows);
            $total += count($rows);
        });
        $this->line("activity_logs: {$total}");
    }

    private function importIpBindings($legacy): void
    {
        $rows = $legacy->table('tbl_ip_binding')->get()->map(fn ($r) => [
            'mac_address' => $r->mac_address,
            'address' => $r->address,
            'nas' => $r->nas,
            'consumer_name' => $r->consumer_name,
            'registered_by' => $r->registered_by,
            'legacy_id' => $r->id,
            'created_at' => now(), 'updated_at' => now(),
        ])->all();
        if ($rows) {
            DB::table('ip_bindings')->insert($rows);
        }
        $this->line('ip_bindings: '.count($rows));
    }

    private function importRadius($legacy): void
    {
        $this->warn('Copying FreeRADIUS tables (this can take a while)...');
        $tables = ['radcheck', 'radreply', 'radusergroup', 'radgroupcheck', 'radgroupreply', 'nas'];
        foreach ($tables as $t) {
            DB::table($t)->truncate();
            $total = 0;
            $legacy->table($t)->orderBy('id')->chunk(2000, function ($chunk) use ($t, &$total) {
                DB::table($t)->insert(array_map(fn ($r) => (array) $r, $chunk->all()));
                $total += $chunk->count();
            });
            $this->line("{$t}: {$total}");
        }
    }

    private function date($value): ?string
    {
        if (empty($value) || str_starts_with((string) $value, '0000')) {
            return null;
        }

        return date('Y-m-d H:i:s', strtotime((string) $value));
    }

    private function dateOnly($value): ?string
    {
        if (empty($value) || str_starts_with((string) $value, '0000')) {
            return null;
        }

        return date('Y-m-d', strtotime((string) $value));
    }
}
