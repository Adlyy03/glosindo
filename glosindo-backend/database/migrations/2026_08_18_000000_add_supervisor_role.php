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
        // Modify enum to add supervisor role
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'receptionist', 'supervisor') NOT NULL DEFAULT 'receptionist'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove supervisor role from enum
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'receptionist') NOT NULL DEFAULT 'receptionist'");
    }
};
