<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'Admin';
    case Sales = 'Sales';
    case Regular = 'Regular';
    case Pos = 'POS';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrator',
            self::Sales => 'Sales',
            self::Regular => 'Regular',
            self::Pos => 'POS',
        };
    }

    /** Roles permitted to reach the admin/operator panel. */
    public static function staffRoles(): array
    {
        return [self::Admin, self::Sales, self::Regular, self::Pos];
    }
}
