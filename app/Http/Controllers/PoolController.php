<?php

namespace App\Http\Controllers;

use App\Http\Requests\PoolRequest;
use App\Models\Pool;
use App\Models\Router;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PoolController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Pools/Index', [
            'pools' => Pool::query()
                ->when($request->search, fn ($q, $s) => $q->where('pool_name', 'like', "%{$s}%"))
                ->latest('id')
                ->paginate(20)
                ->withQueryString(),
            'filters' => $request->only('search'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Pools/Form', ['routers' => $this->routerNames()]);
    }

    public function store(PoolRequest $request): RedirectResponse
    {
        Pool::create($request->validated());

        return redirect()->route('pools.index')->with('success', 'Pool created.');
    }

    public function edit(Pool $pool): Response
    {
        return Inertia::render('Pools/Form', [
            'pool' => $pool,
            'routers' => $this->routerNames(),
        ]);
    }

    public function update(PoolRequest $request, Pool $pool): RedirectResponse
    {
        $pool->update($request->validated());

        return redirect()->route('pools.index')->with('success', 'Pool updated.');
    }

    public function destroy(Pool $pool): RedirectResponse
    {
        $pool->delete();

        return redirect()->route('pools.index')->with('success', 'Pool deleted.');
    }

    private function routerNames(): array
    {
        return Router::orderBy('name')->pluck('name')->all();
    }
}
