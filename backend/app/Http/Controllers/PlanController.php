<?php

namespace App\Http\Controllers;

use App\Http\Requests\PlanRequest;
use App\Models\Bandwidth;
use App\Models\Plan;
use App\Models\Router;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlanController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Plans/Index', [
            'plans' => Plan::query()
                ->with('bandwidth:id,name_bw')
                ->when($request->search, fn ($q, $s) => $q->where('name_plan', 'like', "%{$s}%"))
                ->when($request->type, fn ($q, $t) => $q->where('type', $t))
                ->latest('id')
                ->paginate(20)
                ->withQueryString(),
            'filters' => $request->only('search', 'type'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Plans/Form', $this->formOptions());
    }

    public function store(PlanRequest $request): RedirectResponse
    {
        Plan::create($request->validated());

        return redirect()->route('plans.index')->with('success', 'Plan created.');
    }

    public function edit(Plan $plan): Response
    {
        return Inertia::render('Plans/Form', [
            'plan' => $plan,
            ...$this->formOptions(),
        ]);
    }

    public function update(PlanRequest $request, Plan $plan): RedirectResponse
    {
        $plan->update($request->validated());

        return redirect()->route('plans.index')->with('success', 'Plan updated.');
    }

    public function destroy(Plan $plan): RedirectResponse
    {
        $plan->delete();

        return redirect()->route('plans.index')->with('success', 'Plan deleted.');
    }

    private function formOptions(): array
    {
        return [
            'bandwidths' => Bandwidth::orderBy('name_bw')->get(['id', 'name_bw']),
            'routers' => Router::orderBy('name')->pluck('name'),
        ];
    }
}
