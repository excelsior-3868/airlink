<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;

class PoolRequest extends FormRequest
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
            'pool_name' => ['required', 'string', 'max:40'],
            'range_ip' => ['required', 'string', 'max:40'],
            'router_name' => ['required', 'string', 'max:40'],
        ];
    }
}
