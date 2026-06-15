<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use App\Services\CustomerService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Read API over the SAME CustomerService the web controller uses — no logic
 * duplication. Token-protected (Sanctum) and ability-gated in routes/api.php.
 */
class CustomerApiController extends Controller
{
    public function __construct(private readonly CustomerService $customers) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $page = $this->customers->paginate($request->only('search', 'status', 'type'), 25);

        return CustomerResource::collection($page);
    }

    public function show(Customer $customer): CustomerResource
    {
        return new CustomerResource($customer);
    }
}
