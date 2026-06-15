<?php

use App\Enums\UserRole;
use App\Models\RadAcct;
use App\Models\RadPostAuth;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->create(['role' => UserRole::Admin, 'status' => 'active']);
});

test('active sessions list shows only online radacct rows', function () {
    RadAcct::create([
        'acctsessionid' => 's1', 'acctuniqueid' => 'u1', 'username' => 'online1',
        'nasipaddress' => '10.0.0.1', 'framedipaddress' => '10.1.1.5',
        'acctstarttime' => now()->subHour(), 'acctstoptime' => null,
        'acctinputoctets' => 1048576, 'acctoutputoctets' => 2097152,
    ]);
    RadAcct::create([
        'acctsessionid' => 's2', 'acctuniqueid' => 'u2', 'username' => 'closed1',
        'nasipaddress' => '10.0.0.1', 'framedipaddress' => '10.1.1.6',
        'acctstarttime' => now()->subDay(), 'acctstoptime' => now()->subHours(20),
    ]);

    $this->actingAs($this->admin)
        ->get(route('monitor.sessions'))
        ->assertOk()
        ->assertInertia(fn ($p) => $p
            ->where('online', 1)
            ->has('sessions.data', 1)
            ->where('sessions.data.0.username', 'online1')
            ->where('sessions.data.0.mb_in', 1)
            ->where('sessions.data.0.mb_out', 2));
});

test('auth logs render from radpostauth', function () {
    RadPostAuth::create(['username' => 'u1', 'pass' => '', 'reply' => 'Access-Accept', 'authdate' => now()]);
    RadPostAuth::create(['username' => 'u2', 'pass' => '', 'reply' => 'Access-Reject', 'authdate' => now()]);

    $this->actingAs($this->admin)
        ->get(route('monitor.logs'))
        ->assertOk()
        ->assertInertia(fn ($p) => $p->has('logs.data', 2));
});

test('non-admin cannot view monitoring', function () {
    $sales = User::factory()->create(['role' => UserRole::Sales, 'status' => 'active']);
    $this->actingAs($sales)->get(route('monitor.sessions'))->assertForbidden();
});
