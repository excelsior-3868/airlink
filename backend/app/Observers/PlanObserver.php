<?php

namespace App\Observers;

use App\Models\Plan;
use App\Models\RadUserGroup;

class PlanObserver
{
    /**
     * Handle the Plan "created" event.
     */
    public function created(Plan $plan): void
    {
        $this->syncRadUserGroup($plan);
    }

    /**
     * Handle the Plan "updated" event.
     */
    public function updated(Plan $plan): void
    {
        if ($plan->isDirty('name')) {
            RadUserGroup::where('username', $plan->getOriginal('name'))->delete();
        }

        $this->syncRadUserGroup($plan);
    }

    /**
     * Handle the Plan "deleted" event.
     */
    public function deleted(Plan $plan): void
    {
        RadUserGroup::where('username', $plan->name)->delete();
    }

    /**
     * Sync the group to radusergroup.
     */
    protected function syncRadUserGroup(Plan $plan): void
    {
        // Only map if the plan has a bandwidth profile attached
        if (!$plan->bandwidth_id) {
            return;
        }

        // Load bandwidth if not already loaded
        if (!$plan->relationLoaded('bandwidth')) {
            $plan->load('bandwidth');
        }

        if ($plan->bandwidth) {
            RadUserGroup::updateOrCreate(
                [
                    'username' => $plan->name,
                ],
                [
                    'groupname' => $plan->bandwidth->name,
                    'priority' => 1,
                ]
            );
        }
    }
}
