<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\Plan;
use App\Models\Voucher;
use App\Services\VoucherService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VoucherController extends Controller
{
    public function __construct(private readonly VoucherService $vouchers) {}

    public function index(Request $request): Response
    {
        return Inertia::render('Vouchers/Index', [
            'vouchers' => Voucher::query()
                ->with('plan:id,name')
                ->when($request->search, fn ($q, $s) => $q->where('code', 'like', "%{$s}%")->orWhere('batch', 'like', "%{$s}%"))
                ->when($request->status, fn ($q, $v) => $q->where('status', $v))
                ->latest('id')
                ->paginate(20)
                ->withQueryString(),
            'filters' => $request->only('search', 'status'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Vouchers/Generate', [
            'plans' => Plan::orderBy('name')->get(['id', 'name', 'type', 'price']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'plan_id' => ['required', 'exists:plans,id'],
            'count' => ['required', 'integer', 'min:1', 'max:1000'],
            'code_length' => ['required', 'integer', 'min:4', 'max:20'],
            'batch' => ['nullable', 'string', 'max:200'],
            'generated_for' => ['nullable', 'string', 'max:100'],
        ]);

        $plan = Plan::findOrFail($data['plan_id']);

        $created = $this->vouchers->generate($plan, $data['count'], $data['code_length'], [
            'batch' => $data['batch'] ?? null,
            'generated_by' => $request->user()->username,
            'generated_for' => $data['generated_for'] ?? null,
        ]);

        return redirect()->route('vouchers.index')
            ->with('success', "{$created} voucher(s) generated.");
    }

    public function destroy(Voucher $voucher): RedirectResponse
    {
        abort_unless(request()->user()->hasRole(UserRole::Admin), 403);
        $voucher->delete();

        return back()->with('success', 'Voucher deleted.');
    }
}
