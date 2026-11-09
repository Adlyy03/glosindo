<?php

namespace App\Services;

use App\Models\FaceEmbedding;
use App\Models\Reservation;
use App\Models\Visit;
use App\Models\Visitor;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BiometricReservationService
{
    const TIMEZONE = 'Asia/Jakarta';
    const FACE_THRESHOLD_STRICT = 0.40;
    const FACE_THRESHOLD_RELAXED = 0.45;

    /**
     * Match a 128-dimensional face vector against stored face embeddings.
     * Uses Euclidean distance with early-exit pruning and caching for sub-second performance.
     */
    public function matchFaceVector(array $faceVector, float $threshold = self::FACE_THRESHOLD_RELAXED): ?array
    {
        if (count($faceVector) !== 128) {
            return null;
        }

        $thresholdSq = $threshold * $threshold;

        // Retrieve active embeddings from cache
        $embeddings = Cache::remember('face_embeddings_all', 60, function () {
            return FaceEmbedding::whereHas('visitor', function ($q) {
                $q->whereNull('deleted_at');
            })
            ->with(['visitor' => function ($q) {
                $q->select('id', 'name', 'company', 'phone', 'email')->whereNull('deleted_at');
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
            return [
                'matched' => true,
                'distance' => round(sqrt($bestDistSq), 4),
                'visitor' => $bestMatch,
            ];
        }

        return ['matched' => false];
    }

    /**
     * Single Biometric Identity Resolver:
     * Guarantees ONE visitor identity per person by matching face first, then phone.
     * Prevents duplicate visitors and duplicate biometric profiles.
     */
    public function resolveOrCreateVisitor(?array $faceVector, array $data, ?string $photoPath = null): array
    {
        $cleanPhone = !empty($data['phone']) ? preg_replace('/[^0-9]/', '', $data['phone']) : null;
        $name = trim($data['name'] ?? '');
        $company = trim($data['company'] ?? '');
        $email = trim($data['email'] ?? '');

        $matchedVisitor = null;
        $matchedVia = null;

        // 1. Biometric face match attempt (strict threshold 0.40)
        if ($faceVector && count($faceVector) === 128) {
            $faceMatch = $this->matchFaceVector($faceVector, self::FACE_THRESHOLD_STRICT);
            if ($faceMatch && $faceMatch['matched'] && $faceMatch['visitor']) {
                $matchedVisitor = Visitor::find($faceMatch['visitor']->id);
                $matchedVia = 'biometric_face';
            }
        }

        // 2. Phone match attempt if not matched via face
        if (!$matchedVisitor && $cleanPhone) {
            $phoneMatch = Visitor::where('phone', $cleanPhone)->first();
            if ($phoneMatch) {
                $matchedVisitor = $phoneMatch;
                $matchedVia = 'phone';
            }
        }

        // 3. Resolve identity
        if ($matchedVisitor) {
            // Update profile with newest confirmed data without overwriting valid data with empty values
            if (!empty($name) && ($matchedVisitor->name === 'Tamu' || strlen($matchedVisitor->name) < strlen($name))) {
                $matchedVisitor->name = $name;
            }
            if (!empty($company) && empty($matchedVisitor->company)) {
                $matchedVisitor->company = $company;
            }
            if (!empty($email) && empty($matchedVisitor->email)) {
                $matchedVisitor->email = $email;
            }
            if (!empty($cleanPhone) && empty($matchedVisitor->phone)) {
                $matchedVisitor->phone = $cleanPhone;
            }
            if ($photoPath) {
                $matchedVisitor->photo = $photoPath;
            }
            $matchedVisitor->save();
            $visitor = $matchedVisitor;
        } else {
            // Truly new person
            $visitor = Visitor::create([
                'name' => $name ?: 'Tamu Reservasi',
                'phone' => $cleanPhone,
                'email' => $email ?: null,
                'company' => $company ?: null,
                'photo' => $photoPath,
            ]);
            $matchedVia = 'new_created';
        }

        // 4. Save or refresh single biometric embedding
        if ($faceVector && count($faceVector) === 128) {
            $compactVector = array_map(function ($val) {
                return round((float) $val, 4);
            }, $faceVector);

            FaceEmbedding::updateOrCreate(
                ['visitor_id' => $visitor->id],
                ['face_vector' => $compactVector]
            );
            Cache::forget('face_embeddings_all');
        }

        return [
            'visitor' => $visitor,
            'matched_via' => $matchedVia,
            'is_existing' => $matchedVisitor !== null,
        ];
    }

    /**
     * Find reservations for a visitor and evaluate suitability for today's check-in.
     */
    public function evaluateVisitorReservations(int $visitorId): array
    {
        $today = Carbon::now(self::TIMEZONE)->toDateString();

        // 1. Get today's reservations
        $todayReservations = Reservation::where('visitor_id', $visitorId)
            ->whereDate('scheduled_date', $today)
            ->with(['invitation', 'visitor'])
            ->orderBy('scheduled_time', 'asc')
            ->orderBy('created_at', 'asc')
            ->get();

        if ($todayReservations->isNotEmpty()) {
            $approved = $todayReservations->where('status', 'APPROVED')->values();

            // Exactly 1 approved reservation today -> ready for instant check-in
            if ($approved->count() === 1) {
                return [
                    'outcome' => 'VALID_APPROVED',
                    'reservation' => $approved->first(),
                    'message' => 'Reservasi aktif ditemukan untuk hari ini.',
                ];
            }

            // Multiple approved reservations today -> require guest selection
            if ($approved->count() > 1) {
                return [
                    'outcome' => 'MULTIPLE_APPROVED',
                    'reservations' => $approved,
                    'message' => 'Ditemukan lebih dari satu reservasi yang valid untuk hari ini.',
                ];
            }

            // No approved reservations today -> check other statuses
            $checkedIn = $todayReservations->where('status', 'CHECKED_IN')->first();
            if ($checkedIn) {
                $time = $checkedIn->checked_in_at ? Carbon::parse($checkedIn->checked_in_at)->tz(self::TIMEZONE)->format('H:i') : 'sebelumnya';
                return [
                    'outcome' => 'ALREADY_CHECKED_IN',
                    'reservation' => $checkedIn,
                    'message' => "Tamu {$checkedIn->visitor_name} sudah melakukan check-in hari ini pada pukul {$time} WIB.",
                ];
            }

            $cancelled = $todayReservations->where('status', 'CANCELLED')->first();
            if ($cancelled) {
                return [
                    'outcome' => 'CANCELLED',
                    'reservation' => $cancelled,
                    'message' => 'Reservasi untuk hari ini telah dibatalkan. Silakan hubungi petugas resepsionis.',
                ];
            }

            $expired = $todayReservations->where('status', 'EXPIRED')->first();
            if ($expired) {
                return [
                    'outcome' => 'EXPIRED',
                    'reservation' => $expired,
                    'message' => 'Reservasi untuk hari ini telah kedaluwarsa. Silakan hubungi petugas resepsionis.',
                ];
            }
        }

        // 2. Check if visitor has reservations on other days (future or past)
        $otherReservations = Reservation::where('visitor_id', $visitorId)
            ->with('invitation')
            ->orderBy('scheduled_date', 'asc')
            ->get();

        if ($otherReservations->isNotEmpty()) {
            $future = $otherReservations->where('scheduled_date', '>', $today)->first();
            if ($future) {
                $futureDateFormatted = Carbon::parse($future->scheduled_date)->locale('id')->isoFormat('dddd, D MMMM Y');
                return [
                    'outcome' => 'FUTURE_SCHEDULE',
                    'reservation' => $future,
                    'message' => "Jadwal kunjungan Anda tercatat pada {$futureDateFormatted}. Silakan hubungi resepsionis jika ingin bertamu hari ini.",
                ];
            }

            $past = $otherReservations->where('scheduled_date', '<', $today)->sortByDesc('scheduled_date')->first();
            if ($past) {
                return [
                    'outcome' => 'PAST_EXPIRED',
                    'reservation' => $past,
                    'message' => 'Reservasi sebelumnya telah kedaluwarsa. Silakan lakukan check-in sebagai tamu biasa atau hubungi resepsionis.',
                ];
            }
        }

        // 3. Regular visitor (no reservations registered)
        return [
            'outcome' => 'NO_RESERVATION',
            'message' => 'Tidak ditemukan data reservasi. Silakan lanjutkan sebagai tamu biasa.',
        ];
    }

    /**
     * Execute atomic, concurrency-proof check-in for a reservation.
     * Prevents double check-in using pessimistic row-locking and idempotency checks.
     */
    public function checkInReservation(Reservation $reservation): Visit
    {
        return DB::transaction(function () use ($reservation) {
            // Pessimistic lock on reservation record to prevent race conditions across kiosks/tablets
            $locked = Reservation::where('id', $reservation->id)
                ->lockForUpdate()
                ->first();

            if (!$locked) {
                throw new \RuntimeException('Data reservasi tidak ditemukan.');
            }

            if ($locked->status === 'CHECKED_IN') {
                $time = $locked->checked_in_at ? Carbon::parse($locked->checked_in_at)->tz(self::TIMEZONE)->format('H:i') : 'sebelumnya';
                throw new \RuntimeException("Reservasi sudah pernah digunakan untuk check-in pada pukul {$time} WIB.");
            }

            if ($locked->status !== 'APPROVED') {
                throw new \RuntimeException("Status reservasi tidak valid untuk check-in: {$locked->status}.");
            }

            $now = Carbon::now(self::TIMEZONE);

            // Auto checkout any lingering active visit for this visitor
            Visit::where('visitor_id', $locked->visitor_id)
                ->where('status', 'IN')
                ->update([
                    'check_out' => $now,
                    'status' => 'OUT',
                ]);

            // Create new confirmed Visit record
            $visit = Visit::create([
                'visitor_id' => $locked->visitor_id,
                'visitor_name' => $locked->visitor_name,
                'visitor_company' => $locked->visitor_company ?: ($locked->visitor->company ?? '-'),
                'visitor_phone' => $locked->visitor_phone,
                'purpose' => $locked->purpose,
                'meet_to' => $locked->meet_to ?: '-',
                'check_in' => $now,
                'status' => 'IN',
            ]);

            // Update Reservation status atomically
            $locked->status = 'CHECKED_IN';
            $locked->checked_in_at = $now;
            $locked->visit_id = $visit->id;
            $locked->save();

            // Audit log
            $locked->audit('auto_checked_in', null, $locked->toArray(), "Kiosk face recognition auto-checkin for code {$locked->reservation_code}");

            return $visit;
        });
    }

    /**
     * Unified Kiosk Scan Pipeline:
     * In a single fast request:
     * 1. Matches biometric face
     * 2. Evaluates reservations
     * 3. Performs atomic check-in if valid
     * 4. Returns structured outcome for kiosk display
     */
    public function kioskScanAndIdentify(?array $faceVector, ?int $visitorId = null, ?int $reservationId = null): array
    {
        $startTime = microtime(true);

        // 1. If reservationId is explicitly specified (e.g. from multiple choice selection)
        if ($reservationId) {
            $reservation = Reservation::with(['visitor', 'invitation'])->find($reservationId);
            if (!$reservation) {
                return [
                    'success' => false,
                    'type' => 'error',
                    'message' => 'Data reservasi tidak ditemukan.',
                ];
            }

            if ($visitorId && (int) $reservation->visitor_id !== (int) $visitorId) {
                return [
                    'success' => false,
                    'type' => 'error',
                    'message' => 'Identitas tidak sesuai dengan reservasi yang dipilih.',
                ];
            }

            try {
                $visit = $this->checkInReservation($reservation);
                $durationMs = round((microtime(true) - $startTime) * 1000, 2);

                return [
                    'success' => true,
                    'type' => 'reservation_auto_checked_in',
                    'message' => "Check-in berhasil! Selamat datang, {$reservation->visitor_name}.",
                    'data' => [
                        'visitor_name' => $reservation->visitor_name,
                        'visitor_company' => $reservation->visitor_company ?: ($reservation->visitor->company ?? 'Tamu'),
                        'purpose' => $reservation->purpose,
                        'meet_to' => $reservation->meet_to,
                        'reservation_code' => $reservation->reservation_code,
                        'check_in_time' => Carbon::parse($visit->check_in)->tz(self::TIMEZONE)->format('H:i'),
                        'duration_ms' => $durationMs,
                    ],
                ];
            } catch (\Throwable $e) {
                return [
                    'success' => false,
                    'type' => 'reservation_error',
                    'message' => $e->getMessage(),
                ];
            }
        }

        // 2. Resolve visitor identity
        $visitor = null;
        $matchDistance = null;

        if ($visitorId) {
            $visitor = Visitor::find($visitorId);
        } elseif ($faceVector && count($faceVector) === 128) {
            $matchResult = $this->matchFaceVector($faceVector, self::FACE_THRESHOLD_RELAXED);
            if ($matchResult && $matchResult['matched'] && $matchResult['visitor']) {
                $visitor = $matchResult['visitor'];
                $matchDistance = $matchResult['distance'];
            }
        }

        // Unknown face -> continue to regular new guest form
        if (!$visitor) {
            $durationMs = round((microtime(true) - $startTime) * 1000, 2);
            return [
                'success' => true,
                'type' => 'guest_not_found',
                'message' => 'Wajah belum terdaftar.',
                'data' => [
                    'duration_ms' => $durationMs,
                ],
            ];
        }

        // 3. Evaluate reservations for this visitor
        $eval = $this->evaluateVisitorReservations($visitor->id);
        $durationMs = round((microtime(true) - $startTime) * 1000, 2);

        switch ($eval['outcome']) {
            case 'VALID_APPROVED':
                // Check in atomically!
                try {
                    $reservation = $eval['reservation'];
                    $visit = $this->checkInReservation($reservation);

                    return [
                        'success' => true,
                        'type' => 'reservation_auto_checked_in',
                        'message' => "Reservasi berhasil diverifikasi. Check-in berhasil.",
                        'data' => [
                            'visitor_name' => $reservation->visitor_name,
                            'visitor_company' => $reservation->visitor_company ?: ($visitor->company ?? 'Tamu Glosindo'),
                            'purpose' => $reservation->purpose,
                            'meet_to' => $reservation->meet_to,
                            'reservation_code' => $reservation->reservation_code,
                            'scheduled_time' => $reservation->scheduled_time,
                            'check_in_time' => Carbon::parse($visit->check_in)->tz(self::TIMEZONE)->format('H:i'),
                            'distance' => $matchDistance,
                            'duration_ms' => $durationMs,
                        ],
                    ];
                } catch (\Throwable $e) {
                    return [
                        'success' => false,
                        'type' => 'reservation_already_checked_in',
                        'message' => $e->getMessage(),
                        'data' => [
                            'visitor' => $visitor,
                            'duration_ms' => $durationMs,
                        ],
                    ];
                }

            case 'MULTIPLE_APPROVED':
                return [
                    'success' => true,
                    'type' => 'reservation_multiple_choice',
                    'message' => $eval['message'],
                    'data' => [
                        'visitor' => [
                            'id' => $visitor->id,
                            'name' => $visitor->name,
                            'company' => $visitor->company,
                        ],
                        'reservations' => $eval['reservations']->map(function ($r) {
                            return [
                                'id' => $r->id,
                                'reservation_code' => $r->reservation_code,
                                'purpose' => $r->purpose,
                                'meet_to' => $r->meet_to,
                                'scheduled_time' => $r->scheduled_time,
                                'visitor_company' => $r->visitor_company,
                            ];
                        }),
                        'duration_ms' => $durationMs,
                    ],
                ];

            case 'ALREADY_CHECKED_IN':
                return [
                    'success' => false,
                    'type' => 'reservation_already_checked_in',
                    'message' => $eval['message'],
                    'data' => [
                        'visitor_name' => $visitor->name,
                        'visitor_company' => $visitor->company,
                        'reservation' => $eval['reservation'],
                        'duration_ms' => $durationMs,
                    ],
                ];

            case 'CANCELLED':
            case 'EXPIRED':
            case 'FUTURE_SCHEDULE':
            case 'PAST_EXPIRED':
                return [
                    'success' => false,
                    'type' => 'reservation_invalid_status',
                    'outcome' => $eval['outcome'],
                    'message' => $eval['message'],
                    'data' => [
                        'visitor_name' => $visitor->name,
                        'visitor_company' => $visitor->company,
                        'reservation' => $eval['reservation'] ?? null,
                        'duration_ms' => $durationMs,
                    ],
                ];

            case 'NO_RESERVATION':
            default:
                // Regular existing visitor
                return [
                    'success' => true,
                    'type' => 'regular_existing_guest',
                    'message' => 'Wajah dikenali (tamu biasa).',
                    'data' => [
                        'visitor' => [
                            'id' => $visitor->id,
                            'visitor_id' => $visitor->id,
                            'name' => $visitor->name,
                            'company' => $visitor->company,
                            'phone' => $visitor->phone,
                        ],
                        'distance' => $matchDistance,
                        'duration_ms' => $durationMs,
                    ],
                ];
        }
    }
}
