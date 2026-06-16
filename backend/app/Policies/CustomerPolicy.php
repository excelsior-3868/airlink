<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Customer;
use App\Models\User;

class CustomerPolicy
{
    /** Admins and Sales manage customers. */
    public function viewAny(User $user): bool
    {
        return $user->hasRole(UserRole::Admin, UserRole::Sales);
    }

    public function view(User $user, Customer $customer): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->hasRole(UserRole::Admin, UserRole::Sales);
    }

    public function update(User $user, Customer $customer): bool
    {
        return $user->hasRole(UserRole::Admin, UserRole::Sales);
    }

    public function delete(User $user, Customer $customer): bool
    {
        return $user->isAdmin();
    }
}
