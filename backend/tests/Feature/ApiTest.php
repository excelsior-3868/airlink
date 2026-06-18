<?php

use App\Enums\UserRole;
use App\Models\Bandwidth;
use App\Models\Customer;
use App\Models\Plan;
use App\Models\RadCheck;
use App\Models\User;
use Illuminate\Support\Facades\DB;

beforeEach(function () {
    $this->admin = User::factory()->create([
        'username' => 'apiadmin', 'role' => UserRole::Admin, 'status' => 'active',
        'password' => 'secret123',
    ]);
});

function apiToken($username, $password): string
{
    return test()->postJson('/api/v1/login', [
        'username' => $username,
        'password' => $password,
        'device_name' => 'pest',
    ])->json('token');
}

test('login issues a token and rejects bad credentials', function () {
    $this->postJson('/api/v1/login', ['username' => 'apiadmin', 'password' => 'secret123'])
        ->assertOk()
        ->assertJsonStructure(['token', 'user' => ['id', 'username', 'role']]);

    $this->postJson('/api/v1/login', ['username' => 'apiadmin', 'password' => 'wrong'])
        ->assertStatus(422);
});

test('protected endpoints require a token', function () {
    $this->getJson('/api/v1/customers')->assertUnauthorized();
});

test('token can list customers via the shared service', function () {
    Customer::factory()->count(3)->create();
    $token = apiToken('apiadmin', 'secret123');

    $this->withToken($token)->getJson('/api/v1/customers')
        ->assertOk()
        ->assertJsonStructure(['data' => [['id', 'username', 'status']], 'links', 'meta']);
});

test('flutter client can drive a full recharge through the API', function () {
    $bw = Bandwidth::create(['name' => 'b', 'rate_down' => 8, 'rate_down_unit' => 'Mbps', 'rate_up' => 4, 'rate_up_unit' => 'Mbps']);
    $plan = Plan::create(['name' => 'API Plan', 'type' => 'Hotspot', 'bandwidth_id' => $bw->id, 'validity' => 7, 'validity_unit' => 'Days', 'price' => 70, 'data_usage_gb' => 1, 'router_name' => '0']);
    $customer = Customer::factory()->create(['username' => 'apicust']);
    $token = apiToken('apiadmin', 'secret123');

    // list plans
    $this->withToken($token)->getJson('/api/v1/plans')
        ->assertOk()->assertJsonFragment(['name_plan' => 'API Plan']);

    // recharge
    $this->withToken($token)->postJson("/api/v1/customers/{$customer->id}/recharge", [
        'plan_id' => $plan->id,
        'method' => 'mobile',
        'password' => 'pin1234',
    ])->assertCreated()->assertJsonPath('recharge.plan_name', 'API Plan');

    // provisioning happened through the same RechargeService -> RADIUS
    expect(RadCheck::where('username', 'apicust')->where('attribute', 'Cleartext-Password')->value('value'))
        ->toBe('pin1234');
});

test('legacy crypt password is upgraded to bcrypt on API login too', function () {
    $u = User::factory()->create(['username' => 'legacyapi', 'role' => UserRole::Admin, 'status' => 'active']);
    DB::table('tbl_users')->where('id', $u->id)->update(['password' => crypt('123456', '$1$abcdefgh')]);

    $this->postJson('/api/v1/login', ['username' => 'legacyapi', 'password' => '123456'])->assertOk();

    expect($u->fresh()->password)->toStartWith('$2y$');
});

test('users options endpoint returns list of users for admin', function () {
    $token = apiToken('apiadmin', 'secret123');

    $this->withToken($token)->getJson('/api/v1/users/options')
        ->assertOk()
        ->assertJsonFragment(['username' => 'apiadmin']);
});

test('pos user can view and create their own customers', function () {
    $posUser = User::factory()->create([
        'username' => 'apipos', 'role' => UserRole::Pos, 'status' => 'active',
        'password' => 'secret123',
    ]);
    
    $token = apiToken('apipos', 'secret123');

    // Create a customer
    $this->withToken($token)->postJson('/api/v1/customers', [
        'username' => 'poscust1',
        'password' => 'secret123',
        'fullname' => 'POS Customer 1',
        'status' => 'activate',
    ])->assertCreated();

    $this->assertDatabaseHas('tbl_customers', [
        'username' => 'poscust1',
        'generated_by' => 'apipos',
        'generated_for' => 'apipos',
    ]);
});

test('admin can create customer with generated_for value', function () {
    $posUser = User::factory()->create([
        'username' => 'apipos', 'role' => UserRole::Pos, 'status' => 'active',
        'password' => 'secret123',
    ]);

    // Create a customer by admin with generated_for apipos
    $adminToken = apiToken('apiadmin', 'secret123');
    $this->withToken($adminToken)->postJson('/api/v1/customers', [
        'username' => 'poscust2',
        'password' => 'secret123',
        'fullname' => 'POS Customer 2',
        'status' => 'activate',
        'generated_for' => 'apipos',
    ])->assertCreated();

    $this->assertDatabaseHas('tbl_customers', [
        'username' => 'poscust2',
        'generated_by' => 'apiadmin',
        'generated_for' => 'apipos',
    ]);
});

test('seller wallet endpoint returns seller specific metrics', function () {
    $posUser = User::factory()->create([
        'username' => 'apipos', 'role' => UserRole::Pos, 'status' => 'active',
        'password' => 'secret123',
    ]);

    // Create wallet for the pos user
    \DB::table('wallet')->insert([
        'username' => 'apipos',
        'user_type' => 'POS',
        'credit_balance' => 1000,
        'available_balance' => 800,
    ]);

    $token = apiToken('apipos', 'secret123');

    $this->withToken($token)->getJson('/api/v1/wallet')
        ->assertOk()
        ->assertJsonFragment(['role' => 'seller'])
        ->assertJsonFragment(['available_balance' => 800]);
});

test('voucher allocation endpoint allocates voucher range', function () {
    // Generate some mock vouchers
    $v1 = \App\Models\Voucher::create([
        'code' => 'v111',
        'status' => 'active',
        'type' => 'Hotspot',
        'generated_by' => 'apiadmin',
        'generated_for' => 'apiadmin',
        'id_plan' => 1,
        'plan_id' => 1,
        'user' => '',
    ]);

    $v2 = \App\Models\Voucher::create([
        'code' => 'v222',
        'status' => 'active',
        'type' => 'Hotspot',
        'generated_by' => 'apiadmin',
        'generated_for' => 'apiadmin',
        'id_plan' => 1,
        'plan_id' => 1,
        'user' => '',
    ]);

    $token = apiToken('apiadmin', 'secret123');

    $this->withToken($token)->postJson('/api/v1/vouchers/allocate', [
        'vou_collector' => 'Collector A',
        'id_start' => $v1->id,
        'id_end' => $v2->id,
    ])->assertOk();

    expect($v1->fresh()->allocation)->toBe('Collector A');
    expect($v2->fresh()->allocation)->toBe('Collector A');

    // allocations listing
    $this->withToken($token)->getJson('/api/v1/vouchers/allocations')
        ->assertOk()
        ->assertJsonFragment(['allocation' => 'Collector A']);
});
