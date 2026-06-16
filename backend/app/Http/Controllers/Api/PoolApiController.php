<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PoolRequest;
use App\Models\Pool;
use App\Models\Router;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PoolApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $pools = Pool::query()
            ->when($request->search, fn ($q, $s) => $q->where('pool_name', 'like', "%{$s}%"))
            ->latest('id')
            ->paginate(20)
            ->withQueryString();

        return response()->json($pools);
    }

    public function options(): JsonResponse
    {
        return response()->json([
            'routers' => Router::orderBy('name')->pluck('name')->all(),
        ]);
    }

    public function store(PoolRequest $request): JsonResponse
    {
        $pool = Pool::create($request->validated());

        return response()->json([
            'message' => 'Pool created.',
            'pool' => $pool
        ], 201);
    }

    public function show(Pool $pool): JsonResponse
    {
        return response()->json($pool);
    }

    public function update(PoolRequest $request, Pool $pool): JsonResponse
    {
        $pool->update($request->validated());

        return response()->json([
            'message' => 'Pool updated.',
            'pool' => $pool
        ]);
    }

    public function destroy(Pool $pool): JsonResponse
    {
        $pool->delete();

        return response()->json([
            'message' => 'Pool deleted.'
        ]);
    }
}
