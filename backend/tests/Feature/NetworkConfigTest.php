<?php

use App\Enums\UserRole;
use App\Models\Bandwidth;
use App\Models\Plan;
use App\Models\Router;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->create(['role' => UserRole::Admin, 'status' => 'active']);
    $this->sales = User::factory()->create(['role' => UserRole::Sales, 'status' => 'active']);
});

test('admin can create a bandwidth profile', function () {
    $this->actingAs($this->admin)
        ->post(route('bandwidth.store'), [
            'name' => '10M Plan',
            'rate_down' => 10,
            'rate_down_unit' => 'Mbps',
            'rate_up' => 5,
            'rate_up_unit' => 'Mbps',
        ])
        ->assertRedirect(route('bandwidth.index'));

    $this->assertDatabaseHas('tbl_bandwidth', ['name_bw' => '10M Plan', 'rate_down' => 10]);
});

test('router secret is stored encrypted', function () {
    $this->actingAs($this->admin)->post(route('routers.store'), [
        'name' => 'core-router',
        'ip_address' => '10.0.0.1',
        'username' => 'apiuser',
        'password' => 'super-secret',
        'api_port' => 8728,
    ])->assertRedirect();

    $router = Router::where('name', 'core-router')->first();
    expect($router->password)->toBe('super-secret'); // decrypted accessor
    // raw column is ciphertext, not the plaintext
    $raw = \DB::table('tbl_routers')->where('id', $router->id)->value('password');
    expect($raw)->not->toBe('super-secret');
});

test('plan links to a bandwidth profile', function () {
    $bw = Bandwidth::create([
        'name' => 'bw1', 'rate_down' => 5, 'rate_down_unit' => 'Mbps',
        'rate_up' => 5, 'rate_up_unit' => 'Mbps',
    ]);

    $this->actingAs($this->admin)->post(route('plans.store'), [
        'name' => 'Daily Pack',
        'type' => 'Hotspot',
        'bandwidth_id' => $bw->id,
        'validity' => 1,
        'validity_unit' => 'Days',
        'price' => 50,
    ])->assertRedirect(route('plans.index'));

    $plan = Plan::where('name_plan', 'Daily Pack')->first();
    expect($plan->bandwidth->name)->toBe('bw1');
});

test('admin can create and delete a pool', function () {
    $this->actingAs($this->admin)->post(route('pools.store'), [
        'pool_name' => 'hs-pool',
        'range_ip' => '192.168.88.2-192.168.88.254',
        'router_name' => 'core-router',
    ])->assertRedirect(route('pools.index'));

    $pool = \App\Models\Pool::where('pool_name', 'hs-pool')->first();
    $this->actingAs($this->admin)
        ->delete(route('pools.destroy', $pool))
        ->assertRedirect(route('pools.index'));
    $this->assertDatabaseMissing('tbl_pool', ['id' => $pool->id]);
});

test('sales role cannot manage network config (admin only)', function () {
    $this->actingAs($this->sales)->get(route('bandwidth.index'))->assertForbidden();
    $this->actingAs($this->sales)->get(route('plans.index'))->assertForbidden();
    $this->actingAs($this->sales)->get(route('routers.index'))->assertForbidden();
});

test('admin can list each network module', function () {
    foreach (['bandwidth.index', 'plans.index', 'routers.index', 'pools.index'] as $r) {
        $this->actingAs($this->admin)->get(route($r))->assertOk();
    }
});
