<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Voucher;
use App\Models\Plan;
use App\Models\Transaction;
use App\Models\Recharge;
use App\Services\RechargeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CustomerAuthController extends Controller
{
    public function __construct(
        private readonly RechargeService $rechargeService
    ) {}

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
            'device_name' => ['nullable', 'string'],
        ]);

        $customer = Customer::where('username', $data['username'])->first();
        $provider = Auth::createUserProvider('customers');

        if (! $customer
            || ! $provider->validateCredentials($customer, ['password' => $data['password']])
        ) {
            throw ValidationException::withMessages(['username' => ['Invalid credentials.']]);
        }

        // Generate cache-backed token
        $token = $customer->createToken($data['device_name'] ?? 'customer-api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'customer' => [
                'id' => $customer->id,
                'username' => $customer->username,
                'fullname' => $customer->fullname,
                'role' => 'customer',
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $c = $request->user();

        return response()->json([
            'id' => $c->id,
            'username' => $c->username,
            'fullname' => $c->fullname,
            'role' => 'customer',
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->bearerToken();
        if ($token) {
            \Illuminate\Support\Facades\Cache::forget("api_token:{$token}");
        }

        return response()->json(['message' => 'Logged out.']);
    }

    /**
     * Retrieve Customer Dashboard data.
     */
    public function dashboard(Request $request): JsonResponse
    {
        $customer = $request->user();

        // Get active package / recharge
        $activeRecharge = $customer->activeRecharge();

        // Query traffic statistics from FreeRADIUS radacct table
        $usage = DB::table('radacct')
            ->where('username', $customer->username)
            ->selectRaw('SUM(acctinputoctets) as upload, SUM(acctoutputoctets) as download')
            ->first();

        // Get recent transactions
        $transactions = Transaction::where('username', $customer->username)
            ->orderBy('id', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'customer' => [
                'username' => $customer->username,
                'fullname' => $customer->fullname,
                'profile' => $customer->profile,
                'type' => $customer->type,
                'validity' => $customer->validity,
                'validity_unit' => $customer->validity_unit,
            ],
            'active_recharge' => $activeRecharge,
            'traffic_usage' => [
                'upload' => $usage->upload ?? 0,
                'download' => $usage->download ?? 0,
                'total' => ($usage->upload ?? 0) + ($usage->download ?? 0),
            ],
            'transactions' => $transactions,
        ]);
    }

    /**
     * Change Customer password.
     */
    public function changePassword(Request $request): JsonResponse
    {
        $customer = $request->user();

        $data = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        $provider = Auth::createUserProvider('customers');
        if (! $provider->validateCredentials($customer, ['password' => $data['current_password']])) {
            throw ValidationException::withMessages(['current_password' => ['Incorrect current password.']]);
        }

        $customer->password = Hash::make($data['new_password']);
        $customer->save();

        return response()->json(['message' => 'Password updated successfully.']);
    }

    /**
     * Customer recharges their plan using a voucher code.
     */
    public function recharge(Request $request): JsonResponse
    {
        $customer = $request->user();

        $data = $request->validate([
            'code' => 'required|string',
        ]);

        $voucher = Voucher::where('code', $data['code'])->first();

        if (! $voucher) {
            throw ValidationException::withMessages(['code' => ['Voucher code not found.']]);
        }

        if ($voucher->isUsed()) {
            throw ValidationException::withMessages(['code' => ['This voucher has already been used.']]);
        }

        $plan = Plan::find($voucher->id_plan);
        if (! $plan) {
            throw ValidationException::withMessages(['code' => ['Plan associated with this voucher no longer exists.']]);
        }

        // Check if current plan is PPPOE and is not expired yet
        $active = $customer->activeRecharge();
        if ($active && now()->toDateString() < $active->expiration->toDateString()) {
            throw ValidationException::withMessages(['code' => ['Recharge can be done only after the current package has expired.']]);
        }

        // Perform recharge
        $recharge = $this->rechargeService->recharge($customer, $plan, [
            'method' => 'Voucher',
            'password' => $customer->password,
        ]);

        // Mark voucher as used by storing user username
        $voucher->status = $customer->username;
        $voucher->user = $customer->username;
        $voucher->expired = true;
        $voucher->save();

        return response()->json([
            'message' => 'Account recharged successfully!',
            'recharge' => $recharge,
        ]);
    }
}
