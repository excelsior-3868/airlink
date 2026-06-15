<?php

namespace App\Http\Controllers;

use App\Models\CompanyWallet;
use App\Models\Wallet;
use App\Services\WalletService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WalletController extends Controller
{
    public function __construct(private readonly WalletService $wallets) {}

    public function index(Request $request): Response
    {
        return Inertia::render('Wallet/Index', [
            'wallets' => Wallet::query()
                ->when($request->search, fn ($q, $s) => $q->where('username', 'like', "%{$s}%"))
                ->orderByDesc('id')
                ->paginate(20)
                ->withQueryString(),
            'company' => CompanyWallet::first(),
            'filters' => $request->only('search'),
        ]);
    }

    public function load(Request $request): RedirectResponse
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

        return redirect()->route('wallet.index')
            ->with('success', "Loaded {$data['amount']} to {$data['username']}.");
    }
}
