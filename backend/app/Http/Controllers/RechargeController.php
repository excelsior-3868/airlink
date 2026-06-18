<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Plan;
use App\Services\RechargeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RechargeController extends Controller
{
    public function __construct(private readonly RechargeService $recharges) {}

    public function create(Customer $customer): Response
    {
        return Inertia::render('Recharge/Create', [
            'customer' => $customer->only('id', 'username', 'fullname', 'profile', 'type', 'status'),
            'plans' => Plan::orderBy('name_plan')->get(['id', 'name_plan', 'type', 'price', 'validity', 'validity_unit']),
            'activeRecharge' => $customer->recharges()->where('status', 'on')->latest('id')->first(),
        ]);
    }

    public function store(Request $request, Customer $customer): RedirectResponse
    {
        $data = $request->validate([
            'plan_id' => ['required', 'exists:tbl_plans,id'],
            'password' => ['nullable', 'string', 'max:255'],
            'method' => ['required', 'string', 'max:100'],
        ]);

        $plan = Plan::findOrFail($data['plan_id']);

        $this->recharges->recharge($customer, $plan, [
            'method' => $data['method'],
            'password' => $data['password'] ?? null,
        ]);

        return redirect()->route('customers.show', $customer)
            ->with('success', "{$customer->username} recharged onto {$plan->name}.");
    }
}
