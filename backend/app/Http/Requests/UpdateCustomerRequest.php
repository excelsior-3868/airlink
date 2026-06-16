<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('customer')) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $customerId = $this->route('customer')->id;

        return [
            'username' => ['required', 'string', 'max:200', Rule::unique('customers', 'username')->ignore($customerId)],
            'password' => ['nullable', 'string', 'min:4', 'max:255'],
            'fullname' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string'],
            'phonenumber' => ['nullable', 'string', 'max:20'],
            'type' => ['nullable', 'in:Hotspot,PPPOE'],
            'profile' => ['nullable', 'string', 'max:100'],
            'status' => ['required', 'string', 'max:50'],
        ];
    }
}
