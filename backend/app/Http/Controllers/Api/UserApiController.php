<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Enums\UserRole;

class UserApiController extends Controller
{
    public function options(Request $request): JsonResponse
    {
        $users = User::query()
            ->orderBy('username')
            ->get(['username', 'fullname']);

        return response()->json($users);
    }

    public function index(Request $request): JsonResponse
    {
        $users = User::query()
            ->when($request->search, fn ($q, $s) => $q->where('username', 'like', "%{$s}%")->orWhere('name', 'like', "%{$s}%"))
            ->latest('id')
            ->paginate(20)
            ->withQueryString();

        return response()->json($users);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'username' => 'required|string|max:255|unique:tbl_users,username',
            'name' => 'required|string|max:255',
            'password' => 'required|string|min:4',
            'role' => ['required', Rule::enum(UserRole::class)],
            'status' => 'required|in:Active,Inactive,active,inactive',
        ]);

        $data['status'] = ucfirst(strtolower($data['status']));
        $user = User::create($data);

        return response()->json([
            'message' => 'Administrator user created.',
            'user' => $user
        ], 201);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json($user);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'username' => ['required', 'string', 'max:255', Rule::unique('tbl_users', 'username')->ignore($user->id)],
            'name' => 'required|string|max:255',
            'password' => 'nullable|string|min:4',
            'role' => ['required', Rule::enum(UserRole::class)],
            'status' => 'required|in:Active,Inactive,active,inactive',
        ]);

        $data['status'] = ucfirst(strtolower($data['status']));

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->update($data);

        return response()->json([
            'message' => 'Administrator user updated.',
            'user' => $user->fresh()
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        // Prevent deleting the last admin
        if ($user->isAdmin() && User::where('role', UserRole::Admin->value)->count() <= 1) {
            return response()->json([
                'message' => 'Cannot delete the last administrator.'
            ], 403);
        }

        // Prevent deleting yourself
        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'Cannot delete your own account.'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'Administrator user deleted.'
        ]);
    }
}
