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
        // Add unique constraint to prevent duplicate registrations in same event
        Schema::table('event_participants', function (Blueprint $table) {
            // Drop existing index if present
            $sm = Schema::getConnection()->getDoctrineSchemaManager();
            $indexesFound = $sm->listTableIndexes('event_participants');
            
            if (isset($indexesFound['event_participants_event_id_phone_index'])) {
                $table->dropIndex('event_participants_event_id_phone_index');
            }
            
            // Add unique constraint on event_id + phone
            $table->unique(['event_id', 'phone'], 'event_participants_unique_registration');
        });

        // Add phone index to visitors for faster lookup
        Schema::table('visitors', function (Blueprint $table) {
            if (!Schema::hasColumn('visitors', 'phone')) {
                return;
            }
            
            $sm = Schema::getConnection()->getDoctrineSchemaManager();
            $indexesFound = $sm->listTableIndexes('visitors');
            
            if (!isset($indexesFound['visitors_phone_index'])) {
                $table->index('phone');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_participants', function (Blueprint $table) {
            $sm = Schema::getConnection()->getDoctrineSchemaManager();
            $indexesFound = $sm->listTableIndexes('event_participants');
            
            if (isset($indexesFound['event_participants_unique_registration'])) {
                $table->dropUnique('event_participants_unique_registration');
            }
            
            // Restore old index
            if (!isset($indexesFound['event_participants_event_id_phone_index'])) {
                $table->index(['event_id', 'phone']);
            }
        });

        Schema::table('visitors', function (Blueprint $table) {
            $sm = Schema::getConnection()->getDoctrineSchemaManager();
            $indexesFound = $sm->listTableIndexes('visitors');
            
            if (isset($indexesFound['visitors_phone_index'])) {
                $table->dropIndex('visitors_phone_index');
            }
        });
    }
};
