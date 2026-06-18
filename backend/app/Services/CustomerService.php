<?php

namespace App\Services;

use App\Models\Customer;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * Customer business logic shared by web (Inertia) and API controllers.
 */
class CustomerService
{
    /**
     * Paginated, searchable customer listing.
     *
     * @param  array{search?:string,status?:string,type?:string,expires_before?:string}  $filters
     */
    public function paginate(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return Customer::query()
            ->when($filters['search'] ?? null, function ($q, $search) {
                $q->where(function ($q) use ($search) {
                    $q->where('username', 'like', "%{$search}%")
                        ->orWhere('fullname', 'like', "%{$search}%")
                        ->orWhere('phonenumber', 'like', "%{$search}%");
                });
            })
            ->when($filters['id'] ?? null, fn ($q, $id) => $q->where('id', $id))
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->when($filters['type'] ?? null, fn ($q, $type) => $q->where('type', $type))
            ->when($filters['expires_before'] ?? null, fn ($q, $date) => $q->where('expiration', '<=', $date))
            ->latest('id')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $data): Customer
    {
        return Customer::create($data);
    }

    public function update(Customer $customer, array $data): Customer
    {
        // Don't overwrite the password with an empty value on edit.
        if (empty($data['password'])) {
            unset($data['password']);
        }

        $customer->update($data);

        return $customer;
    }

    /** Apply a status to many customers at once (legacy Activate/Deactivate/Disable). */
    public function bulkSetStatus(array $ids, string $status): int
    {
        return Customer::whereIn('id', $ids)->update(['status' => $status]);
    }

    public function delete(Customer $customer): void
    {
        DB::transaction(function () use ($customer) {
            $customer->recharges()->delete();
            $customer->delete();
        });
    }

    /** Reset the MAC address lock for the user in the RADIUS accounting table. */
    public function resetMacBinding(Customer $customer, string $newMac): void
    {
        DB::table('radacct')
            ->where('username', $customer->username)
            ->update(['callingstationid' => $newMac]);
    }

    /** Recharge + transaction history for the detail page. */
    public function history(Customer $customer): array
    {
        return [
            'recharges' => $customer->recharges()->latest('id')->limit(50)->get(),
            'transactions' => \App\Models\Transaction::where('username', $customer->username)
                ->latest('id')->limit(50)->get(),
        ];
    }
}
