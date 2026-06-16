<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Plan;
use App\Models\Voucher;
use Illuminate\Support\Facades\DB;

/**
 * Voucher generation. Mirrors legacy hotspot.php: codes are
 * strtoupper(substr(md5(time().rand), 0, length)); each voucher also pre-creates
 * a customer row whose username is the voucher code.
 */
class VoucherService
{
    /**
     * @return int number of vouchers created
     */
    public function generate(Plan $plan, int $count, int $codeLength, array $meta = []): int
    {
        $type = $plan->type;
        $router = $meta['router_name'] ?? ($plan->router_name ?: '0');
        $batch = $meta['batch'] ?? ('batch-' . now()->format('YmdHis'));
        $generatedBy = $meta['generated_by'] ?? 'admin';
        $generatedFor = $meta['generated_for'] ?? null;

        $created = 0;

        DB::transaction(function () use ($plan, $count, $codeLength, $type, $router, $batch, $generatedBy, $generatedFor, &$created) {
            for ($i = 0; $i < $count; $i++) {
                $code = $this->uniqueCode($codeLength);

                Voucher::create([
                    'type' => $type,
                    'router_name' => $router,
                    'plan_id' => $plan->id,
                    'code' => $code,
                    'batch' => $batch,
                    'user' => '0',
                    'status' => '0',
                    'generated_by' => $generatedBy,
                    'generated_for' => $generatedFor,
                    'issued_on' => now()->toDateString(),
                    'user_status' => 'activate',
                ]);

                // Legacy pre-creates a customer account per voucher (username == code).
                Customer::create([
                    'username' => $code,
                    'password' => $code,            // hashed by cast; RADIUS uses code as plaintext
                    'profile' => $plan->name,
                    'type' => $type,
                    'batch' => $batch,
                    'generated_by' => $generatedBy,
                    'generated_for' => $generatedFor,
                    'status' => 'activate',
                ]);

                $created++;
            }
        });

        return $created;
    }

    private function uniqueCode(int $length): string
    {
        do {
            // mt_rand replaces legacy rand(); time-seeded md5 slice, uppercased.
            $code = strtoupper(substr(md5(microtime() . mt_rand(10000, 99999)), 0, $length));
        } while (Voucher::where('code', $code)->exists() || Customer::where('username', $code)->exists());

        return $code;
    }
}
