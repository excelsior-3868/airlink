<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\State;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CMSStateController extends Controller
{
    public function index(): JsonResponse
    {
        $states = State::orderBy('stateName', 'asc')->get();
        return response()->json($states);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'stateName' => 'required|string|unique:state,stateName',
            'stateDescription' => 'required|string',
        ]);

        $state = State::create([
            'stateName' => $data['stateName'],
            'stateDescription' => $data['stateDescription'],
            'postingDate' => now(),
        ]);

        return response()->json([
            'message' => 'State created successfully.',
            'state' => $state,
        ], 210);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $state = State::find($id);
        if (! $state) {
            return response()->json(['message' => 'State not found.'], 404);
        }

        $data = $request->validate([
            'stateName' => 'required|string|unique:state,stateName,' . $id,
            'stateDescription' => 'required|string',
        ]);

        $state->update([
            'stateName' => $data['stateName'],
            'stateDescription' => $data['stateDescription'],
            'updationDate' => now(),
        ]);

        return response()->json([
            'message' => 'State updated successfully.',
            'state' => $state,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $state = State::find($id);
        if (! $state) {
            return response()->json(['message' => 'State not found.'], 404);
        }
        $state->delete();

        return response()->json(['message' => 'State deleted successfully.']);
    }
}
