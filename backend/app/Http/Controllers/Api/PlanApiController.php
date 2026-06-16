<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PlanRequest;
use App\Models\Bandwidth;
use App\Models\Plan;
use App\Models\Router;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlanApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $plans = Plan::query()
            ->with('bandwidth:id,name')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->type, fn ($q, $t) => $q->where('type', $t))
            ->latest('id')
            ->paginate(20)
            ->withQueryString();

        return response()->json($plans);
    }

    public function options(): JsonResponse
    {
        return response()->json([
            'bandwidths' => Bandwidth::orderBy('name')->get(['id', 'name']),
            'routers' => Router::orderBy('name')->pluck('name')->all(),
        ]);
    }

    public function store(PlanRequest $request): JsonResponse
    {
        $plan = Plan::create($request->validated());

        return response()->json([
            'message' => 'Plan created.',
            'plan' => $plan
        ], 201);
    }

    public function show(Plan $plan): JsonResponse
    {
        $plan->load('bandwidth');
        return response()->json($plan);
    }

    public function update(PlanRequest $request, Plan $plan): JsonResponse
    {
        $plan->update($request->validated());

        return response()->json([
            'message' => 'Plan updated.',
            'plan' => $plan
        ]);
    }

    public function destroy(Plan $plan): JsonResponse
    {
        $plan->delete();

        return response()->json([
            'message' => 'Plan deleted.'
        ]);
    }
}
