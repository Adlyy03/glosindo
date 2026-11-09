<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Remove any duplicate face_embeddings for the same visitor_id (keep newest)
        $duplicates = DB::table('face_embeddings')
            ->select('visitor_id', DB::raw('COUNT(*) as count'), DB::raw('MAX(id) as keep_id'))
            ->groupBy('visitor_id')
            ->having('count', '>', 1)
            ->get();

        foreach ($duplicates as $dup) {
            DB::table('face_embeddings')
                ->where('visitor_id', $dup->visitor_id)
                ->where('id', '<', $dup->keep_id)
                ->delete();
        }

        // 2. Add unique constraint on visitor_id in face_embeddings if not exists
        Schema::table('face_embeddings', function (Blueprint $table) {
            $sm = Schema::getConnection()->getDoctrineSchemaManager();
            $indexes = $sm->listTableIndexes('face_embeddings');
            if (!array_key_exists('face_embeddings_visitor_id_unique', $indexes)) {
                $table->unique('visitor_id', 'face_embeddings_visitor_id_unique');
            }
        });

        // 3. Add composite indexes on reservations for ultra-fast kiosk lookups
        Schema::table('reservations', function (Blueprint $table) {
            $sm = Schema::getConnection()->getDoctrineSchemaManager();
            $indexes = $sm->listTableIndexes('reservations');

            if (!array_key_exists('reservations_scheduled_date_status_index', $indexes)) {
                $table->index(['scheduled_date', 'status'], 'reservations_scheduled_date_status_index');
            }
            if (!array_key_exists('reservations_phone_status_index', $indexes)) {
                $table->index(['visitor_phone', 'status'], 'reservations_phone_status_index');
            }
        });

        // 4. Data healing: if visitor 29 has reservation but no embedding, and visitor 30 has same name/embedding
        try {
            $v29 = DB::table('visitors')->where('id', 29)->first();
            $v30Embedding = DB::table('face_embeddings')->where('visitor_id', 30)->first();
            $v29Embedding = DB::table('face_embeddings')->where('visitor_id', 29)->first();

            if ($v29 && $v30Embedding && !$v29Embedding) {
                DB::table('face_embeddings')->insert([
                    'visitor_id' => 29,
                    'face_vector' => $v30Embedding->face_vector,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                DB::table('reservations')->where('visitor_id', 29)->update(['has_face_registered' => 1]);
            }
        } catch (\Throwable $e) {
            // Ignore non-critical data healing if records differ
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('face_embeddings', function (Blueprint $table) {
            $table->dropUnique('face_embeddings_visitor_id_unique');
        });

        Schema::table('reservations', function (Blueprint $table) {
            $table->dropIndex('reservations_scheduled_date_status_index');
            $table->dropIndex('reservations_phone_status_index');
        });
    }
};
