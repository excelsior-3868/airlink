<?php

use App\Enums\UserRole;
use App\Models\Message;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;

beforeEach(function () {
    $this->admin = User::factory()->create(['username' => 'admin1', 'role' => UserRole::Admin, 'status' => 'active']);
});

test('report sums revenue over a date range', function () {
    Transaction::create([
        'invoice' => 'INV-1', 'username' => 'a', 'plan_name' => 'P', 'price' => '100',
        'recharged_on' => now()->toDateString(), 'time' => '10:00:00', 'type' => 'Hotspot',
    ]);
    Transaction::create([
        'invoice' => 'INV-2', 'username' => 'b', 'plan_name' => 'P', 'price' => '250',
        'recharged_on' => now()->toDateString(), 'time' => '11:00:00', 'type' => 'PPPOE',
    ]);
    // out of range
    Transaction::create([
        'invoice' => 'INV-3', 'username' => 'c', 'plan_name' => 'P', 'price' => '999',
        'recharged_on' => now()->subYear()->toDateString(), 'time' => '11:00:00', 'type' => 'Hotspot',
    ]);

    $this->actingAs($this->admin)
        ->get(route('reports.index', ['from' => now()->toDateString(), 'to' => now()->toDateString()]))
        ->assertOk()
        ->assertInertia(fn ($p) => $p->where('summary.total', 350)->where('summary.count', 2));
});

test('admin can load wallet credit (raises credit + available)', function () {
    $this->actingAs($this->admin)->post(route('wallet.load'), [
        'username' => 'seller1',
        'amount' => 500,
        'user_type' => 'Sales',
    ])->assertRedirect(route('wallet.index'));

    $w = Wallet::where('username', 'seller1')->first();
    expect($w->credit_balance)->toBe(500);
    expect($w->available_balance)->toBe(500);

    // loading again accumulates
    $this->actingAs($this->admin)->post(route('wallet.load'), ['username' => 'seller1', 'amount' => 200]);
    expect(Wallet::where('username', 'seller1')->first()->credit_balance)->toBe(700);
});

test('staff can send and read internal messages', function () {
    $bob = User::factory()->create(['username' => 'bob', 'role' => UserRole::Sales, 'status' => 'active']);

    $this->actingAs($this->admin)->post(route('messages.store'), [
        'to_user' => 'bob',
        'title' => 'Hello',
        'message' => 'Welcome aboard',
    ])->assertRedirect(route('messages.index'));

    $msg = Message::first();
    expect($msg->from_user)->toBe('admin1');
    expect($msg->is_read)->toBeFalse();

    // bob opens it -> marked read
    $this->actingAs($bob)->get(route('messages.show', $msg))->assertOk();
    expect($msg->fresh()->is_read)->toBeTrue();
});

test('inbox shows only my received messages', function () {
    Message::create(['from_user' => 'x', 'to_user' => 'admin1', 'title' => 'mine', 'message' => 'm', 'is_read' => false, 'sent_at' => now()]);
    Message::create(['from_user' => 'x', 'to_user' => 'someoneelse', 'title' => 'theirs', 'message' => 'm', 'is_read' => false, 'sent_at' => now()]);

    $this->actingAs($this->admin)
        ->get(route('messages.index'))
        ->assertInertia(fn ($p) => $p->has('messages.data', 1)->where('unread', 1));
});

test('sales cannot access wallet (admin only)', function () {
    $sales = User::factory()->create(['role' => UserRole::Sales, 'status' => 'active']);
    $this->actingAs($sales)->get(route('wallet.index'))->assertForbidden();
});
