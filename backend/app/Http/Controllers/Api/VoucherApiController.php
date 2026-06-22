<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Voucher;
use App\Services\VoucherService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VoucherApiController extends Controller
{
    public function __construct(private readonly VoucherService $vouchers) {}

    public function index(Request $request): JsonResponse
    {
        $vouchers = Voucher::query()
            ->with('plan:id,name_plan')
            ->when($request->search, fn ($q, $s) => $q->where('code', 'like', "%{$s}%")->orWhere('batch', 'like', "%{$s}%"))
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->latest('id')
            ->paginate(20)
            ->withQueryString();

        return response()->json($vouchers);
    }

    public function options(): JsonResponse
    {
        return response()->json([
            'plans' => Plan::orderBy('name_plan')->get(['id', 'name_plan', 'type', 'price']),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'plan_id' => ['required', 'exists:tbl_plans,id'],
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

        $this->bustCache($request, $data['generated_for'] ?? null);

        return response()->json([
            'message' => "{$created} voucher(s) generated."
        ], 201);
    }

    public function allocations(Request $request): JsonResponse
    {
        $user = $request->user();
        $cacheKey = "vouchers_allocations_" . ($user->isAdmin() ? 'admin' : "user_{$user->username}");

        $allocations = \Illuminate\Support\Facades\Cache::remember($cacheKey, 30, function () use ($user) {
            return \DB::table('tbl_voucher AS t')
                ->leftJoin('radacct AS r', function ($join) {
                    if (\DB::getDriverName() === 'sqlite') {
                        $join->on('t.code', '=', 'r.username');
                    } else {
                        $join->on(\DB::raw('t.code COLLATE utf8mb4_unicode_ci'), '=', \DB::raw('r.username COLLATE utf8mb4_unicode_ci'));
                    }
                })
                ->select(
                    't.allocation',
                    \DB::raw('MIN(t.id) AS first_id'),
                    \DB::raw('MAX(t.id) AS last_id'),
                    \DB::raw('COUNT(distinct t.code) AS count'),
                    \DB::raw('COUNT(distinct r.username) AS matching_users')
                )
                ->where('t.allocation', '<>', '0')
                ->whereNotNull('t.allocation')
                ->where('t.allocation', '<>', '')
                ->when(!$user->isAdmin(), fn ($q) => $q->where('t.generated_for', $user->username))
                ->groupBy('t.allocation')
                ->orderByDesc('matching_users')
                ->get();
        });

        return response()->json($allocations);
    }

    public function allocate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'vou_collector' => ['required', 'string', 'max:200'],
            'id_start' => ['required', 'integer'],
            'id_end' => ['required', 'integer', 'gte:id_start'],
        ]);

        $user = $request->user();
        $padmin = $user->username;

        // Fetch vouchers in range
        $vouchers = Voucher::whereBetween('id', [$data['id_start'], $data['id_end']])->get();

        if ($vouchers->isEmpty()) {
            return response()->json([
                'message' => 'No vouchers found in the specified range.'
            ], 422);
        }

        // Check if any voucher doesn't belong to this user (if not admin)
        foreach ($vouchers as $voucher) {
            if (!$user->isAdmin() && $voucher->generated_for !== $padmin) {
                return response()->json([
                    'message' => 'You cannot allocate vouchers generated for other users.'
                ], 403);
            }
            if ($voucher->allocation != '0' && !empty($voucher->allocation)) {
                return response()->json([
                    'message' => "Voucher ID {$voucher->id} is already allocated to {$voucher->allocation}."
                ], 422);
            }
        }

        // Update allocations
        Voucher::whereBetween('id', [$data['id_start'], $data['id_end']])
            ->update(['allocation' => $data['vou_collector']]);

        $this->bustCache($request, $data['vou_collector']);

        return response()->json([
            'message' => 'Vouchers allocated successfully.'
        ]);
    }

    public function destroy(Request $request, Voucher $voucher): JsonResponse
    {
        abort_unless($request->user()->hasRole(UserRole::Admin), 403);
        
        $generatedFor = $voucher->generated_for;
        $voucher->delete();

        $this->bustCache($request, $generatedFor);

        return response()->json([
            'message' => 'Voucher deleted.'
        ]);
    }

    private function bustCache(Request $request, ?string $targetUser = null): void
    {
        $user = $request->user();
        \Illuminate\Support\Facades\Cache::forget('dashboard_staff_stats');
        \Illuminate\Support\Facades\Cache::forget('vouchers_allocations_admin');
        
        if ($user) {
            \Illuminate\Support\Facades\Cache::forget("vouchers_allocations_user_{$user->username}");
            \Illuminate\Support\Facades\Cache::forget("dashboard_pos_stats_{$user->username}");
        }
        if ($targetUser) {
            \Illuminate\Support\Facades\Cache::forget("vouchers_allocations_user_{$targetUser}");
            \Illuminate\Support\Facades\Cache::forget("dashboard_pos_stats_{$targetUser}");
        }
    }
}
