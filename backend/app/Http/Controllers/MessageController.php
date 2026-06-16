<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Internal staff messaging (legacy tbl_message / pm.php).
 */
class MessageController extends Controller
{
    public function index(Request $request): Response
    {
        $me = $request->user()->username;
        $box = $request->input('box', 'inbox');

        $query = $box === 'sent'
            ? Message::where('from_user', $me)
            : Message::where('to_user', $me);

        return Inertia::render('Messages/Index', [
            'messages' => $query->latest('id')->paginate(20)->withQueryString(),
            'box' => $box,
            'unread' => Message::where('to_user', $me)->where('is_read', false)->count(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Messages/Create', [
            'recipients' => User::orderBy('username')->pluck('username'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'to_user' => ['required', 'string', 'max:32'],
            'title' => ['required', 'string', 'max:60'],
            'message' => ['required', 'string'],
        ]);

        Message::create([
            'from_user' => $request->user()->username,
            'to_user' => $data['to_user'],
            'title' => $data['title'],
            'message' => $data['message'],
            'is_read' => false,
            'sent_at' => now(),
        ]);

        return redirect()->route('messages.index')->with('success', 'Message sent.');
    }

    public function show(Request $request, Message $message): Response
    {
        // Mark read when the recipient opens it.
        if ($message->to_user === $request->user()->username && ! $message->is_read) {
            $message->update(['is_read' => true]);
        }

        return Inertia::render('Messages/Show', ['message' => $message]);
    }

    public function destroy(Message $message): RedirectResponse
    {
        $message->delete();

        return redirect()->route('messages.index')->with('success', 'Message deleted.');
    }
}
