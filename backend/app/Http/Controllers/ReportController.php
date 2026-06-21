<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Revenue reporting. Mirrors legacy reports.php: daily report, by-period and
 * by-user, summing tbl_transactions.price over a recharged_on range.
 */
class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $from = $request->input('from', now()->startOfMonth()->toDateString());
        $to = $request->input('to', now()->toDateString());
        $type = $request->input('type');
        $username = $request->input('username');

        $base = Transaction::query()
            ->whereBetween('recharged_on', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->when($type, fn ($q, $t) => $q->where('type', $t))
            ->when($username, fn ($q, $u) => $q->where('username', 'like', "%{$u}%"));

        $total = (clone $base)->sum('price');
        $count = (clone $base)->count();

        return Inertia::render('Reports/Index', [
            'transactions' => $base->latest('id')->paginate(25)->withQueryString(),
            'summary' => [
                'total' => (int) $total,
                'count' => $count,
                'from' => $from,
                'to' => $to,
            ],
            'filters' => [
                'from' => $from,
                'to' => $to,
                'type' => $type,
                'username' => $username,
            ],
        ]);
    }
}
