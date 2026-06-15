<?php

use App\Enums\UserRole;
use App\Models\Customer;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->create(['role' => UserRole::Admin, 'status' => 'active']);
});

test('admin can list customers', function () {
    Customer::factory()->count(3)->create();

    $this->actingAs($this->admin)
        ->get(route('customers.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Customers/Index')
            ->has('customers.data', 3));
});

test('search filters customers by username', function () {
    Customer::factory()->create(['username' => 'alice_target']);
    Customer::factory()->create(['username' => 'bob_other']);

    $this->actingAs($this->admin)
        ->get(route('customers.index', ['search' => 'alice']))
        ->assertInertia(fn ($page) => $page->has('customers.data', 1));
});

test('admin can create a customer', function () {
    $this->actingAs($this->admin)
        ->post(route('customers.store'), [
            'username' => 'newcust',
            'password' => 'secret123',
            'fullname' => 'New Cust',
            'status' => 'activate',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('customers', ['username' => 'newcust']);

    // password stored hashed (bcrypt), never plaintext
    $c = Customer::where('username', 'newcust')->first();
    expect($c->password)->not->toBe('secret123')->toStartWith('$2y$');
});

test('admin can update a customer without changing password when blank', function () {
    $customer = Customer::factory()->create(['username' => 'edit_me']);
    $originalPassword = $customer->password;

    $this->actingAs($this->admin)
        ->put(route('customers.update', $customer), [
            'username' => 'edit_me',
            'password' => '',
            'fullname' => 'Updated Name',
            'status' => 'activate',
        ])
        ->assertRedirect();

    $customer->refresh();
    expect($customer->fullname)->toBe('Updated Name');
    expect($customer->password)->toBe($originalPassword);
});

test('admin can delete a customer', function () {
    $customer = Customer::factory()->create();

    $this->actingAs($this->admin)
        ->delete(route('customers.destroy', $customer))
        ->assertRedirect(route('customers.index'));

    $this->assertDatabaseMissing('customers', ['id' => $customer->id]);
});

test('bulk action sets status on selected customers', function () {
    $a = Customer::factory()->create(['status' => 'activate']);
    $b = Customer::factory()->create(['status' => 'activate']);

    $this->actingAs($this->admin)
        ->post(route('customers.bulk-action'), [
            'action' => 'deactivate',
            'ids' => [$a->id, $b->id],
        ])
        ->assertRedirect();

    expect($a->fresh()->status)->toBe('deactivate');
    expect($b->fresh()->status)->toBe('deactivate');
});

test('search by id finds a customer', function () {
    $c = Customer::factory()->create();

    $this->actingAs($this->admin)
        ->get(route('customers.index', ['id' => $c->id]))
        ->assertInertia(fn ($page) => $page->has('customers.data', 1));
});

test('regular role cannot access customers', function () {
    $regular = User::factory()->create(['role' => UserRole::Regular, 'status' => 'active']);

    $this->actingAs($regular)
        ->get(route('customers.index'))
        ->assertForbidden();
});

test('guests are redirected to login', function () {
    $this->get(route('customers.index'))->assertRedirect(route('login'));
});
