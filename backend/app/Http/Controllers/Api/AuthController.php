<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

/**
 * Token auth for the JSON API (Flutter et al.). Reuses LegacyEloquentUserProvider,
 * so a first API login against a legacy crypt() password upgrades it to bcrypt too.
 */
class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
            'device_name' => ['nullable', 'string'],
        ]);

        $user = User::where('username', $data['username'])->first();
        $provider = Auth::createUserProvider('users');

        if (! $user
            || ! $provider->validateCredentials($user, ['password' => $data['password']])
            || ! $user->isActive()
            || ! $user->hasRole(...UserRole::staffRoles())
        ) {
            throw ValidationException::withMessages(['username' => ['Invalid credentials.']]);
        }

        $token = $user->createToken($data['device_name'] ?? 'api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'name' => $user->name,
                'role' => $user->role->value,
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $u = $request->user();

        return response()->json([
            'id' => $u->id,
            'username' => $u->username,
            'name' => $u->name,
            'role' => $u->role->value,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }
}
