<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $expiration = null;
        if ($this->last_login && $this->validity) {
            $expirationDate = $this->last_login->copy();
            if ($this->validity_unit === 'h') {
                $expiration = $expirationDate->addHours((int)$this->validity)->toDateTimeString();
            } else {
                $expiration = $expirationDate->addDays((int)$this->validity)->toDateTimeString();
            }
        }

        // Fetch MAC address and data usage from radacct table
        $latestSession = \DB::table('radacct')
            ->where('username', $this->username)
            ->orderBy('radacctid', 'desc')
            ->first();
        
        $macAddress = $latestSession ? $latestSession->callingstationid : null;
        
        $download = (float) \DB::table('radacct')
            ->where('username', $this->username)
            ->sum('acctinputoctets');
            
        $upload = (float) \DB::table('radacct')
            ->where('username', $this->username)
            ->sum('acctoutputoctets');

        return [
            'id' => $this->id,
            'username' => $this->username,
            'fullname' => $this->fullname,
            'phonenumber' => $this->phonenumber,
            'profile' => $this->profile,
            'type' => $this->type,
            'status' => $this->status,
            'address' => $this->address,
            'generated_by' => $this->generated_by,
            'generated_for' => $this->generated_for,
            'created_at' => $this->created_at,
            'last_login' => $this->last_login,
            'last_login_at' => $this->last_login,
            'batch' => $this->batch,
            'validity' => $this->validity,
            'validity_unit' => $this->validity_unit,
            'expiration' => $expiration,
            'mac_address' => $macAddress,
            'download_bytes' => $download,
            'upload_bytes' => $upload,
        ];
    }
}
