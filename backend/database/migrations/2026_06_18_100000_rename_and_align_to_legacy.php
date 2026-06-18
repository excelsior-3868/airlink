<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Drop foreign key constraints on modernized tables
        if (Schema::hasTable('plans') && Schema::hasColumn('plans', 'bandwidth_id')) {
            Schema::table('plans', function (Blueprint $table) {
                $table->dropForeign('plans_bandwidth_id_foreign');
            });
        }
        if (Schema::hasTable('vouchers') && Schema::hasColumn('vouchers', 'plan_id')) {
            Schema::table('vouchers', function (Blueprint $table) {
                $table->dropForeign('vouchers_plan_id_foreign');
            });
        }
        if (Schema::hasTable('recharges')) {
            Schema::table('recharges', function (Blueprint $table) {
                if (Schema::hasColumn('recharges', 'customer_id')) {
                    $table->dropForeign('recharges_customer_id_foreign');
                }
                if (Schema::hasColumn('recharges', 'plan_id')) {
                    $table->dropForeign('recharges_plan_id_foreign');
                }
            });
        }

        // 2. Rename tables to legacy tbl_* / wallet / walletCompany names
        $renameMap = [
            'users' => 'tbl_users',
            'customers' => 'tbl_customers',
            'settings' => 'tbl_appconfig',
            'languages' => 'tbl_language',
            'bandwidths' => 'tbl_bandwidth',
            'routers' => 'tbl_routers',
            'pools' => 'tbl_pool',
            'plans' => 'tbl_plans',
            'vouchers' => 'tbl_voucher',
            'recharges' => 'tbl_user_recharges',
            'transactions' => 'tbl_transactions',
            'wallets' => 'wallet',
            'company_wallet' => 'walletCompany',
            'messages' => 'tbl_message',
            'activity_logs' => 'tbl_logs',
            'ip_bindings' => 'tbl_ip_binding',
        ];

        foreach ($renameMap as $old => $new) {
            if (Schema::hasTable($old) && !Schema::hasTable($new)) {
                Schema::rename($old, $new);
            }
        }

        // 3. Restructure tbl_users
        if (Schema::hasTable('tbl_users')) {
            if (Schema::hasColumn('tbl_users', 'name')) {
                // Capitalize role values to match legacy user_type enums
                DB::statement("UPDATE tbl_users SET role = 'Admin' WHERE role = 'admin'");
                DB::statement("UPDATE tbl_users SET role = 'Sales' WHERE role = 'sales'");
                DB::statement("UPDATE tbl_users SET role = 'Regular' WHERE role = 'regular'");
                DB::statement("UPDATE tbl_users SET role = 'POS' WHERE role = 'pos'");

                Schema::table('tbl_users', function (Blueprint $table) {
                    $table->renameColumn('name', 'fullname');
                    $table->renameColumn('role', 'user_type');
                    $table->renameColumn('last_login_at', 'last_login');
                    $table->renameColumn('created_at', 'creationdate');
                });

                Schema::table('tbl_users', function (Blueprint $table) {
                    $table->enum('user_type', ['Admin', 'Sales', 'Regular', 'POS'])->nullable()->change();
                    $table->dropColumn(['email', 'email_verified_at', 'remember_token', 'legacy_id', 'updated_at']);
                });
            }
        }

        // 4. Restructure tbl_customers
        if (Schema::hasTable('tbl_customers')) {
            if (Schema::hasColumn('tbl_customers', 'last_login_at')) {
                Schema::table('tbl_customers', function (Blueprint $table) {
                    $table->renameColumn('last_login_at', 'last_login');
                });
            }
            Schema::table('tbl_customers', function (Blueprint $table) {
                $columnsToDrop = [];
                if (Schema::hasColumn('tbl_customers', 'legacy_id')) $columnsToDrop[] = 'legacy_id';
                if (Schema::hasColumn('tbl_customers', 'remember_token')) $columnsToDrop[] = 'remember_token';
                if (Schema::hasColumn('tbl_customers', 'updated_at')) $columnsToDrop[] = 'updated_at';
                if (!empty($columnsToDrop)) {
                    $table->dropColumn($columnsToDrop);
                }
            });
        }

        // 5. Restructure tbl_appconfig
        if (Schema::hasTable('tbl_appconfig')) {
            if (Schema::hasColumn('tbl_appconfig', 'key')) {
                Schema::table('tbl_appconfig', function (Blueprint $table) {
                    $table->renameColumn('key', 'setting');
                });
            }
            Schema::table('tbl_appconfig', function (Blueprint $table) {
                $columnsToDrop = [];
                if (Schema::hasColumn('tbl_appconfig', 'created_at')) $columnsToDrop[] = 'created_at';
                if (Schema::hasColumn('tbl_appconfig', 'updated_at')) $columnsToDrop[] = 'updated_at';
                if (!empty($columnsToDrop)) {
                    $table->dropColumn($columnsToDrop);
                }
            });
        }

        // 6. Restructure tbl_language
        if (Schema::hasTable('tbl_language')) {
            Schema::table('tbl_language', function (Blueprint $table) {
                $columnsToDrop = [];
                if (Schema::hasColumn('tbl_language', 'created_at')) $columnsToDrop[] = 'created_at';
                if (Schema::hasColumn('tbl_language', 'updated_at')) $columnsToDrop[] = 'updated_at';
                if (!empty($columnsToDrop)) {
                    $table->dropColumn($columnsToDrop);
                }
            });
        }

        // 7. Restructure tbl_bandwidth
        if (Schema::hasTable('tbl_bandwidth')) {
            if (Schema::hasColumn('tbl_bandwidth', 'name')) {
                Schema::table('tbl_bandwidth', function (Blueprint $table) {
                    $table->renameColumn('name', 'name_bw');
                });
            }
            Schema::table('tbl_bandwidth', function (Blueprint $table) {
                $columnsToDrop = [];
                if (Schema::hasColumn('tbl_bandwidth', 'legacy_id')) $columnsToDrop[] = 'legacy_id';
                if (Schema::hasColumn('tbl_bandwidth', 'created_at')) $columnsToDrop[] = 'created_at';
                if (Schema::hasColumn('tbl_bandwidth', 'updated_at')) $columnsToDrop[] = 'updated_at';
                if (!empty($columnsToDrop)) {
                    $table->dropColumn($columnsToDrop);
                }
            });
        }

        // 8. Restructure tbl_routers
        if (Schema::hasTable('tbl_routers')) {
            Schema::table('tbl_routers', function (Blueprint $table) {
                if (Schema::hasColumn('tbl_routers', 'password')) {
                    $table->text('password')->change();
                }
                $columnsToDrop = [];
                if (Schema::hasColumn('tbl_routers', 'api_port')) $columnsToDrop[] = 'api_port';
                if (Schema::hasColumn('tbl_routers', 'use_ssl')) $columnsToDrop[] = 'use_ssl';
                if (Schema::hasColumn('tbl_routers', 'legacy_id')) $columnsToDrop[] = 'legacy_id';
                if (Schema::hasColumn('tbl_routers', 'created_at')) $columnsToDrop[] = 'created_at';
                if (Schema::hasColumn('tbl_routers', 'updated_at')) $columnsToDrop[] = 'updated_at';
                if (!empty($columnsToDrop)) {
                    $table->dropColumn($columnsToDrop);
                }
            });
        }

        // 9. Restructure tbl_pool
        if (Schema::hasTable('tbl_pool')) {
            if (Schema::hasColumn('tbl_pool', 'router_name')) {
                Schema::table('tbl_pool', function (Blueprint $table) {
                    $table->renameColumn('router_name', 'routers');
                });
            }
            Schema::table('tbl_pool', function (Blueprint $table) {
                $columnsToDrop = [];
                if (Schema::hasColumn('tbl_pool', 'legacy_id')) $columnsToDrop[] = 'legacy_id';
                if (Schema::hasColumn('tbl_pool', 'created_at')) $columnsToDrop[] = 'created_at';
                if (Schema::hasColumn('tbl_pool', 'updated_at')) $columnsToDrop[] = 'updated_at';
                if (!empty($columnsToDrop)) {
                    $table->dropColumn($columnsToDrop);
                }
            });
        }

        // 10. Restructure tbl_plans
        if (Schema::hasTable('tbl_plans')) {
            Schema::table('tbl_plans', function (Blueprint $table) {
                if (Schema::hasColumn('tbl_plans', 'name')) $table->renameColumn('name', 'name_plan');
                if (Schema::hasColumn('tbl_plans', 'bandwidth_id')) $table->renameColumn('bandwidth_id', 'id_bw');
                if (Schema::hasColumn('tbl_plans', 'bandwidth_policy')) $table->renameColumn('bandwidth_policy', 'typebp');
                if (Schema::hasColumn('tbl_plans', 'router_name')) $table->renameColumn('router_name', 'routers');
            });
            Schema::table('tbl_plans', function (Blueprint $table) {
                $columnsToDrop = [];
                if (Schema::hasColumn('tbl_plans', 'legacy_id')) $columnsToDrop[] = 'legacy_id';
                if (Schema::hasColumn('tbl_plans', 'created_at')) $columnsToDrop[] = 'created_at';
                if (Schema::hasColumn('tbl_plans', 'updated_at')) $columnsToDrop[] = 'updated_at';
                if (!empty($columnsToDrop)) {
                    $table->dropColumn($columnsToDrop);
                }
            });
        }

        // 11. Restructure tbl_voucher
        if (Schema::hasTable('tbl_voucher')) {
            Schema::table('tbl_voucher', function (Blueprint $table) {
                if (Schema::hasColumn('tbl_voucher', 'router_name')) $table->renameColumn('router_name', 'routers');
                if (Schema::hasColumn('tbl_voucher', 'plan_id')) $table->renameColumn('plan_id', 'id_plan');
                if (Schema::hasColumn('tbl_voucher', 'issued_on')) $table->renameColumn('issued_on', 'created_date');
            });
            Schema::table('tbl_voucher', function (Blueprint $table) {
                $columnsToDrop = [];
                if (Schema::hasColumn('tbl_voucher', 'legacy_id')) $columnsToDrop[] = 'legacy_id';
                if (Schema::hasColumn('tbl_voucher', 'created_at')) $columnsToDrop[] = 'created_at';
                if (Schema::hasColumn('tbl_voucher', 'updated_at')) $columnsToDrop[] = 'updated_at';
                if (!empty($columnsToDrop)) {
                    $table->dropColumn($columnsToDrop);
                }
            });
        }

        // 12. Restructure tbl_user_recharges
        if (Schema::hasTable('tbl_user_recharges')) {
            if (Schema::hasColumn('tbl_user_recharges', 'customer_ref')) {
                Schema::table('tbl_user_recharges', function (Blueprint $table) {
                    if (Schema::hasColumn('tbl_user_recharges', 'customer_id')) {
                        $table->dropColumn('customer_id');
                    }
                });
                Schema::table('tbl_user_recharges', function (Blueprint $table) {
                    $table->renameColumn('customer_ref', 'customer_id');
                });
            }
            Schema::table('tbl_user_recharges', function (Blueprint $table) {
                if (Schema::hasColumn('tbl_user_recharges', 'plan_name')) $table->renameColumn('plan_name', 'namebp');
                if (Schema::hasColumn('tbl_user_recharges', 'router_name')) $table->renameColumn('router_name', 'routers');
            });
            Schema::table('tbl_user_recharges', function (Blueprint $table) {
                $columnsToDrop = [];
                if (Schema::hasColumn('tbl_user_recharges', 'legacy_id')) $columnsToDrop[] = 'legacy_id';
                if (Schema::hasColumn('tbl_user_recharges', 'created_at')) $columnsToDrop[] = 'created_at';
                if (Schema::hasColumn('tbl_user_recharges', 'updated_at')) $columnsToDrop[] = 'updated_at';
                if (!empty($columnsToDrop)) {
                    $table->dropColumn($columnsToDrop);
                }
            });
        }

        // 13. Restructure tbl_transactions
        if (Schema::hasTable('tbl_transactions')) {
            Schema::table('tbl_transactions', function (Blueprint $table) {
                if (Schema::hasColumn('tbl_transactions', 'router_name')) $table->renameColumn('router_name', 'routers');
            });
            Schema::table('tbl_transactions', function (Blueprint $table) {
                $columnsToDrop = [];
                if (Schema::hasColumn('tbl_transactions', 'legacy_id')) $columnsToDrop[] = 'legacy_id';
                if (Schema::hasColumn('tbl_transactions', 'created_at')) $columnsToDrop[] = 'created_at';
                if (Schema::hasColumn('tbl_transactions', 'updated_at')) $columnsToDrop[] = 'updated_at';
                if (!empty($columnsToDrop)) {
                    $table->dropColumn($columnsToDrop);
                }
            });
        }

        // 14. Restructure wallet
        if (Schema::hasTable('wallet')) {
            Schema::table('wallet', function (Blueprint $table) {
                $columnsToDrop = [];
                if (Schema::hasColumn('wallet', 'legacy_id')) $columnsToDrop[] = 'legacy_id';
                if (Schema::hasColumn('wallet', 'created_at')) $columnsToDrop[] = 'created_at';
                if (Schema::hasColumn('wallet', 'updated_at')) $columnsToDrop[] = 'updated_at';
                if (!empty($columnsToDrop)) {
                    $table->dropColumn($columnsToDrop);
                }
            });
        }

        // 15. Restructure walletCompany
        if (Schema::hasTable('walletCompany')) {
            Schema::table('walletCompany', function (Blueprint $table) {
                $columnsToDrop = [];
                if (Schema::hasColumn('walletCompany', 'created_at')) $columnsToDrop[] = 'created_at';
                if (Schema::hasColumn('walletCompany', 'updated_at')) $columnsToDrop[] = 'updated_at';
                if (!empty($columnsToDrop)) {
                    $table->dropColumn($columnsToDrop);
                }
            });
        }

        // 16. Restructure tbl_message
        if (Schema::hasTable('tbl_message')) {
            if (Schema::hasColumn('tbl_message', 'is_read')) {
                DB::statement("UPDATE tbl_message SET is_read = 1 WHERE is_read = 1");
                DB::statement("UPDATE tbl_message SET is_read = 0 WHERE is_read = 0 OR is_read IS NULL");

                Schema::table('tbl_message', function (Blueprint $table) {
                    $table->renameColumn('is_read', 'status');
                    $table->renameColumn('sent_at', 'date');
                });

                Schema::table('tbl_message', function (Blueprint $table) {
                    $table->enum('status', ['0', '1'])->default('0')->change();
                });
            }
            Schema::table('tbl_message', function (Blueprint $table) {
                $columnsToDrop = [];
                if (Schema::hasColumn('tbl_message', 'legacy_id')) $columnsToDrop[] = 'legacy_id';
                if (Schema::hasColumn('tbl_message', 'created_at')) $columnsToDrop[] = 'created_at';
                if (Schema::hasColumn('tbl_message', 'updated_at')) $columnsToDrop[] = 'updated_at';
                if (!empty($columnsToDrop)) {
                    $table->dropColumn($columnsToDrop);
                }
            });
        }

        // 17. Restructure tbl_logs
        if (Schema::hasTable('tbl_logs')) {
            Schema::table('tbl_logs', function (Blueprint $table) {
                if (Schema::hasColumn('tbl_logs', 'logged_at')) $table->renameColumn('logged_at', 'date');
                if (Schema::hasColumn('tbl_logs', 'user_id')) $table->renameColumn('user_id', 'userid');
            });
            Schema::table('tbl_logs', function (Blueprint $table) {
                $columnsToDrop = [];
                if (Schema::hasColumn('tbl_logs', 'legacy_id')) $columnsToDrop[] = 'legacy_id';
                if (Schema::hasColumn('tbl_logs', 'created_at')) $columnsToDrop[] = 'created_at';
                if (Schema::hasColumn('tbl_logs', 'updated_at')) $columnsToDrop[] = 'updated_at';
                if (!empty($columnsToDrop)) {
                    $table->dropColumn($columnsToDrop);
                }
            });
        }

        // 18. Restructure tbl_ip_binding
        if (Schema::hasTable('tbl_ip_binding')) {
            Schema::table('tbl_ip_binding', function (Blueprint $table) {
                $columnsToDrop = [];
                if (Schema::hasColumn('tbl_ip_binding', 'legacy_id')) $columnsToDrop[] = 'legacy_id';
                if (Schema::hasColumn('tbl_ip_binding', 'created_at')) $columnsToDrop[] = 'created_at';
                if (Schema::hasColumn('tbl_ip_binding', 'updated_at')) $columnsToDrop[] = 'updated_at';
                if (!empty($columnsToDrop)) {
                    $table->dropColumn($columnsToDrop);
                }
            });
        }

        // 19. Drop Laravel utility tables
        Schema::dropIfExists('cache');
        Schema::dropIfExists('cache_locks');
        Schema::dropIfExists('failed_jobs');
        Schema::dropIfExists('job_batches');
        Schema::dropIfExists('jobs');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('sessions');

        // 20. Clear records from migrations table to keep it fully clean
        DB::table('migrations')->whereIn('migration', [
            '0001_01_01_000001_create_cache_table',
            '0001_01_01_000002_create_jobs_table',
            '2026_06_15_163536_create_personal_access_tokens_table'
        ])->delete();
    }

    public function down(): void
    {
        // No rolling back renaming since it's a one-way replication mapping
    }
};
