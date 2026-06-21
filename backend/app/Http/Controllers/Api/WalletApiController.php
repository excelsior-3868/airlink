<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CompanyWallet;
use App\Models\Wallet;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WalletApiController extends Controller
{
    public function __construct(private readonly WalletService $wallets) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            $wallets = Wallet::query()
                ->when($request->search, fn ($q, $s) => $q->where('username', 'like', "%{$s}%"))
                ->orderByDesc('id')
                ->paginate(20)
                ->withQueryString();

            $company = CompanyWallet::first();

            return response()->json([
                'role' => 'admin',
                'wallets' => $wallets,
                'company' => $company
            ]);
        }

        $username = $user->username;

        // available balance
        $wallet = Wallet::where('username', $username)->first();
        $balance = $wallet ? $wallet->available_balance : 0;

        // Hotspot sales count and sum
        $collate = \DB::getDriverName() === 'sqlite' ? '' : 'COLLATE utf8mb4_unicode_ci';
        $hotspotQuery = \DB::selectOne("
            SELECT 
                SUM(p.price) AS total_price, 
                COUNT(DISTINCT c.username) AS matching_codes 
            FROM tbl_customers t 
            LEFT JOIN radacct c ON t.username {$collate} = c.username {$collate}
            JOIN tbl_plans p ON t.profile = p.name_plan 
            WHERE t.generated_for = ?
        ", [$username]);

        // PPPoE sales count and sum
        $pppoeQuery = \DB::selectOne("
            SELECT SUM(p.price) AS total_price 
            FROM tbl_user_recharges r 
            INNER JOIN tbl_plans p ON r.plan_id = p.id 
            WHERE r.type = 'PPPOE' AND r.method = ?
        ", [$username]);

        // Paginated transactions: transactions where method = $username
        $transactions = \App\Models\Transaction::query()
            ->where('method', $username)
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString();

        return response()->json([
            'role' => 'seller',
            'available_balance' => (float) ($balance ?? 0),
            'hotspot_sales' => (float) ($hotspotQuery->total_price ?? 0),
            'hotspot_users' => (int) ($hotspotQuery->matching_codes ?? 0),
            'pppoe_sales' => (float) ($pppoeQuery->total_price ?? 0),
            'transactions' => $transactions,
        ]);
    }

    public function load(Request $request): JsonResponse
    {
        $data = $request->validate([
            'username' => ['required', 'string', 'max:200'],
            'amount' => ['required', 'integer', 'min:1'],
            'user_type' => ['nullable', 'string', 'max:200'],
        ]);

        $this->wallets->load(
            $data['username'],
            $data['amount'],
            $request->user()->username,
            $data['user_type'] ?? null,
        );

        return response()->json([
            'message' => "Loaded {$data['amount']} to {$data['username']}."
        ]);
    }
}
