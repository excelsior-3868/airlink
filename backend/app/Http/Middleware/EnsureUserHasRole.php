<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Route guard: allow only staff with one of the given roles.
 * Usage: ->middleware('role:admin,sales')
 */
class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(403);
        }

        $allowed = array_map(function (string $r) {
            $mapped = match (strtolower($r)) {
                'admin' => UserRole::Admin,
                'sales' => UserRole::Sales,
                'regular' => UserRole::Regular,
                'pos' => UserRole::Pos,
                default => null,
            };
            return $mapped ?? UserRole::from($r);
        }, $roles);

        if ($roles !== [] && ! $user->hasRole(...$allowed)) {
            abort(403);
        }

        return $next($request);
    }
}
