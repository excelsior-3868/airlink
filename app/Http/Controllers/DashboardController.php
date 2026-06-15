<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Plan;
use App\Models\Recharge;
use App\Models\Transaction;
use App\Models\Voucher;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $today = now()->toDateString();
        $monthStart = now()->startOfMonth()->toDateString();

        return Inertia::render('Dashboard', [
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
