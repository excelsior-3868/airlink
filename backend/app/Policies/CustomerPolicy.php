<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Customer;
use App\Models\User;

class CustomerPolicy
{
    /** Admins, Sales, and POS manage customers. */
    public function viewAny(User $user): bool
    {
        return $user->hasRole(UserRole::Admin, UserRole::Sales, UserRole::Pos);
    }

    public function view(User $user, Customer $customer): bool
    {
        if ($user->hasRole(UserRole::Pos)) {
            return $customer->generated_by === $user->username;
        }
        return $user->hasRole(UserRole::Admin, UserRole::Sales);
    }

    public function create(User $user): bool
    {
        return $user->hasRole(UserRole::Admin, UserRole::Sales, UserRole::Pos);
    }

    public function update(User $user, Customer $customer): bool
    {
        if ($user->hasRole(UserRole::Pos)) {
            return $customer->generated_by === $user->username;
        }
        return $user->hasRole(UserRole::Admin, UserRole::Sales);
    }

    public function delete(User $user, Customer $customer): bool
    {
        return $user->isAdmin();
    }
}
