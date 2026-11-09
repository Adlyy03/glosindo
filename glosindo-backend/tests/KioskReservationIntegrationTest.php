<?php

namespace Tests;

use App\Models\FaceEmbedding;
use App\Models\Reservation;
use App\Models\ReservationInvitation;
use App\Models\Visit;
use App\Models\Visitor;
use App\Services\BiometricReservationService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class KioskReservationIntegrationTest extends TestCase
{
    private function generateSampleVector(float $base = 0.1): array
    {
        $vector = [];
        for ($i = 0; $i < 128; $i++) {
            $vector[] = round($base + ($i * 0.001), 4);
        }
        return $vector;
    }

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    /**
     * Skenario 1: Satu Identitas Wajah Untuk Satu Orang (Single Biometric Identity).
     * Pak Agus berkunjung sebagai tamu biasa. Kemudian membuat reservasi online.
     * Sistem harus menggunakan visitor_id yang sama dan tidak menduplikasi data biometrik.
     */
    public function test_single_identity_reuses_existing_visitor()
    {
        $bioService = app(BiometricReservationService::class);
        $vectorAgus = $this->generateSampleVector(0.05);

        // 1. Pak Agus datang pertama kali sebagai tamu biasa
        $regResult = $bioService->resolveOrCreateVisitor(
            $vectorAgus,
            [
                'name' => 'Agus Pratama',
                'phone' => '081234567890',
                'company' => 'PT Mandiri Sejahtera',
            ]
        );
        $visitorAwal = $regResult['visitor'];
        $this->assertNotNull($visitorAwal->id);

        // 2. Kemudian Pak Agus mengisi form reservasi dengan nomor berbeda sedikit
        $vectorAgusSlight = $this->generateSampleVector(0.0505); // Kemiripan sangat tinggi (<0.01)
        $resResult = $bioService->resolveOrCreateVisitor(
            $vectorAgusSlight,
            [
                'name' => 'Agus Pratama',
                'phone' => '081234567899',
                'company' => 'PT Mandiri Sejahtera',
            ]
        );
        $visitorKedua = $resResult['visitor'];

        // Harus mereferensikan orang yang sama (Single Identity)!
        $this->assertEquals($visitorAwal->id, $visitorKedua->id, 'Visitor ID harus sama untuk orang dengan biometrik yang sama');
        $this->assertTrue($resResult['is_existing']);
        $this->assertEquals('biometric_face', $resResult['matched_via']);

        // Embedding di DB harus tetap 1 per visitor
        $embeddingCount = FaceEmbedding::where('visitor_id', $visitorAwal->id)->count();
        $this->assertEquals(1, $embeddingCount, 'Data biometrik tidak boleh digandakan');
    }

    /**
     * Skenario 2: Alur Kiosk - Reservasi Ditemukan & Auto Check-in.
     * Ketika tamu scan wajah di kiosk dan reservasi valid untuk hari ini,
     * sistem langsung melakukan check-in dan menampilkan ucapan selamat datang.
     */
    public function test_kiosk_scan_identifies_and_auto_checkins_approved_reservation()
    {
        $bioService = app(BiometricReservationService::class);
        $vectorBudi = $this->generateSampleVector(0.20);

        // 1. Buat identitas pengunjung
        $visitor = Visitor::create([
            'name' => 'Budi Santoso',
            'phone' => '085712345678',
            'company' => 'PT Teknologi Nusantara',
        ]);
        FaceEmbedding::updateOrCreate(
            ['visitor_id' => $visitor->id],
            ['face_vector' => $vectorBudi]
        );
        Cache::forget('face_embeddings_all');

        // 2. Buat reservasi hari ini dengan status APPROVED
        $today = Carbon::now('Asia/Jakarta')->toDateString();
        $reservation = Reservation::create([
            'reservation_code' => 'RSV-TEST-0001',
            'visitor_id' => $visitor->id,
            'visitor_name' => $visitor->name,
            'visitor_phone' => $visitor->phone,
            'visitor_company' => $visitor->company,
            'purpose' => 'Meeting Kemitraan Strategis',
            'meet_to' => 'Direktur Operasional',
            'scheduled_date' => $today,
            'scheduled_time' => '10:00',
            'status' => 'APPROVED',
            'approved_at' => Carbon::now('Asia/Jakarta'),
            'biometric_consent' => true,
            'has_face_registered' => true,
        ]);

        // 3. Kiosk scan wajah
        $scanResult = $bioService->kioskScanAndIdentify($vectorBudi);

        $this->assertTrue($scanResult['success']);
        $this->assertEquals('reservation_auto_checked_in', $scanResult['type']);
        $this->assertEquals('Budi Santoso', $scanResult['data']['visitor_name']);
        $this->assertEquals('PT Teknologi Nusantara', $scanResult['data']['visitor_company']);

        // Verifikasi reservasi berubah menjadi CHECKED_IN
        $reservationFresh = $reservation->fresh();
        $this->assertEquals('CHECKED_IN', $reservationFresh->status);
        $this->assertNotNull($reservationFresh->checked_in_at);
        $this->assertNotNull($reservationFresh->visit_id);

        // Verifikasi tabel visit terbuat
        $visit = Visit::find($reservationFresh->visit_id);
        $this->assertNotNull($visit);
        $this->assertEquals('IN', $visit->status);
        $this->assertEquals('Meeting Kemitraan Strategis', $visit->purpose);
    }

    /**
     * Skenario 3: Pencegahan Check-In Ganda (Double Check-In Protection).
     * Jika reservasi sudah CHECKED_IN, scan ulang tidak boleh membuat kunjungan kedua.
     */
    public function test_concurrency_double_checkin_prevention()
    {
        $bioService = app(BiometricReservationService::class);
        $vectorCitra = $this->generateSampleVector(0.30);

        $visitor = Visitor::create([
            'name' => 'Citra Dewi',
            'phone' => '087712345678',
            'company' => 'CV Mega Bintang',
        ]);
        FaceEmbedding::updateOrCreate(
            ['visitor_id' => $visitor->id],
            ['face_vector' => $vectorCitra]
        );
        Cache::forget('face_embeddings_all');

        $today = Carbon::now('Asia/Jakarta')->toDateString();
        $reservation = Reservation::create([
            'reservation_code' => 'RSV-TEST-0002',
            'visitor_id' => $visitor->id,
            'visitor_name' => $visitor->name,
            'visitor_phone' => $visitor->phone,
            'visitor_company' => $visitor->company,
            'purpose' => 'Interview Teknis',
            'meet_to' => 'HR Manager',
            'scheduled_date' => $today,
            'scheduled_time' => '11:00',
            'status' => 'APPROVED',
            'approved_at' => Carbon::now('Asia/Jakarta'),
            'biometric_consent' => true,
            'has_face_registered' => true,
        ]);

        // Check-in pertama -> Sukses
        $res1 = $bioService->kioskScanAndIdentify($vectorCitra);
        $this->assertTrue($res1['success']);
        $this->assertEquals('reservation_auto_checked_in', $res1['type']);

        $visitsCountBefore = Visit::where('visitor_id', $visitor->id)->count();
        $this->assertEquals(1, $visitsCountBefore);

        // Check-in kedua (misal scan berulang kali atau tablet kedua) -> Ditolak!
        $res2 = $bioService->kioskScanAndIdentify($vectorCitra);
        $this->assertFalse($res2['success']);
        $this->assertEquals('reservation_already_checked_in', $res2['type']);

        $visitsCountAfter = Visit::where('visitor_id', $visitor->id)->count();
        $this->assertEquals(1, $visitsCountAfter, 'Tidak boleh ada duplikasi data visit!');
    }

    /**
     * Skenario 4: Multi-Reservasi Pada Hari yang Sama.
     * Tamu memiliki 2 reservasi valid hari ini (misal pagi dan siang).
     * Sistem harus menampilkan pilihan dan tidak memilih sembarangan.
     */
    public function test_multiple_approved_reservations_today_presents_choice()
    {
        $bioService = app(BiometricReservationService::class);
        $vectorDedi = $this->generateSampleVector(0.40);

        $visitor = Visitor::create([
            'name' => 'Dedi Kurniawan',
            'phone' => '081398765432',
            'company' => 'PT Solusi Pratama',
        ]);
        FaceEmbedding::updateOrCreate(
            ['visitor_id' => $visitor->id],
            ['face_vector' => $vectorDedi]
        );
        Cache::forget('face_embeddings_all');

        $today = Carbon::now('Asia/Jakarta')->toDateString();

        // Reservasi 1: Pagi
        $r1 = Reservation::create([
            'reservation_code' => 'RSV-TEST-MULTI-1',
            'visitor_id' => $visitor->id,
            'visitor_name' => $visitor->name,
            'visitor_phone' => $visitor->phone,
            'purpose' => 'Meeting Divisi IT',
            'meet_to' => 'Head of IT',
            'scheduled_date' => $today,
            'scheduled_time' => '09:00',
            'status' => 'APPROVED',
            'approved_at' => Carbon::now('Asia/Jakarta'),
            'biometric_consent' => true,
        ]);

        // Reservasi 2: Siang
        $r2 = Reservation::create([
            'reservation_code' => 'RSV-TEST-MULTI-2',
            'visitor_id' => $visitor->id,
            'visitor_name' => $visitor->name,
            'visitor_phone' => $visitor->phone,
            'purpose' => 'Presentasi Vendor Perangkat',
            'meet_to' => 'Procurement',
            'scheduled_date' => $today,
            'scheduled_time' => '14:00',
            'status' => 'APPROVED',
            'approved_at' => Carbon::now('Asia/Jakarta'),
            'biometric_consent' => true,
        ]);

        // Scan di kiosk -> harus mengembalikan multiple choice
        $scanResult = $bioService->kioskScanAndIdentify($vectorDedi);
        $this->assertTrue($scanResult['success']);
        $this->assertEquals('reservation_multiple_choice', $scanResult['type']);
        $this->assertCount(2, $scanResult['data']['reservations']);

        // Tamu memilih reservasi ke-2 (Siang)
        $chooseResult = $bioService->kioskScanAndIdentify(null, $visitor->id, $r2->id);
        $this->assertTrue($chooseResult['success']);
        $this->assertEquals('reservation_auto_checked_in', $chooseResult['type']);
        $this->assertEquals('RSV-TEST-MULTI-2', $chooseResult['data']['reservation_code']);
        $this->assertEquals('CHECKED_IN', $r2->fresh()->status);
        $this->assertEquals('APPROVED', $r1->fresh()->status, 'Reservasi ke-1 harus tetap APPROVED untuk jadwalnya');
    }

    /**
     * Skenario 5: Tamu Biasa Tanpa Reservasi Tetap Berjalan Normal.
     * Wajah dikenali sebagai pengunjung terdaftar, namun tidak memiliki reservasi hari ini.
     * Sistem harus mengarahkan ke form tamu biasa (form-existing).
     */
    public function test_regular_visitor_without_reservation_returns_regular_guest()
    {
        $bioService = app(BiometricReservationService::class);
        $vectorEko = $this->generateSampleVector(0.50);

        $visitor = Visitor::create([
            'name' => 'Eko Prasetyo',
            'phone' => '081298761234',
            'company' => 'PT Mitra Sejati',
        ]);
        FaceEmbedding::updateOrCreate(
            ['visitor_id' => $visitor->id],
            ['face_vector' => $vectorEko]
        );
        Cache::forget('face_embeddings_all');

        // Scan di kiosk tanpa ada reservasi apapun
        $scanResult = $bioService->kioskScanAndIdentify($vectorEko);

        $this->assertTrue($scanResult['success']);
        $this->assertEquals('regular_existing_guest', $scanResult['type']);
        $this->assertEquals('Eko Prasetyo', $scanResult['data']['visitor']['name']);
    }

    /**
     * Skenario 6: Wajah Tidak Dikenali (Tamu Baru).
     * Sistem mengembalikan type 'guest_not_found' untuk melanjutkan ke form tamu baru.
     */
    public function test_unrecognized_face_returns_not_found()
    {
        $bioService = app(BiometricReservationService::class);
        $vectorUnknown = $this->generateSampleVector(0.90);

        $scanResult = $bioService->kioskScanAndIdentify($vectorUnknown);
        $this->assertTrue($scanResult['success']);
        $this->assertEquals('guest_not_found', $scanResult['type']);
    }

    /**
     * Skenario 7: Reservasi Jadwal Masa Depan (Datang Bukan di Hari yang Sama).
     * Sistem menolak check-in otomatis dan memberikan informasi jadwal yang benar.
     */
    public function test_future_scheduled_reservation_is_rejected_politely()
    {
        $bioService = app(BiometricReservationService::class);
        $vectorFani = $this->generateSampleVector(0.60);

        $visitor = Visitor::create([
            'name' => 'Fani Anggraini',
            'phone' => '082198765432',
            'company' => 'PT Cipta Karya',
        ]);
        FaceEmbedding::updateOrCreate(
            ['visitor_id' => $visitor->id],
            ['face_vector' => $vectorFani]
        );
        Cache::forget('face_embeddings_all');

        $tomorrow = Carbon::now('Asia/Jakarta')->addDays(2)->toDateString();
        Reservation::create([
            'reservation_code' => 'RSV-TEST-FUTURE',
            'visitor_id' => $visitor->id,
            'visitor_name' => $visitor->name,
            'visitor_phone' => $visitor->phone,
            'purpose' => 'Audit Keuangan',
            'meet_to' => 'Finance Director',
            'scheduled_date' => $tomorrow,
            'scheduled_time' => '09:00',
            'status' => 'APPROVED',
            'approved_at' => Carbon::now('Asia/Jakarta'),
            'biometric_consent' => true,
        ]);

        $scanResult = $bioService->kioskScanAndIdentify($vectorFani);
        $this->assertFalse($scanResult['success']);
        $this->assertEquals('reservation_invalid_status', $scanResult['type']);
        $this->assertEquals('FUTURE_SCHEDULE', $scanResult['outcome']);
    }
}
