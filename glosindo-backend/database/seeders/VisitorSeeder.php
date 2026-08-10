<?php

namespace Database\Seeders;

use App\Models\Visitor;
use Illuminate\Database\Seeder;

class VisitorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $visitors = [
            [
                'name' => 'Ayu Lestari',
                'phone' => '081234567890',
                'email' => 'ayu@example.com',
                'company' => 'PT Maju Bersama',
            ],
            [
                'name' => 'Budi Santoso',
                'phone' => '081234567891',
                'email' => 'budi@example.com',
                'company' => 'CV Sejahtera',
            ],
            [
                'name' => 'Citra Dewi',
                'phone' => '081234567892',
                'email' => 'citra@example.com',
                'company' => 'Bank Nusantara',
            ],
            [
                'name' => 'Dimas Pratama',
                'phone' => '081234567893',
                'email' => 'dimas@example.com',
                'company' => 'PT Global Teknologi',
            ],
            [
                'name' => 'Eka Putri',
                'phone' => '081234567894',
                'email' => 'eka@example.com',
                'company' => 'PT Inovasi Digital',
            ],
        ];

        foreach ($visitors as $visitor) {
            Visitor::updateOrCreate(
                ['email' => $visitor['email']],
                [
                    'name' => $visitor['name'],
                    'phone' => $visitor['phone'],
                    'company' => $visitor['company'],
                ]
            );
        }

        $this->command->info('Visitor seed data inserted successfully.');
    }
}
