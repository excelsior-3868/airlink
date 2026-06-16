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
        $wallets = Wallet::query()
            ->when($request->search, fn ($q, $s) => $q->where('username', 'like', "%{$s}%"))
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString();

        $company = CompanyWallet::first();

        return response()->json([
            'wallets' => $wallets,
            'company' => $company
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
