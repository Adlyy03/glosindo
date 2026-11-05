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
        // 1. Add event_id to game_events table to link it with standard events
        Schema::table('game_events', function (Blueprint $table) {
            if (!Schema::hasColumn('game_events', 'event_id')) {
                $table->foreignId('event_id')
                    ->nullable()
                    ->after('id')
                    ->constrained('events')
                    ->onDelete('cascade');
            }
        });

        // 2. Add title and description to point_qr_codes for QRIS / Station identification
        Schema::table('point_qr_codes', function (Blueprint $table) {
            if (!Schema::hasColumn('point_qr_codes', 'title')) {
                $table->string('title', 150)->nullable()->after('point_value');
            }
            if (!Schema::hasColumn('point_qr_codes', 'description')) {
                $table->string('description', 255)->nullable()->after('title');
            }
        });

        // 3. Add color to event_groups for visual group differentiation
        Schema::table('event_groups', function (Blueprint $table) {
            if (!Schema::hasColumn('event_groups', 'color')) {
                $table->string('color', 50)->nullable()->default('blue')->after('name');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_groups', function (Blueprint $table) {
            if (Schema::hasColumn('event_groups', 'color')) {
                $table->dropColumn('color');
            }
        });

        Schema::table('point_qr_codes', function (Blueprint $table) {
            if (Schema::hasColumn('point_qr_codes', 'description')) {
                $table->dropColumn('description');
            }
            if (Schema::hasColumn('point_qr_codes', 'title')) {
                $table->dropColumn('title');
            }
        });

        Schema::table('game_events', function (Blueprint $table) {
            if (Schema::hasColumn('game_events', 'event_id')) {
                $table->dropForeign(['event_id']);
                $table->dropColumn('event_id');
            }
        });
    }
};

