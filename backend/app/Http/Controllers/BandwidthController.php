<?php

namespace App\Http\Controllers;

use App\Http\Requests\BandwidthRequest;
use App\Models\Bandwidth;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BandwidthController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Bandwidth/Index', [
            'bandwidths' => Bandwidth::query()
                ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
                ->latest('id')
                ->paginate(20)
                ->withQueryString(),
            'filters' => $request->only('search'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Bandwidth/Form');
    }

    public function store(BandwidthRequest $request): RedirectResponse
    {
        Bandwidth::create($request->validated());

        return redirect()->route('bandwidth.index')->with('success', 'Bandwidth profile created.');
    }

    public function edit(Bandwidth $bandwidth): Response
    {
        return Inertia::render('Bandwidth/Form', ['bandwidth' => $bandwidth]);
    }

    public function update(BandwidthRequest $request, Bandwidth $bandwidth): RedirectResponse
    {
        $bandwidth->update($request->validated());

        return redirect()->route('bandwidth.index')->with('success', 'Bandwidth profile updated.');
    }

    public function destroy(Bandwidth $bandwidth): RedirectResponse
    {
        $bandwidth->delete();

        return redirect()->route('bandwidth.index')->with('success', 'Bandwidth profile deleted.');
    }
}
