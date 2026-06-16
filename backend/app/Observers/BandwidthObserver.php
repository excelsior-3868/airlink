<?php

namespace App\Observers;

use App\Models\Bandwidth;
use App\Models\RadGroupReply;

class BandwidthObserver
{
    /**
     * Handle the Bandwidth "created" event.
     */
    public function created(Bandwidth $bandwidth): void
    {
        $this->syncRadGroupReply($bandwidth);
    }

    /**
     * Handle the Bandwidth "updated" event.
     */
    public function updated(Bandwidth $bandwidth): void
    {
        // If the name changed, delete the old radgroupreply entry first
        if ($bandwidth->isDirty('name')) {
            RadGroupReply::where('groupname', $bandwidth->getOriginal('name'))->delete();
        }

        $this->syncRadGroupReply($bandwidth);
    }

    /**
     * Handle the Bandwidth "deleted" event.
     */
    public function deleted(Bandwidth $bandwidth): void
    {
        RadGroupReply::where('groupname', $bandwidth->name)->delete();
    }

    /**
     * Sync the rate limit to radgroupreply.
     */
    protected function syncRadGroupReply(Bandwidth $bandwidth): void
    {
        $rateLimit = "{$bandwidth->rate_up}M/{$bandwidth->rate_down}M";

        RadGroupReply::updateOrCreate(
            [
                'groupname' => $bandwidth->name,
                'attribute' => 'Mikrotik-Rate-Limit',
            ],
            [
                'op' => ':=',
                'value' => $rateLimit,
            ]
        );
    }
}
