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
        // 1. game_events - Event khusus games dengan kelompok & poin
        Schema::create('game_events', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['draft', 'active', 'completed'])->default('draft');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('start_date');
        });

        // 2. event_groups - Kelompok per game event
        Schema::create('event_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_event_id')->constrained('game_events')->onDelete('cascade');
            $table->string('name'); // Nama kelompok: Merah, Biru, Hijau, dst
            $table->string('code', 32)->unique(); // Unique code untuk identifikasi
            $table->string('register_token', 64)->unique(); // Token buat link register
            $table->timestamps();

            $table->index(['game_event_id', 'code']);
        });

        // 3. group_participants - Peserta per kelompok
        Schema::create('group_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_group_id')->constrained('event_groups')->onDelete('cascade');
            $table->string('name');
            $table->string('phone', 30);
            $table->string('email')->nullable();
            $table->dateTime('registered_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Constraint: satu phone cuma bisa 1x per kelompok
            $table->unique(['event_group_id', 'phone']);
            $table->index(['event_group_id', 'phone']);
        });

        // 4. point_qr_codes - QR Code poin
        Schema::create('point_qr_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_event_id')->constrained('game_events')->onDelete('cascade');
            $table->integer('point_value'); // 10, 20, 30, ..., 100
            $table->string('token', 64)->unique(); // Token QR unik
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();

            $table->index(['game_event_id', 'status']);
            $table->index('token');
        });

        // 5. point_transactions - Histori transaksi poin (SOURCE OF TRUTH)
        Schema::create('point_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_event_id')->constrained('game_events')->onDelete('cascade');
            $table->foreignId('event_group_id')->constrained('event_groups')->onDelete('cascade');
            $table->foreignId('group_participant_id')->constrained('group_participants')->onDelete('cascade');
            $table->foreignId('point_qr_code_id')->constrained('point_qr_codes')->onDelete('cascade');
            $table->integer('points'); // Nilai poin yg didapat
            $table->timestamp('scanned_at'); // Waktu scan
            $table->timestamps();

            // Constraint: prevent duplicate scan (participant + qr_code harus unique)
            $table->unique(['group_participant_id', 'point_qr_code_id'], 'unique_participant_qr_scan');
            
            $table->index(['game_event_id', 'scanned_at']);
            $table->index(['event_group_id']);
            $table->index(['group_participant_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('point_transactions');
        Schema::dropIfExists('point_qr_codes');
        Schema::dropIfExists('group_participants');
        Schema::dropIfExists('event_groups');
        Schema::dropIfExists('game_events');
    }
};
