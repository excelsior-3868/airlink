<?php

namespace App\Http\Controllers;

use App\Http\Requests\RouterRequest;
use App\Models\Router;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RouterController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Routers/Index', [
            'routers' => Router::query()
                ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
                ->latest('id')
                ->paginate(20)
                ->withQueryString()
                ->through(fn (Router $r) => [
                    'id' => $r->id,
                    'name' => $r->name,
                    'ip_address' => $r->ip_address,
                    'username' => $r->username,
                    'api_port' => $r->api_port,
                    'use_ssl' => $r->use_ssl,
                    'description' => $r->description,
                ]),
            'filters' => $request->only('search'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Routers/Form');
    }

    public function store(RouterRequest $request): RedirectResponse
    {
        Router::create($request->validated());

        return redirect()->route('routers.index')->with('success', 'Router created.');
    }

    public function edit(Router $router): Response
    {
        return Inertia::render('Routers/Form', [
            'router' => [
                'id' => $router->id,
                'name' => $router->name,
                'ip_address' => $router->ip_address,
                'username' => $router->username,
                'api_port' => $router->api_port,
                'use_ssl' => $router->use_ssl,
                'description' => $router->description,
            ],
        ]);
    }

    public function update(RouterRequest $request, Router $router): RedirectResponse
    {
        $data = $request->validated();
        if (empty($data['password'])) {
            unset($data['password']);
        }
        $router->update($data);

        return redirect()->route('routers.index')->with('success', 'Router updated.');
    }

    public function destroy(Router $router): RedirectResponse
    {
        $router->delete();

        return redirect()->route('routers.index')->with('success', 'Router deleted.');
    }
}
