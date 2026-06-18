<?php

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

/**
 * Store a raw legacy hash, bypassing the model's `hashed` cast (which would
 * otherwise re-bcrypt it). This mirrors how MigrateLegacyData inserts rows
 * verbatim via the query builder.
 */
function makeUserWithRawPassword(string $rawHash, array $attrs = []): User
{
    $user = User::factory()->create($attrs);
    DB::table('tbl_users')->where('id', $user->id)->update(['password' => $rawHash]);

    return $user->fresh();
}

test('legacy MD5-crypt password authenticates and is rehashed to bcrypt', function () {
    $user = makeUserWithRawPassword(crypt('123456', '$1$W44.ns/.'));
    expect($user->password)->toStartWith('$1$');

    $provider = Auth::createUserProvider('users');

    expect($provider->validateCredentials($user, ['password' => '123456']))->toBeTrue();

    $user->refresh();
    expect($user->password)->toStartWith('$2y$'); // upgraded to bcrypt
});

test('legacy DES-crypt password authenticates and is rehashed', function () {
    $user = makeUserWithRawPassword(crypt('secret99', 'wt')); // 13-char DES

    $provider = Auth::createUserProvider('users');

    expect($provider->validateCredentials($user, ['password' => 'secret99']))->toBeTrue();
    $user->refresh();
    expect($user->password)->toStartWith('$2y$');
});

test('wrong password is rejected for legacy hashes', function () {
    $user = makeUserWithRawPassword(crypt('123456', '$1$W44.ns/.'));

    $provider = Auth::createUserProvider('users');

    expect($provider->validateCredentials($user, ['password' => 'wrong']))->toBeFalse();
});

test('staff can log in by username via the login screen', function () {
    makeUserWithRawPassword(crypt('123456', '$1$W44.ns/.'), [
        'username' => 'operator1',
        'user_type' => App\Enums\UserRole::Admin,
        'status' => 'Active',
    ]);

    $response = $this->post('/login', [
        'username' => 'operator1',
        'password' => '123456',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('inactive staff cannot log in', function () {
    User::factory()->create([
        'username' => 'disabled1',
        'password' => 'password', // hashed cast -> bcrypt
        'status' => 'inactive',
    ]);

    $this->post('/login', ['username' => 'disabled1', 'password' => 'password']);

    $this->assertGuest();
});
