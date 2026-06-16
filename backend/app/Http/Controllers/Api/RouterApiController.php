<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RouterRequest;
use App\Models\Router;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RouterApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $routers = Router::query()
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->latest('id')
            ->paginate(20)
            ->withQueryString();

        return response()->json($routers);
    }

    public function store(RouterRequest $request): JsonResponse
    {
        $router = Router::create($request->validated());

        return response()->json([
            'message' => 'Router created.',
            'router' => $router
        ], 201);
    }

    public function show(Router $router): JsonResponse
    {
        return response()->json($router);
    }

    public function update(RouterRequest $request, Router $router): JsonResponse
    {
        $data = $request->validated();
        if (empty($data['password'])) {
            unset($data['password']);
        }
        $router->update($data);

        return response()->json([
            'message' => 'Router updated.',
            'router' => $router
        ]);
    }

    public function destroy(Router $router): JsonResponse
    {
        $router->delete();

        return response()->json([
            'message' => 'Router deleted.'
        ]);
    }
}
