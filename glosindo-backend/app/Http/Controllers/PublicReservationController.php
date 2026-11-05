<?php

namespace App\Http\Controllers;

use App\Models\FaceEmbedding;
use App\Models\Reservation;
use App\Models\ReservationInvitation;
use App\Models\Visit;
use App\Models\Visitor;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PublicReservationController extends Controller
{
    /**
     * Validate and retrieve invitation details by token.
     */
    public function getInvitation($token)
    {
        $invitation = ReservationInvitation::where('token', $token)->first();

        if (!$invitation) {
            return response()->json([
                'success' => false,
                'message' => 'Link undangan tidak valid atau tidak ditemukan.',
            ], 404);
        }

        $now = Carbon::now();
        $isExpired = $invitation->isExpired();
        $isQuotaExceeded = $invitation->isQuotaExceeded();
        $isActive = (bool) $invitation->is_active;

        $isValid = $isActive && !$isExpired && !$isQuotaExceeded;
        $invalidReason = null;

        if (!$isActive) {
            $invalidReason = 'Link undangan ini telah dinonaktifkan oleh admin.';
        } elseif ($isExpired) {
            $invalidReason = 'Masa berlaku link undangan ini telah berakhir (kedaluwarsa).';
        } elseif ($isQuotaExceeded) {
            $invalidReason = 'Kuota pendaftaran untuk link undangan ini sudah penuh.';
        }

        return response()->json([
            'success' => true,
            'data' => [
                'token' => $invitation->token,
                'type' => $invitation->type,
                'company_name' => $invitation->company_name,
                'guest_name' => $invitation->guest_name,
                'purpose' => $invitation->purpose,
                'meet_to' => $invitation->meet_to,
                'scheduled_date' => $invitation->scheduled_date->format('Y-m-d'),
                'scheduled_date_formatted' => $invitation->scheduled_date->translatedFormat('l, d F Y'),
                'scheduled_time' => $invitation->scheduled_time,
                'quota' => $invitation->quota,
                'used_count' => $invitation->used_count,
                'remaining_quota' => $invitation->remainingQuota(),
                'expires_at' => $invitation->expires_at->toIso8601String(),
                'is_active' => $isActive,
                'is_expired' => $isExpired,
                'is_quota_exceeded' => $isQuotaExceeded,
                'is_valid' => $isValid,
                'invalid_reason' => $invalidReason,
                'notes' => $invitation->notes,
            ],
        ]);
    }

    /**
     * Check if submitted face vector is a duplicate of an existing visitor.
     */
    public function checkFace(Request $request, $token)
    {
        $this->validate($request, [
            'face_vector' => 'required|array',
            'face_vector.*' => 'required|numeric',
        ]);

        $faceVector = $request->face_vector;
        if (count($faceVector) !== 128) {
            return response()->json([
                'success' => false,
                'message' => 'Vektor wajah harus 128 dimensi',
            ], 422);
        }

        $threshold = (float) env('FACE_MATCH_THRESHOLD', 0.40);
        $thresholdSq = $threshold * $threshold;

        $embeddings = Cache::remember('face_embeddings_all', 60, function () {
            return FaceEmbedding::whereHas('visitor', function ($q) {
                $q->whereNull('deleted_at');
            })
            ->with(['visitor' => function ($q) {
                $q->select('id', 'name', 'company', 'phone')->whereNull('deleted_at');
            }])
            ->get(['id', 'visitor_id', 'face_vector']);
        });

        $bestMatch = null;
        $bestDistSq = $thresholdSq;

        foreach ($embeddings as $embedding) {
            if (!$embedding->visitor) {
                continue;
            }

            $distSq = FaceEmbedding::distanceSquared($faceVector, $embedding->face_vector, $bestDistSq);
            if ($distSq < $bestDistSq) {
                $bestDistSq = $distSq;
                $bestMatch = $embedding->visitor;
            }
        }

        if ($bestMatch) {
            return response()->json([
                'success' => true,
                'matched' => true,
                'distance' => round(sqrt($bestDistSq), 4),
                'visitor' => [
                    'id' => $bestMatch->id,
                    'name' => $bestMatch->name,
                    'company' => $bestMatch->company,
                    'phone' => $bestMatch->phone,
                ],
            ]);
        }

        return response()->json([
            'success' => true,
            'matched' => false,
            'message' => 'Wajah belum terdaftar (unik)',
        ]);
    }

    /**
     * Submit public reservation with biometric face registration (Auto Approved).
     */
    public function submitReservation(Request $request, $token)
    {
        // 1. Verify invitation link
        $invitation = ReservationInvitation::where('token', $token)->first();

        if (!$invitation) {
            return response()->json([
                'success' => false,
                'message' => 'Link undangan tidak valid.',
            ], 404);
        }

        if (!$invitation->isValid()) {
            $reason = 'Link undangan sudah tidak berlaku.';
            if (!$invitation->is_active) {
                $reason = 'Link undangan telah dinonaktifkan oleh admin.';
            } elseif ($invitation->isExpired()) {
                $reason = 'Masa berlaku link undangan telah berakhir (kedaluwarsa).';
            } elseif ($invitation->isQuotaExceeded()) {
                $reason = 'Kuota pendaftar pada undangan ini sudah terpenuhi.';
            }

            return response()->json([
                'success' => false,
                'message' => $reason,
            ], 422);
        }

        // 2. Parse face vector if string
        $faceVectorInput = $request->input('face_vector');
        $faceVector = null;
        if (is_string($faceVectorInput)) {
            $decoded = json_decode($faceVectorInput, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $faceVector = array_map('floatval', $decoded);
            }
        } elseif (is_array($faceVectorInput)) {
            $faceVector = array_map('floatval', $faceVectorInput);
        }

        // 3. Validation
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:30',
            'email' => 'nullable|email|max:255',
            'company' => 'nullable|string|max:255',
            'purpose' => 'required|string|max:255',
            'meet_to' => 'required|string|max:255',
            'scheduled_date' => 'required|date',
            'scheduled_time' => 'nullable|string|max:20',
            'biometric_consent' => 'required|in:1,true,"1",yes',
            'photo' => 'nullable',
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'phone.required' => 'Nomor WhatsApp / HP wajib diisi.',
            'purpose.required' => 'Tujuan kunjungan wajib diisi.',
            'meet_to.required' => 'Nama pihak yang ingin ditemui wajib diisi.',
            'scheduled_date.required' => 'Tanggal kunjungan wajib diisi.',
            'biometric_consent.required' => 'Persetujuan pemrosesan biometrik wajah wajib dicentang.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Data formulir tidak lengkap atau tidak valid.',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Validate face vector if provided
        $hasFaceVector = false;
        if ($faceVector !== null) {
            if (count($faceVector) !== 128) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vektor biometrik wajah harus berisi tepat 128 dimensi.',
                ], 422);
            }
            $hasFaceVector = true;
        }

        try {
            $cleanPhone = preg_replace('/[^0-9]/', '', $request->phone);

            $result = DB::transaction(function () use ($request, $invitation, $cleanPhone, $faceVector, $hasFaceVector) {
                // Check if already registered on this invitation link with same phone
                $existingReservation = Reservation::where('invitation_id', $invitation->id)
                    ->where('visitor_phone', $cleanPhone)
                    ->where('status', 'APPROVED')
                    ->first();

                if ($existingReservation) {
                    throw new \Exception('Nomor WhatsApp ini sudah terdaftar pada undangan ini dengan kode ' . $existingReservation->reservation_code);
                }

                // Handle Photo storage
                $photoPath = $this->storePhoto($request->input('photo'), $request);

                // Find or create Visitor
                $visitor = Visitor::where('phone', $cleanPhone)->first();
                if ($visitor) {
                    $visitor->name = $request->name;
                    if ($request->filled('email')) $visitor->email = $request->email;
                    if ($request->filled('company')) $visitor->company = $request->company;
                    if ($photoPath) $visitor->photo = $photoPath;
                    $visitor->save();
                } else {
                    $visitor = Visitor::create([
                        'name' => $request->name,
                        'phone' => $cleanPhone,
                        'email' => $request->email,
                        'company' => $request->company ?: $invitation->company_name,
                        'photo' => $photoPath,
                    ]);
                }

                // Save or update Face Embedding if vector provided
                if ($hasFaceVector) {
                    FaceEmbedding::updateOrCreate(
                        ['visitor_id' => $visitor->id],
                        ['face_vector' => $faceVector]
                    );
                    Cache::forget('face_embeddings_all');
                }

                // Generate Unique Reservation Code (e.g. RSV-20261105-X7K2)
                $datePrefix = Carbon::parse($request->scheduled_date)->format('Ymd');
                $randomSuffix = strtoupper(Str::random(4));
                $reservationCode = "RSV-{$datePrefix}-{$randomSuffix}";

                // Create Reservation Record with AUTO APPROVED status
                $reservation = Reservation::create([
                    'invitation_id' => $invitation->id,
                    'reservation_code' => $reservationCode,
                    'visitor_id' => $visitor->id,
                    'visitor_name' => $visitor->name,
                    'visitor_phone' => $visitor->phone,
                    'visitor_email' => $visitor->email,
                    'visitor_company' => $visitor->company,
                    'purpose' => $request->purpose,
                    'meet_to' => $request->meet_to,
                    'scheduled_date' => $request->scheduled_date,
                    'scheduled_time' => $request->scheduled_time ?: $invitation->scheduled_time,
                    'status' => 'APPROVED',
                    'approved_at' => Carbon::now(),
                    'biometric_consent' => true,
                    'has_face_registered' => $hasFaceVector,
                    'notes' => $request->input('notes'),
                ]);

                // Increment invitation used count
                $invitation->increment('used_count');

                // Audit log
                $reservation->audit('auto_approved', null, $reservation->toArray(), "Guest pre-registered and auto-approved via token {$invitation->token}");

                return [
                    'visitor' => $visitor,
                    'reservation' => $reservation,
                ];
            });

            // Generate Base64 QR code image for instant ticket download
            $qrData = $result['reservation']->reservation_code;
            $qrBase64 = null;
            try {
                $qrCode = new QrCode($qrData);
                $qrCode->setSize(280);
                $qrCode->setMargin(8);
                $writer = new PngWriter();
                $qrResult = $writer->write($qrCode);
                $qrBase64 = 'data:image/png;base64,' . base64_encode($qrResult->getString());
            } catch (\Throwable $qrErr) {
                Log::warning('QR generation failed for reservation: ' . $qrErr->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Reservasi berhasil dan otomatis disetujui! Silakan simpan kode reservasi dan QR Code Anda.',
                'data' => [
                    'reservation' => $result['reservation'],
                    'visitor' => $result['visitor'],
                    'qr_code' => $qrBase64,
                    'check_in_guide' => 'Saat tiba di kantor Glosindo, cukup arahkan wajah ke kamera Kiosk di meja resepsionis atau scan QR Code ini untuk check-in otomatis tanpa perlu mengisi formulir kembali.',
                ],
            ], 201);

        } catch (\Throwable $e) {
            Log::error('Reservation submission error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'Terjadi kesalahan saat memproses pendaftaran reservasi.',
            ], 422);
        }
    }

    /**
     * Auto Check-In endpoint: called when kiosk detects face or scans reservation QR code.
     */
    public function autoCheckIn(Request $request)
    {
        $this->validate($request, [
            'visitor_id' => 'nullable|integer',
            'reservation_code' => 'nullable|string',
        ]);

        $visitorId = $request->input('visitor_id');
        $reservationCode = $request->input('reservation_code');

        if (!$visitorId && !$reservationCode) {
            return response()->json([
                'success' => false,
                'message' => 'Visitor ID atau Reservation Code diperlukan.',
            ], 422);
        }

        // Find reservation
        $query = Reservation::query()->with('visitor');

        if ($reservationCode) {
            $query->where('reservation_code', strtoupper(trim($reservationCode)));
        } else {
            $query->where('visitor_id', $visitorId);
        }

        // Check newest reservation
        $reservation = $query->orderBy('scheduled_date', 'desc')
                             ->orderBy('created_at', 'desc')
                             ->first();

        if (!$reservation) {
            return response()->json([
                'success' => false,
                'has_reservation' => false,
                'message' => 'Tidak ditemukan data reservasi untuk tamu ini.',
            ], 404);
        }

        $today = Carbon::today();
        $scheduledDate = Carbon::parse($reservation->scheduled_date);

        // Check if already checked in
        if ($reservation->status === 'CHECKED_IN') {
            $checkInTime = $reservation->checked_in_at ? $reservation->checked_in_at->format('H:i') : 'sebelumnya';
            return response()->json([
                'success' => false,
                'has_reservation' => true,
                'already_checked_in' => true,
                'reservation' => $reservation,
                'message' => "Tamu {$reservation->visitor_name} sudah melakukan check-in hari ini pada pukul {$checkInTime}.",
            ], 422);
        }

        // Check if expired
        if ($reservation->status === 'EXPIRED' || ($reservation->status === 'APPROVED' && $scheduledDate->lessThan($today))) {
            if ($reservation->status !== 'EXPIRED') {
                $reservation->status = 'EXPIRED';
                $reservation->save();
            }
            return response()->json([
                'success' => false,
                'has_reservation' => true,
                'is_expired' => true,
                'reservation' => $reservation,
                'message' => "Reservasi ini telah kedaluwarsa (jadwal kunjungan: {$scheduledDate->format('d/m/Y')}). Silakan lakukan check-in manual di resepsionis.",
            ], 422);
        }

        // Check if cancelled
        if ($reservation->status === 'CANCELLED') {
            return response()->json([
                'success' => false,
                'has_reservation' => true,
                'is_cancelled' => true,
                'message' => 'Reservasi ini telah dibatalkan. Silakan hubungi petugas resepsionis.',
            ], 422);
        }

        // Perform auto check-in inside transaction
        try {
            $visit = DB::transaction(function () use ($reservation) {
                // Create visit record
                $newVisit = Visit::create([
                    'visitor_id' => $reservation->visitor_id,
                    'visitor_name' => $reservation->visitor_name,
                    'visitor_company' => $reservation->visitor_company,
                    'visitor_phone' => $reservation->visitor_phone,
                    'purpose' => $reservation->purpose,
                    'meet_to' => $reservation->meet_to,
                    'check_in' => Carbon::now(),
                    'status' => 'IN',
                ]);

                // Update reservation status to CHECKED_IN
                $reservation->status = 'CHECKED_IN';
                $reservation->checked_in_at = Carbon::now();
                $reservation->visit_id = $newVisit->id;
                $reservation->save();

                // Audit log
                $reservation->audit('checked_in', null, $reservation->toArray(), "Auto check-in verified via face biometric for code {$reservation->reservation_code}");

                return $newVisit;
            });

            return response()->json([
                'success' => true,
                'has_reservation' => true,
                'checked_in' => true,
                'message' => "Check-in reservasi berhasil diverifikasi! Selamat datang, {$reservation->visitor_name}.",
                'data' => [
                    'reservation' => $reservation->fresh(),
                    'visit' => $visit,
                    'visitor' => $reservation->visitor,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Auto check-in error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses check-in otomatis: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store photo file or base64 string.
     */
    private function storePhoto($photoInput, Request $request)
    {
        try {
            $storageDir = storage_path('app/public/visitors');
            if (!is_dir($storageDir)) {
                @mkdir($storageDir, 0755, true);
            }

            if ($request->hasFile('photo')) {
                $photo = $request->file('photo');
                $filename = time() . '_' . Str::random(8) . '.' . $photo->getClientOriginalExtension();
                $photo->move($storageDir, $filename);
                return 'visitors/' . $filename;
            }

            if (is_string($photoInput) && preg_match('/^data:image\/(\w+);base64,/', $photoInput, $matches)) {
                $extension = strtolower($matches[1]);
                if (in_array($extension, ['jpeg', 'jpg', 'png', 'webp'])) {
                    $imageData = substr($photoInput, strpos($photoInput, ',') + 1);
                    $decodedImage = base64_decode($imageData);

                    if ($decodedImage !== false) {
                        $filename = time() . '_' . Str::random(8) . '.' . ($extension === 'jpeg' ? 'jpg' : $extension);
                        $fullPath = $storageDir . '/' . $filename;
                        @file_put_contents($fullPath, $decodedImage);
                        return 'visitors/' . $filename;
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::error('PublicReservation storePhoto error: ' . $e->getMessage());
        }

        return null;
    }
}

