<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Plan;
use App\Models\Recharge;
use App\Models\Transaction;
use App\Models\Voucher;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardApiController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $today = now()->toDateString();
        $monthStart = now()->startOfMonth()->toDateString();

        return response()->json([
            'stats' => [
                'customers' => Customer::count(),
                'activeCustomers' => Customer::where('status', 'activate')->count(),
                'plans' => Plan::count(),
                'vouchersUnused' => Voucher::where('status', '0')->count(),
                'activeRecharges' => Recharge::where('status', 'on')->count(),
                'revenueToday' => (int) Transaction::where('recharged_on', $today)
                    ->sum(DB::raw('CAST(price AS UNSIGNED)')),
                'revenueMonth' => (int) Transaction::where('recharged_on', '>=', $monthStart)
                    ->sum(DB::raw('CAST(price AS UNSIGNED)')),
            ],
            'recentTransactions' => Transaction::latest('id')->limit(8)->get([
                'invoice', 'username', 'plan_name', 'price', 'recharged_on', 'type',
            ]),
        ]);
    }
}
