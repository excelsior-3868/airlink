<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RouterRequest extends FormRequest
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
        $id = $this->route('router')?->id;

        return [
            'name' => ['required', 'string', 'max:32', Rule::unique('routers', 'name')->ignore($id)],
            'ip_address' => ['required', 'string', 'max:128'],
            'username' => ['required', 'string', 'max:50'],
            'password' => [$id ? 'nullable' : 'required', 'string', 'max:255'],
            'api_port' => ['nullable', 'integer', 'min:1', 'max:65535'],
            'use_ssl' => ['boolean'],
            'description' => ['nullable', 'string', 'max:100'],
        ];
    }
}
