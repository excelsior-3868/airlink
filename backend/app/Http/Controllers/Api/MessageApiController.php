<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $me = $request->user()->username;
        $box = $request->input('box', 'inbox');

        $query = $box === 'sent'
            ? Message::where('from_user', $me)
            : Message::where('to_user', $me);

        $messages = $query->latest('id')->paginate(20)->withQueryString();
        $unread = Message::where('to_user', $me)->where('status', '0')->count();

        return response()->json([
            'messages' => $messages,
            'box' => $box,
            'unread' => $unread
        ]);
    }

    public function recipients(): JsonResponse
    {
        return response()->json(
            User::orderBy('username')->pluck('username')->all()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'to_user' => ['required', 'string', 'max:32'],
            'title' => ['required', 'string', 'max:60'],
            'message' => ['required', 'string'],
        ]);

        $msg = Message::create([
            'from_user' => $request->user()->username,
            'to_user' => $data['to_user'],
            'title' => $data['title'],
            'message' => $data['message'],
            'is_read' => false,
            'sent_at' => now(),
        ]);

        return response()->json([
            'message' => 'Message sent.',
            'data' => $msg
        ], 201);
    }

    public function show(Request $request, Message $message): JsonResponse
    {
        // Mark read when the recipient opens it.
        if ($message->to_user === $request->user()->username && ! $message->is_read) {
            $message->update(['is_read' => true]);
        }

        return response()->json($message);
    }

    public function destroy(Message $message): JsonResponse
    {
        $message->delete();

        return response()->json([
            'message' => 'Message deleted.'
        ]);
    }
}
