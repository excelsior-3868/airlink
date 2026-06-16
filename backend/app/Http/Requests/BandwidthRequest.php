<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;

class BandwidthRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole(UserRole::Admin) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'rate_down' => ['required', 'integer', 'min:0'],
            'rate_down_unit' => ['required', 'in:Kbps,Mbps'],
            'rate_up' => ['required', 'integer', 'min:0'],
            'rate_up_unit' => ['required', 'in:Kbps,Mbps'],
        ];
    }
}
