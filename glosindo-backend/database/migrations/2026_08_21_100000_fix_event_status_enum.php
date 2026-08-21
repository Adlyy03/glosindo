<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, update any existing 'ongoing' values to 'active'
        DB::table('events')
            ->where('status', 'ongoing')
            ->update(['status' => 'scheduled']); // Temporary safe value
        
        // Then change enum to include 'active' instead of 'ongoing'
        DB::statement("ALTER TABLE `events` MODIFY COLUMN `status` ENUM('draft', 'scheduled', 'active', 'finished', 'cancelled') DEFAULT 'scheduled'");
        
        // Now update to 'active' if they should be
        DB::table('events')
            ->whereIn('status', ['scheduled'])
            ->update(['status' => 'active']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to 'ongoing'
        DB::statement("ALTER TABLE `events` MODIFY COLUMN `status` ENUM('draft', 'scheduled', 'ongoing', 'finished', 'cancelled') DEFAULT 'scheduled'");
    }
};
