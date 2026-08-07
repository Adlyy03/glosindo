<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Create admin user
        User::create([
            'name' => 'Administrator GLOSINDO',
            'email' => 'admin@glosindo.com',
            'password' => Hash::make('Admin123!'),
            'role' => 'admin',
        ]);

        // Create receptionist user
        User::create([
            'name' => 'Receptionist',
            'email' => 'receptionist@glosindo.com',
            'password' => Hash::make('Recep123!'),
            'role' => 'receptionist',
        ]);

        echo "Users seeded successfully!\n";
        echo "Admin: admin@glosindo.com / Admin123!\n";
        echo "Receptionist: receptionist@glosindo.com / Recep123!\n";
    }
}
