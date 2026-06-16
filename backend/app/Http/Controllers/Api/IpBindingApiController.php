<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\IpBinding;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IpBindingApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $bindings = IpBinding::query()
            ->when($request->search, fn ($q, $s) => $q->where('mac_address', 'like', "%{$s}%")->orWhere('consumer_name', 'like', "%{$s}%"))
            ->latest('id')
            ->paginate(20)
            ->withQueryString();

        return response()->json($bindings);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'mac_address' => 'required|string|max:17|unique:ip_bindings',
            'address' => 'required|ip',
            'nas' => 'required|string|max:255',
            'consumer_name' => 'required|string|max:255',
        ]);

        $data['registered_by'] = auth()->user()?->username ?? 'admin';

        $binding = IpBinding::create($data);

        return response()->json([
            'message' => 'IP Binding created successfully.',
            'binding' => $binding
        ], 201);
    }

    public function show(IpBinding $ipBinding): JsonResponse
    {
        return response()->json($ipBinding);
    }

    public function update(Request $request, IpBinding $ipBinding): JsonResponse
    {
        $data = $request->validate([
            'mac_address' => 'required|string|max:17|unique:ip_bindings,mac_address,' . $ipBinding->id,
            'address' => 'required|ip',
            'nas' => 'required|string|max:255',
            'consumer_name' => 'required|string|max:255',
        ]);

        $ipBinding->update($data);

        return response()->json([
            'message' => 'IP Binding updated successfully.',
            'binding' => $ipBinding
        ]);
    }

    public function destroy(IpBinding $ipBinding): JsonResponse
    {
        $ipBinding->delete();

        return response()->json([
            'message' => 'IP Binding deleted successfully.'
        ]);
    }
}
