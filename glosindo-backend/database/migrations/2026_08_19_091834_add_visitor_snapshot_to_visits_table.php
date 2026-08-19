<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('visits', function (Blueprint $table) {
            // Drop foreign key constraint first
            $table->dropForeign(['visitor_id']);
            
            // Add snapshot columns
            $table->string('visitor_name')->nullable()->after('visitor_id');
            $table->string('visitor_company')->nullable()->after('visitor_name');
            $table->string('visitor_phone')->nullable()->after('visitor_company');
            
            // Re-add foreign key with SET NULL
            $table->foreign('visitor_id')
                ->references('id')
                ->on('visitors')
                ->onDelete('set null');
            
            // Make visitor_id nullable
            $table->foreignId('visitor_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('visits', function (Blueprint $table) {
            // Drop modified foreign key
            $table->dropForeign(['visitor_id']);
            
            // Remove snapshot columns
            $table->dropColumn(['visitor_name', 'visitor_company', 'visitor_phone']);
            
            // Restore original foreign key with cascade
            $table->foreign('visitor_id')
                ->references('id')
                ->on('visitors')
                ->onDelete('cascade');
        });
    }
};
