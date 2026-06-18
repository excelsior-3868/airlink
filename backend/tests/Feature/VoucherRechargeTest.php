<?php

use App\Enums\UserRole;
use App\Models\Bandwidth;
use App\Models\Customer;
use App\Models\Plan;
use App\Models\RadCheck;
use App\Models\RadReply;
use App\Models\Recharge;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Voucher;

beforeEach(function () {
    $this->admin = User::factory()->create(['role' => UserRole::Admin, 'status' => 'active']);
    $this->bw = Bandwidth::create([
        'name' => 'bw5', 'rate_down' => 10, 'rate_down_unit' => 'Mbps',
        'rate_up' => 5, 'rate_up_unit' => 'Mbps',
    ]);
    $this->plan = Plan::create([
        'name' => 'Daily', 'type' => 'Hotspot', 'bandwidth_id' => $this->bw->id,
        'validity' => 30, 'validity_unit' => 'Days', 'price' => 100,
        'data_usage_gb' => 2, 'router_name' => '0',
    ]);
});

test('voucher generation creates vouchers and matching customer accounts', function () {
    $this->actingAs($this->admin)
        ->post(route('vouchers.store'), [
            'plan_id' => $this->plan->id,
            'count' => 5,
            'code_length' => 6,
            'batch' => 'B1',
        ])
        ->assertRedirect(route('vouchers.index'));

    expect(Voucher::count())->toBe(5);
    expect(Customer::count())->toBe(5);

    $voucher = Voucher::first();
    expect(strlen($voucher->code))->toBe(6);
    expect($voucher->code)->toBe(strtoupper($voucher->code));
    // each voucher pre-creates a customer whose username is the code
    expect(Customer::where('username', $voucher->code)->exists())->toBeTrue();
});

test('recharge provisions RADIUS and records recharge + transaction', function () {
    $customer = Customer::factory()->create(['username' => 'sub1', 'status' => 'activate']);

    $this->actingAs($this->admin)
        ->post(route('recharge.store', $customer), [
            'plan_id' => $this->plan->id,
            'password' => 'pass123',
            'method' => 'admin',
        ])
        ->assertRedirect(route('customers.show', $customer));

    // recharge + transaction rows
    expect(Recharge::where('username', 'sub1')->where('status', 'on')->exists())->toBeTrue();
    $txn = Transaction::where('username', 'sub1')->first();
    expect($txn->invoice)->toStartWith('INV-');
    expect($txn->price)->toBe('100');

    // customer profile updated
    expect($customer->fresh()->profile)->toBe('Daily');

    // RADIUS attributes match the legacy contract
    $attrs = RadCheck::where('username', 'sub1')->pluck('value', 'attribute');
    expect($attrs['Cleartext-Password'])->toBe('pass123');
    expect($attrs['User-Profile'])->toBe('Daily');
    expect($attrs['Expire-After'])->toBe((string) (30 * 86400));
    expect($attrs['Total-Volume-Limit'])->toBe((string) (2 * 1024 * 1024 * 1024));

    $rate = \App\Models\RadGroupReply::where('groupname', 'bw5')->where('attribute', 'Mikrotik-Rate-Limit')->value('value');
    expect($rate)->toBe('5M/10M');
});

test('recharge password defaults to username when blank', function () {
    $customer = Customer::factory()->create(['username' => 'sub2']);

    $this->actingAs($this->admin)->post(route('recharge.store', $customer), [
        'plan_id' => $this->plan->id,
        'method' => 'admin',
    ])->assertRedirect();

    expect(RadCheck::where('username', 'sub2')->where('attribute', 'Cleartext-Password')->value('value'))
        ->toBe('sub2');
});

test('expire-recharges disables lapsed subscriptions and clears RADIUS', function () {
    $customer = Customer::factory()->create(['username' => 'sub3']);

    // recharge, then back-date the expiration
    app(\App\Services\RechargeService::class)->recharge($customer, $this->plan, ['method' => 'admin']);
    Recharge::where('username', 'sub3')->update([
        'expiration' => now()->subDay()->toDateString(),
        'time' => '00:00:00',
    ]);
    expect(RadCheck::where('username', 'sub3')->count())->toBeGreaterThan(0);

    $this->artisan('airlink:expire-recharges')->assertExitCode(0);

    expect(Recharge::where('username', 'sub3')->value('status'))->toBe('off');
    expect(RadCheck::where('username', 'sub3')->count())->toBe(0);
    expect(RadReply::where('username', 'sub3')->count())->toBe(0);
});

test('active subscriptions are not expired', function () {
    $customer = Customer::factory()->create(['username' => 'sub4']);
    app(\App\Services\RechargeService::class)->recharge($customer, $this->plan, ['method' => 'admin']);

    $this->artisan('airlink:expire-recharges');

    expect(Recharge::where('username', 'sub4')->value('status'))->toBe('on');
});

test('regular staff cannot generate vouchers or recharge', function () {
    $regular = User::factory()->create(['role' => UserRole::Regular, 'status' => 'active']);
    $customer = Customer::factory()->create();

    $this->actingAs($regular)->get(route('vouchers.index'))->assertForbidden();
    $this->actingAs($regular)->get(route('recharge.create', $customer))->assertForbidden();
});
