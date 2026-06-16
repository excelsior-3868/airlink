<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $from = $request->input('from', now()->startOfMonth()->toDateString());
        $to = $request->input('to', now()->toDateString());
        $type = $request->input('type');
        $username = $request->input('username');

        $base = Transaction::query()
            ->whereBetween('recharged_on', [$from, $to])
            ->when($type, fn ($q, $t) => $q->where('type', $t))
            ->when($username, fn ($q, $u) => $q->where('username', 'like', "%{$u}%"));

        $total = (clone $base)->sum(DB::raw('CAST(price AS UNSIGNED)'));
        $count = (clone $base)->count();

        $transactions = $base->latest('id')->paginate(25)->withQueryString();

        return response()->json([
            'transactions' => $transactions,
            'summary' => [
                'total' => (int) $total,
                'count' => $count,
                'from' => $from,
                'to' => $to,
            ]
        ]);
    }

    public function billings(Request $request): JsonResponse
    {
        $year = $request->input('year', now()->year);

        // Fetch monthly recharge data for the given year
        $monthlyData = Transaction::query()
            ->select(
                DB::raw('MONTH(recharged_on) as month'),
                DB::raw('SUM(CAST(price AS UNSIGNED)) as total')
            )
            ->whereYear('recharged_on', $year)
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $graph = collect(range(1, 12))->map(function ($month) use ($monthlyData) {
            $data = $monthlyData->firstWhere('month', $month);
            return [
                'month' => date('M', mktime(0, 0, 0, $month, 10)),
                'total' => $data ? (int) $data->total : 0,
            ];
        });

        // Company Balance
        $companyBalance = \App\Models\CompanyWallet::first()?->balance ?? 0;

        return response()->json([
            'graph' => $graph,
            'company_balance' => $companyBalance,
            'year' => $year
        ]);
    }
}
