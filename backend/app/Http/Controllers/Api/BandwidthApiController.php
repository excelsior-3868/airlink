<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BandwidthRequest;
use App\Models\Bandwidth;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BandwidthApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $bandwidths = Bandwidth::query()
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->latest('id')
            ->paginate(20)
            ->withQueryString();

        return response()->json($bandwidths);
    }

    public function store(BandwidthRequest $request): JsonResponse
    {
        $bandwidth = Bandwidth::create($request->validated());

        return response()->json([
            'message' => 'Bandwidth profile created.',
            'bandwidth' => $bandwidth
        ], 201);
    }

    public function show(Bandwidth $bandwidth): JsonResponse
    {
        return response()->json($bandwidth);
    }

    public function update(BandwidthRequest $request, Bandwidth $bandwidth): JsonResponse
    {
        $bandwidth->update($request->validated());

        return response()->json([
            'message' => 'Bandwidth profile updated.',
            'bandwidth' => $bandwidth
        ]);
    }

    public function destroy(Bandwidth $bandwidth): JsonResponse
    {
        $bandwidth->delete();

        return response()->json([
            'message' => 'Bandwidth profile deleted.'
        ]);
    }
}
