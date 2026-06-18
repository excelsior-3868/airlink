<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', \App\Models\Customer::class) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'username' => ['required', 'string', 'max:200', Rule::unique('tbl_customers', 'username')],
            'password' => ['required', 'string', 'min:4', 'max:255'],
            'fullname' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string'],
            'phonenumber' => ['nullable', 'string', 'max:20'],
            'type' => ['nullable', 'in:Hotspot,PPPOE'],
            'profile' => ['nullable', 'string', 'max:100'],
            'status' => ['required', 'string', 'max:50'],
            'generated_for' => ['nullable', 'string', 'max:200'],
        ];
    }
}
