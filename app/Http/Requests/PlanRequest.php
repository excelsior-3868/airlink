<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;

class PlanRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:40'],
            'type' => ['required', 'in:Hotspot,PPPOE'],
            'bandwidth_policy' => ['nullable', 'in:Unlimited,Limited'],
            'limit_type' => ['nullable', 'in:Time_Limit,Data_Limit,Both_Limit'],
            'time_limit' => ['nullable', 'integer', 'min:0'],
            'time_unit' => ['nullable', 'in:Mins,Hrs'],
            'data_limit' => ['nullable', 'integer', 'min:0'],
            'data_unit' => ['nullable', 'in:MB,GB'],
            'bandwidth_id' => ['nullable', 'exists:bandwidths,id'],
            'price' => ['nullable', 'integer', 'min:0'],
            'data_usage_gb' => ['nullable', 'integer', 'min:0'],
            'daily_quota' => ['nullable', 'integer', 'min:0'],
            'shared_users' => ['nullable', 'integer', 'min:0'],
            'validity' => ['required', 'integer', 'min:0'],
            'validity_unit' => ['nullable', 'string', 'max:20'],
            'router_name' => ['nullable', 'string', 'max:32'],
            'pool' => ['nullable', 'string', 'max:40'],
        ];
    }
}
