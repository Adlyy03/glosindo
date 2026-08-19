<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BackfillVisitorSnapshotSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Backfill existing visits with visitor data snapshot
        $visits = DB::table('visits')
            ->join('visitors', 'visits.visitor_id', '=', 'visitors.id')
            ->select('visits.id', 'visitors.name', 'visitors.company', 'visitors.phone')
            ->get();

        foreach ($visits as $visit) {
            DB::table('visits')
                ->where('id', $visit->id)
                ->update([
                    'visitor_name' => $visit->name,
                    'visitor_company' => $visit->company,
                    'visitor_phone' => $visit->phone,
                ]);
        }

        $this->command->info('Backfilled ' . $visits->count() . ' visit records with visitor snapshot data.');
    }
}
