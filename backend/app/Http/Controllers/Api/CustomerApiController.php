<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use App\Services\CustomerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CustomerApiController extends Controller
{
    public function __construct(private readonly CustomerService $customers) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $page = $this->customers->paginate($request->only('search', 'status', 'type', 'id', 'expires_before'), 25);

        return CustomerResource::collection($page);
    }

    public function store(StoreCustomerRequest $request): JsonResponse
    {
        $this->authorize('create', Customer::class);

        $customer = $this->customers->create($request->validated());

        return response()->json([
            'message' => 'Customer created.',
            'customer' => new CustomerResource($customer)
        ], 201);
    }

    public function show(Customer $customer): JsonResponse
    {
        $this->authorize('view', $customer);

        return response()->json([
            'customer' => new CustomerResource($customer),
            'history' => $this->customers->history($customer)
        ]);
    }

    public function update(UpdateCustomerRequest $request, Customer $customer): JsonResponse
    {
        $this->authorize('update', $customer);

        $this->customers->update($customer, $request->validated());

        return response()->json([
            'message' => 'Customer updated.',
            'customer' => new CustomerResource($customer->fresh())
        ]);
    }

    public function bulkAction(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Customer::class);

        $data = $request->validate([
            'action' => 'required|in:activate,deactivate,disable',
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer',
        ]);

        $count = $this->customers->bulkSetStatus($data['ids'], $data['action']);

        return response()->json([
            'message' => "{$count} customer(s) set to {$data['action']}."
        ]);
    }

    public function destroy(Customer $customer): JsonResponse
    {
        $this->authorize('delete', $customer);

        $this->customers->delete($customer);

        return response()->json([
            'message' => 'Customer deleted.'
        ]);
    }

    public function resetMac(Request $request, Customer $customer): JsonResponse
    {
        $this->authorize('update', $customer);

        $data = $request->validate([
            'mac_address' => 'required|string|max:17',
        ]);

        $this->customers->resetMacBinding($customer, $data['mac_address']);

        return response()->json([
            'message' => 'MAC address binding updated.'
        ]);
    }
}
