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
        $isSqlite = DB::getDriverName() === 'sqlite';
        $expirySql = $isSqlite 
            ? "CASE validity_unit WHEN 'h' THEN datetime(last_login, '+' || validity || ' hours') ELSE datetime(last_login, '+' || validity || ' days') END"
            : "CASE validity_unit WHEN 'h' THEN DATE_ADD(last_login, INTERVAL validity HOUR) ELSE DATE_ADD(last_login, INTERVAL validity DAY) END";

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
            ->when($filters['expires_before'] ?? null, function ($q, $date) use ($expirySql) {
                $dateTimeString = strlen($date) === 10 ? "{$date} 23:59:59" : $date;
                $q->whereRaw("{$expirySql} <= ?", [$dateTimeString]);
            })
            ->when($filters['expiry_range'] ?? null, function ($q, $range) use ($expirySql) {
                if ($range === 'all') {
                    return;
                }
                if ($range === 'expired') {
                    $q->whereRaw("{$expirySql} < ?", [now()->toDateTimeString()]);
                } elseif (in_array((string)$range, ['1', '3', '7', '14', '30'], true)) {
                    $days = (int)$range;
                    $q->whereRaw("{$expirySql} >= ? AND {$expirySql} <= ?", [
                        now()->toDateTimeString(),
                        now()->addDays($days)->toDateTimeString()
                    ]);
                }
            })
            ->when($filters['generated_by'] ?? null, fn ($q, $gb) => $q->where('generated_by', $gb))
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
