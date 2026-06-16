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
}
