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
        // Visits indexes for filtering
        Schema::table('visits', function (Blueprint $table) {
            $sm = Schema::getConnection()->getDoctrineSchemaManager();
            $indexesFound = $sm->listTableIndexes('visits');
            
            if (!isset($indexesFound['visits_status_index'])) {
                $table->index('status');
            }
            if (!isset($indexesFound['visits_check_in_index'])) {
                $table->index('check_in');
            }
            if (Schema::hasColumn('visits', 'event_id') && !isset($indexesFound['visits_event_id_status_index'])) {
                $table->index(['event_id', 'status']);
            }
        });

        // Events indexes
        Schema::table('events', function (Blueprint $table) {
            $sm = Schema::getConnection()->getDoctrineSchemaManager();
            $indexesFound = $sm->listTableIndexes('events');
            
            if (Schema::hasColumn('events', 'status') && !isset($indexesFound['events_status_index'])) {
                $table->index('status');
            }
            if (Schema::hasColumn('events', 'start_date') && !isset($indexesFound['events_start_date_index'])) {
                $table->index('start_date');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('visits', function (Blueprint $table) {
            $sm = Schema::getConnection()->getDoctrineSchemaManager();
            $indexesFound = $sm->listTableIndexes('visits');
            
            if (isset($indexesFound['visits_status_index'])) {
                $table->dropIndex('visits_status_index');
            }
            if (isset($indexesFound['visits_check_in_index'])) {
                $table->dropIndex('visits_check_in_index');
            }
            if (isset($indexesFound['visits_event_id_status_index'])) {
                $table->dropIndex('visits_event_id_status_index');
            }
        });

        Schema::table('events', function (Blueprint $table) {
            $sm = Schema::getConnection()->getDoctrineSchemaManager();
            $indexesFound = $sm->listTableIndexes('events');
            
            if (isset($indexesFound['events_status_index'])) {
                $table->dropIndex('events_status_index');
            }
            if (isset($indexesFound['events_start_date_index'])) {
                $table->dropIndex('events_start_date_index');
            }
        });
    }
};
