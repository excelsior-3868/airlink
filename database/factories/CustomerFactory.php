<?php

namespace Database\Factories;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Customer>
 */
class CustomerFactory extends Factory
{
    protected $model = Customer::class;

    public function definition(): array
    {
        return [
            'username' => fake()->unique()->userName(),
            'password' => 'password', // hashed cast -> bcrypt
            'fullname' => fake()->name(),
            'phonenumber' => fake()->numerify('98########'),
            'type' => fake()->randomElement(['Hotspot', 'PPPOE']),
            'status' => 'activate',
        ];
    }
}
