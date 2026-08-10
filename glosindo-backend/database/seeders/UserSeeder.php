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
        $users = [
            [
                'name' => 'Administrator GLOSINDO',
                'email' => 'admin@glosindo.com',
                'password' => Hash::make('Admin123!'),
                'role' => 'admin',
            ],
            [
                'name' => 'Receptionist GLOSINDO',
                'email' => 'receptionist@glosindo.com',
                'password' => Hash::make('Recep123!'),
                'role' => 'receptionist',
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'password' => $user['password'],
                    'role' => $user['role'],
                ]
            );
        }

        echo "Users seeded successfully!\n";
        echo "Admin: admin@glosindo.com / Admin123!\n";
        echo "Receptionist: receptionist@glosindo.com / Recep123!\n";
    }
}
