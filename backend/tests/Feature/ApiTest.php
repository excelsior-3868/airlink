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
