<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingApiController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Setting::values());
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'settings' => 'required|array',
            'settings.*' => 'nullable|string',
        ]);

        foreach ($data['settings'] as $key => $value) {
            Setting::put($key, $value);
        }

        return response()->json([
            'message' => 'Settings updated successfully.',
            'settings' => Setting::values()
        ]);
    }
}
