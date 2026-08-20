<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Add fields to events table
        Schema::table('events', function (Blueprint $table) {
            if (!Schema::hasColumn('events', 'code')) {
                $table->string('code', 64)->nullable()->unique()->after('id');
            }
            if (!Schema::hasColumn('events', 'start_date')) {
                $table->date('start_date')->nullable()->after('description');
            }
            if (!Schema::hasColumn('events', 'end_date')) {
                $table->date('end_date')->nullable()->after('start_date');
            }
            if (!Schema::hasColumn('events', 'registration_start_at')) {
                $table->dateTime('registration_start_at')->nullable()->after('end_time');
            }
            if (!Schema::hasColumn('events', 'registration_end_at')) {
                $table->dateTime('registration_end_at')->nullable()->after('registration_start_at');
            }
        });

        // Populate existing events data if any
        $events = DB::table('events')->get();
        foreach ($events as $evt) {
            $updates = [];
            if (empty($evt->code)) {
                $updates['code'] = 'EVT-' . strtoupper(Str::random(6));
            }
            if (empty($evt->start_date) && !empty($evt->event_date)) {
                $updates['start_date'] = $evt->event_date;
            }
            if (empty($evt->end_date) && !empty($evt->event_date)) {
                $updates['end_date'] = $evt->event_date;
            }
            if (!empty($updates)) {
                DB::table('events')->where('id', $evt->id)->update($updates);
            }
        }

        // 2. Add position to visitors table if not exists
        Schema::table('visitors', function (Blueprint $table) {
            if (!Schema::hasColumn('visitors', 'position')) {
                $table->string('position', 255)->nullable()->after('company');
            }
        });

        // 3. Create event_participants table
        if (!Schema::hasTable('event_participants')) {
            Schema::create('event_participants', function (Blueprint $table) {
                $table->id();
                $table->foreignId('event_id')->constrained('events')->onDelete('cascade');
                $table->foreignId('visitor_id')->nullable()->constrained('visitors')->onDelete('set null');
                $table->string('name');
                $table->string('phone', 30);
                $table->string('email')->nullable();
                $table->string('company')->nullable();
                $table->string('position')->nullable(); // Jabatan
                $table->string('status', 30)->default('registered'); // registered, checked_in, checked_out, cancelled
                $table->dateTime('registered_at')->nullable();
                $table->dateTime('checked_in_at')->nullable();
                $table->dateTime('checked_out_at')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
                $table->softDeletes();

                $table->index(['event_id', 'phone']);
                $table->index(['event_id', 'status']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_participants');

        Schema::table('visitors', function (Blueprint $table) {
            if (Schema::hasColumn('visitors', 'position')) {
                $table->dropColumn('position');
            }
        });

        Schema::table('events', function (Blueprint $table) {
            $cols = ['code', 'start_date', 'end_date', 'registration_start_at', 'registration_end_at'];
            foreach ($cols as $col) {
                if (Schema::hasColumn('events', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
