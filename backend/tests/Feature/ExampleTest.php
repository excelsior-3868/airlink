<?php

it('redirects guests from the root to the login screen', function () {
    $this->get('/')->assertRedirect(route('login'));
});

it('redirects authenticated staff from the root to the dashboard', function () {
    $user = App\Models\User::factory()->create();

    $this->actingAs($user)->get('/')->assertRedirect(route('dashboard'));
});
