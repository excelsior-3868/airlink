<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Plan;
use App\Models\Recharge;
use App\Models\Transaction;
use App\Models\Voucher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardApiController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();

        // POS-specific dashboard stats
        if ($user && $user->role === \App\Enums\UserRole::Pos) {
            $sadmin = $user->username;
            $cacheKey = "dashboard_pos_stats_{$sadmin}";

            $stats = \Illuminate\Support\Facades\Cache::remember($cacheKey, 30, function () use ($sadmin) {
                $voucher_no = Voucher::where('generated_for', $sadmin)->count();
                $user_no_ppp = Recharge::where('type', 'PPPOE')->count();

                // Count used vouchers for this seller
                $used_vouchers = DB::table('tbl_voucher')
                    ->leftJoin('radacct', function ($join) {
                        if (DB::getDriverName() === 'sqlite') {
                            $join->on('tbl_voucher.code', '=', 'radacct.username');
                        } else {
                            $join->on(DB::raw('tbl_voucher.code COLLATE utf8mb4_unicode_ci'), '=', DB::raw('radacct.username COLLATE utf8mb4_unicode_ci'));
                        }
                    })
                    ->where('tbl_voucher.generated_for', $sadmin)
                    ->whereNotNull('radacct.username')
                    ->count(DB::raw('distinct tbl_voucher.code'));

                return [
                    'vouchersCount' => $voucher_no,
                    'usedVouchers' => $used_vouchers,
                    'userNoPpp' => $user_no_ppp,
                    'activeHotspot' => 0,
                    'activePpp' => 0,
                ];
            });

            return response()->json([
                'role' => 'pos',
                'sadmin' => $sadmin,
                'stats' => $stats,
            ]);
        }

        // Card statistics & queries cached for 60 seconds
        $cacheKey = 'dashboard_staff_stats';
        $collate = DB::getDriverName() === 'sqlite' ? '' : 'COLLATE utf8mb4_unicode_ci';

        $data = \Illuminate\Support\Facades\Cache::remember($cacheKey, 60, function () use ($collate) {
            $voucher_no = Voucher::count();
            $user_no = Recharge::where('type', 'PPPOE')->count();

            // Query POS user stats
            $posQuery = "
                SELECT 
                    t.generated_for,
                    v.total_generated_for,
                    COUNT(DISTINCT CASE WHEN r.username = t.code THEN r.username ELSE NULL END) AS matching_codes,
                    SUM(CASE WHEN t.expired = 1 THEN 1 ELSE 0 END) AS expired_codes 
                FROM tbl_voucher t 
                LEFT JOIN radacct r ON t.code {$collate} = r.username {$collate}
                JOIN (
                    SELECT generated_for, COUNT(*) AS total_generated_for 
                    FROM tbl_voucher 
                    GROUP BY generated_for
                ) v ON t.generated_for {$collate} = v.generated_for {$collate}
                WHERE t.generated_for NOT IN ('duplicate')
                GROUP BY t.generated_for, v.total_generated_for 
                ORDER BY v.total_generated_for DESC
            ";
            $pos = DB::select($posQuery);

            // Sum of used_expired_vouchers
            $used_expired_voucher = 0;
            foreach ($pos as $pp) {
                $used_expired_voucher += (int) $pp->matching_codes;
            }

            // Query Voucher Allocation Summary
            $allocatedQuery = "
                SELECT 
                    t.allocation,
                    COUNT(distinct(code)) AS count, MIN(id) AS first_id, MAX(id) AS last_id,
                    COUNT(DISTINCT r.username) AS matching_users
                FROM tbl_voucher t 
                LEFT JOIN radacct r ON t.code {$collate} = r.username {$collate}
                WHERE allocation <> '0'
                GROUP BY t.allocation 
                ORDER BY matching_users DESC
            ";
            $allocated = DB::select($allocatedQuery);

            // Connect to Mikrotik Routers to get active users count (Hotspot & PPPoE)
            $ppp_count = 0;
            $hotspot_count = 0;
            
            $routers = \App\Models\Router::where('ip_address', '!=', '172.22.22.7')->get();
            $routerService = new \App\Services\Provisioning\RouterOSService();

            foreach ($routers as $router) {
                try {
                    $client = $routerService->connect($router);
                    
                    // Get the count of active PPPoE users
                    $ppp_users = $client->query(new \RouterOS\Query('/ppp/active/print'))->read();
                    $ppp_count += count($ppp_users);

                    // Get the count of active hotspot users
                    $hotspot_users = $client->query(new \RouterOS\Query('/ip/hotspot/active/print'))->read();
                    $hotspot_count += count($hotspot_users);
                } catch (\Throwable $e) {
                    \Log::warning("Failed to connect to router {$router->name} for dashboard stats: " . $e->getMessage());
                }
            }

            return [
                'totalVouchers' => $voucher_no,
                'activeHotspot' => $hotspot_count,
                'usedExpiredVouchers' => $used_expired_voucher,
                'damagedReturnedVouchers' => 0,
                'totalPppoeUsers' => $user_no,
                'activePppoe' => $ppp_count,
                'expiredUsers' => 0,
                'disabledUsers' => 0,
                'posUsers' => $pos,
                'allocatedVouchers' => $allocated,
            ];
        });

        // Activity log is NOT cached, loaded fresh each time
        $dlog = \App\Models\ActivityLog::latest('id')->limit(6)->get();

        return response()->json([
            'role' => 'staff',
            'stats' => [
                'totalVouchers' => $data['totalVouchers'],
                'activeHotspot' => $data['activeHotspot'],
                'usedExpiredVouchers' => $data['usedExpiredVouchers'],
                'damagedReturnedVouchers' => $data['damagedReturnedVouchers'],
                'totalPppoeUsers' => $data['totalPppoeUsers'],
                'activePppoe' => $data['activePppoe'],
                'expiredUsers' => $data['expiredUsers'],
                'disabledUsers' => $data['disabledUsers'],
            ],
            'posUsers' => $data['posUsers'],
            'allocatedVouchers' => $data['allocatedVouchers'],
            'activityLogs' => $dlog,
        ]);
    }
}
