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
        // 1. Table for reservation invitation links (Personal or Mass)
        Schema::create('reservation_invitations', function (Blueprint $table) {
            $table->id();
            $table->string('token', 64)->unique()->index();
            $table->enum('type', ['personal', 'mass'])->default('personal');
            $table->string('company_name');
            $table->string('guest_name')->nullable();
            $table->string('purpose')->nullable();
            $table->string('meet_to')->nullable();
            $table->date('scheduled_date');
            $table->string('scheduled_time', 20)->nullable();
            $table->integer('quota')->default(1);
            $table->integer('used_count')->default(0);
            $table->dateTime('expires_at');
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['is_active', 'expires_at']);
        });

        // 2. Table for guest reservations (Auto approved upon complete registration + face biometric)
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invitation_id')->nullable()->constrained('reservation_invitations')->onDelete('set null');
            $table->string('reservation_code', 32)->unique()->index();
            $table->foreignId('visitor_id')->constrained('visitors')->onDelete('cascade');
            $table->string('visitor_name');
            $table->string('visitor_phone', 30)->index();
            $table->string('visitor_email')->nullable();
            $table->string('visitor_company')->nullable();
            $table->string('purpose');
            $table->string('meet_to');
            $table->date('scheduled_date')->index();
            $table->string('scheduled_time', 20)->nullable();
            $table->enum('status', ['APPROVED', 'CHECKED_IN', 'CHECKED_OUT', 'EXPIRED', 'CANCELLED'])->default('APPROVED')->index();
            $table->dateTime('approved_at');
            $table->dateTime('checked_in_at')->nullable();
            $table->dateTime('checked_out_at')->nullable();
            $table->foreignId('visit_id')->nullable()->constrained('visits')->onDelete('set null');
            $table->boolean('biometric_consent')->default(true);
            $table->boolean('has_face_registered')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['visitor_id', 'status', 'scheduled_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
        Schema::dropIfExists('reservation_invitations');
    }
};

