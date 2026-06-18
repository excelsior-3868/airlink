<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
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
        ];
    }
}
