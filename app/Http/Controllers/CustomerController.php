<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Models\Customer;
use App\Services\CustomerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function __construct(private readonly CustomerService $customers)
    {
    }

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Customer::class);

        return Inertia::render('Customers/Index', [
            'customers' => $this->customers->paginate(
                $request->only('search', 'status', 'type', 'id'),
            ),
            'filters' => $request->only('search', 'status', 'type', 'id'),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Customer::class);

        return Inertia::render('Customers/Create');
    }

    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        $customer = $this->customers->create($request->validated());

        return redirect()
            ->route('customers.show', $customer)
            ->with('success', 'Customer created.');
    }

    public function show(Customer $customer): Response
    {
        $this->authorize('view', $customer);

        return Inertia::render('Customers/Show', [
            'customer' => $customer,
            ...$this->customers->history($customer),
        ]);
    }

    public function edit(Customer $customer): Response
    {
        $this->authorize('update', $customer);

        return Inertia::render('Customers/Edit', [
            'customer' => $customer,
        ]);
    }

    public function update(UpdateCustomerRequest $request, Customer $customer): RedirectResponse
    {
        $this->customers->update($customer, $request->validated());

        return redirect()
            ->route('customers.show', $customer)
            ->with('success', 'Customer updated.');
    }

    public function bulkAction(Request $request): RedirectResponse
    {
        $this->authorize('viewAny', Customer::class);

        $data = $request->validate([
            'action' => 'required|in:activate,deactivate,disable',
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer',
        ]);

        $count = $this->customers->bulkSetStatus($data['ids'], $data['action']);

        return back()->with('success', "{$count} customer(s) set to {$data['action']}.");
    }

    public function destroy(Customer $customer): RedirectResponse
    {
        $this->authorize('delete', $customer);

        $this->customers->delete($customer);

        return redirect()
            ->route('customers.index')
            ->with('success', 'Customer deleted.');
    }
}
