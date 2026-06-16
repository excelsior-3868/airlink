<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PlanResource;
use App\Models\Customer;
use App\Models\Plan;
use App\Services\RechargeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Plans listing + recharge over the SAME RechargeService as the web side.
 * A Flutter client can drive a full recharge through these endpoints.
 */
class RechargeApiController extends Controller
{
    public function __construct(private readonly RechargeService $recharges) {}

    public function plans(): AnonymousResourceCollection
    {
        return PlanResource::collection(Plan::orderBy('name')->get());
    }

    public function recharge(Request $request, Customer $customer): JsonResponse
    {
        $data = $request->validate([
            'plan_id' => ['required', 'exists:plans,id'],
            'password' => ['nullable', 'string', 'max:255'],
            'method' => ['required', 'string', 'max:100'],
        ]);

        $plan = Plan::findOrFail($data['plan_id']);
        $recharge = $this->recharges->recharge($customer, $plan, [
            'method' => $data['method'],
            'password' => $data['password'] ?? null,
        ]);

        return response()->json([
            'message' => 'Recharged.',
            'recharge' => [
                'id' => $recharge->id,
                'username' => $recharge->username,
                'plan_name' => $recharge->plan_name,
                'expiration' => $recharge->expiration?->toDateString(),
                'status' => $recharge->status,
            ],
        ], 201);
    }
}
