<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\ReservationInvitation;
use App\Models\Visit;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ReservationInvitationController extends Controller
{
    /**
     * Display a listing of reservation invitations.
     */
    public function index(Request $request)
    {
        $query = ReservationInvitation::query()->withCount('reservations');

        if ($request->has('type') && in_array($request->type, ['personal', 'mass'])) {
            $query->where('type', $request->type);
        }

        if ($request->has('status')) {
            $now = Carbon::now();
            if ($request->status === 'active') {
                $query->where('is_active', true)->where('expires_at', '>=', $now);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            } elseif ($request->status === 'expired') {
                $query->where('expires_at', '<', $now);
            }
        }

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'like', "%{$search}%")
                  ->orWhere('guest_name', 'like', "%{$search}%")
                  ->orWhere('purpose', 'like', "%{$search}%")
                  ->orWhere('meet_to', 'like', "%{$search}%");
            });
        }

        $invitations = $query->orderBy('created_at', 'desc')->paginate($request->input('per_page', 15));

        // Enhance with calculated remaining quota and expired status
        $invitations->getCollection()->transform(function ($item) {
            $item->is_expired = $item->isExpired();
            $item->remaining_quota = $item->remainingQuota();
            return $item;
        });

        return response()->json([
            'success' => true,
            'data' => $invitations,
        ]);
    }

    /**
     * Store a newly created invitation link.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:personal,mass',
            'company_name' => 'required|string|max:255',
            'guest_name' => 'nullable|string|max:255',
            'purpose' => 'nullable|string|max:255',
            'meet_to' => 'nullable|string|max:255',
            'scheduled_date' => 'required|date',
            'scheduled_time' => 'nullable|string|max:20',
            'quota' => 'nullable|integer|min:1',
            'expires_at' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors(),
            ], 422);
        }

        $type = $request->input('type', 'personal');
        $quota = $type === 'personal' ? 1 : (int) $request->input('quota', 10);

        // If expires_at not provided, default to end of scheduled_date (23:59:59)
        $expiresAt = $request->input('expires_at');
        if (!$expiresAt) {
            $expiresAt = Carbon::parse($request->scheduled_date)->endOfDay();
        } else {
            $expiresAt = Carbon::parse($expiresAt);
        }

        // Generate unguessable secure token
        $token = Str::random(32);

        $invitation = ReservationInvitation::create([
            'token' => $token,
            'type' => $type,
            'company_name' => $request->company_name,
            'guest_name' => $request->guest_name,
            'purpose' => $request->purpose,
            'meet_to' => $request->meet_to,
            'scheduled_date' => $request->scheduled_date,
            'scheduled_time' => $request->scheduled_time,
            'quota' => $quota,
            'used_count' => 0,
            'expires_at' => $expiresAt,
            'is_active' => true,
            'notes' => $request->notes,
            'created_by' => auth()->id(),
        ]);

        $invitation->audit('created', null, $invitation->toArray(), "Invitation link created ({$type}) for {$invitation->company_name}");

        return response()->json([
            'success' => true,
            'message' => 'Link undangan reservasi berhasil dibuat',
            'data' => $invitation,
        ], 201);
    }

    /**
     * Display the specified invitation link with its registered guests.
     */
    public function show($id)
    {
        $invitation = ReservationInvitation::with(['reservations' => function ($q) {
            $q->orderBy('created_at', 'desc');
        }, 'creator:id,name'])->find($id);

        if (!$invitation) {
            return response()->json([
                'success' => false,
                'message' => 'Undangan tidak ditemukan',
            ], 404);
        }

        $invitation->is_expired = $invitation->isExpired();
        $invitation->remaining_quota = $invitation->remainingQuota();

        return response()->json([
            'success' => true,
            'data' => $invitation,
        ]);
    }

    /**
     * Update an invitation link.
     */
    public function update(Request $request, $id)
    {
        $invitation = ReservationInvitation::find($id);

        if (!$invitation) {
            return response()->json([
                'success' => false,
                'message' => 'Undangan tidak ditemukan',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'type' => 'sometimes|in:personal,mass',
            'company_name' => 'sometimes|string|max:255',
            'guest_name' => 'nullable|string|max:255',
            'purpose' => 'nullable|string|max:255',
            'meet_to' => 'nullable|string|max:255',
            'scheduled_date' => 'sometimes|date',
            'scheduled_time' => 'nullable|string|max:20',
            'quota' => 'sometimes|integer|min:1',
            'expires_at' => 'sometimes|date',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors(),
            ], 422);
        }

        $oldValues = $invitation->toArray();
        $invitation->fill($request->only([
            'type',
            'company_name',
            'guest_name',
            'purpose',
            'meet_to',
            'scheduled_date',
            'scheduled_time',
            'quota',
            'expires_at',
            'notes',
        ]));

        if ($request->has('expires_at')) {
            $invitation->expires_at = Carbon::parse($request->expires_at);
        }

        $invitation->save();
        $invitation->audit('updated', $oldValues, $invitation->fresh()->toArray(), "Invitation updated by admin");

        return response()->json([
            'success' => true,
            'message' => 'Data undangan berhasil diperbarui',
            'data' => $invitation->fresh(),
        ]);
    }

    /**
     * Toggle active/inactive status of an invitation link.
     */
    public function toggleStatus($id)
    {
        $invitation = ReservationInvitation::find($id);

        if (!$invitation) {
            return response()->json([
                'success' => false,
                'message' => 'Undangan tidak ditemukan',
            ], 404);
        }

        $invitation->is_active = !$invitation->is_active;
        $invitation->save();

        $statusText = $invitation->is_active ? 'diaktifkan' : 'dinonaktifkan';
        $invitation->audit('status_toggled', null, ['is_active' => $invitation->is_active], "Invitation {$statusText}");

        return response()->json([
            'success' => true,
            'message' => "Link undangan berhasil {$statusText}",
            'data' => $invitation,
        ]);
    }

    /**
     * Soft delete an invitation link.
     */
    public function destroy($id)
    {
        $invitation = ReservationInvitation::find($id);

        if (!$invitation) {
            return response()->json([
                'success' => false,
                'message' => 'Undangan tidak ditemukan',
            ], 404);
        }

        $invitation->audit('deleted', $invitation->toArray(), null, "Invitation deleted");
        $invitation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Link undangan berhasil dihapus',
        ]);
    }

    /**
     * Summary dashboard statistics for reservations.
     */
    public function stats()
    {
        Visit::autoCheckoutExpired();

        $today = Carbon::today();
        $now = Carbon::now();

        $totalReservations = Reservation::count();
        $approvedReservations = Reservation::where('status', 'APPROVED')
            ->whereDate('scheduled_date', '>=', $today)
            ->count();
        $checkedIn = Reservation::where('status', 'CHECKED_IN')->count();
        $checkedOut = Reservation::where(function ($q) {
            $q->where('status', 'CHECKED_OUT')
              ->orWhereNotNull('checked_out_at');
        })->count();

        // Expired: explicitly marked EXPIRED or APPROVED with past date
        $expired = Reservation::where(function ($q) use ($today) {
            $q->where('status', 'EXPIRED')
              ->orWhere(function ($sub) use ($today) {
                  $sub->where('status', 'APPROVED')
                      ->whereDate('scheduled_date', '<', $today);
              });
        })->count();

        // Unregistered quota (quota left on active invitation links)
        $activeInvitations = ReservationInvitation::where('is_active', true)
            ->where('expires_at', '>=', $now)
            ->get();

        $unregisteredQuota = $activeInvitations->sum(function ($inv) {
            return $inv->remainingQuota();
        });

        // Face registration metrics
        $withFace = Reservation::where('has_face_registered', true)->count();
        $withoutFace = $totalReservations - $withFace;

        return response()->json([
            'success' => true,
            'data' => [
                'total_reservations' => $totalReservations,
                'approved_reservations' => $approvedReservations,
                'unregistered_quota' => $unregisteredQuota,
                'checked_in' => $checkedIn,
                'checked_out' => $checkedOut,
                'expired' => $expired,
                'face_registered_count' => $withFace,
                'face_manual_count' => $withoutFace,
                'total_invitations' => ReservationInvitation::count(),
                'active_invitations' => $activeInvitations->count(),
            ],
        ]);
    }

    /**
     * List all reservations across all invitations.
     */
    public function reservationsList(Request $request)
    {
        Visit::autoCheckoutExpired();

        $query = Reservation::query()->with(['invitation:id,token,company_name,type', 'visitor:id,name,phone,company,photo']);

        if ($request->has('status') && !empty($request->status)) {
            $query->where('status', $request->status);
        }

        if ($request->has('scheduled_date') && !empty($request->scheduled_date)) {
            $query->whereDate('scheduled_date', $request->scheduled_date);
        }

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reservation_code', 'like', "%{$search}%")
                  ->orWhere('visitor_name', 'like', "%{$search}%")
                  ->orWhere('visitor_phone', 'like', "%{$search}%")
                  ->orWhere('visitor_company', 'like', "%{$search}%")
                  ->orWhere('purpose', 'like', "%{$search}%");
            });
        }

        $reservations = $query->orderBy('scheduled_date', 'desc')
                              ->orderBy('created_at', 'desc')
                              ->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $reservations,
        ]);
    }

    /**
     * Get reservation detail.
     */
    public function reservationDetail($id)
    {
        $reservation = Reservation::with([
            'invitation',
            'visitor.faceEmbedding',
            'visit',
        ])->find($id);

        if (!$reservation) {
            return response()->json([
                'success' => false,
                'message' => 'Reservasi tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $reservation,
        ]);
    }

    /**
     * Cancel or soft delete a reservation.
     */
    public function destroyReservation($id)
    {
        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json([
                'success' => false,
                'message' => 'Reservasi tidak ditemukan',
            ], 404);
        }

        DB::transaction(function () use ($reservation) {
            // Decrement used_count on parent invitation if active
            if ($reservation->invitation_id) {
                $invitation = ReservationInvitation::find($reservation->invitation_id);
                if ($invitation && $invitation->used_count > 0) {
                    $invitation->decrement('used_count');
                }
            }

            $reservation->status = 'CANCELLED';
            $reservation->save();
            $reservation->audit('cancelled', null, $reservation->toArray(), "Reservation cancelled by admin");
            $reservation->delete();
        });

        return response()->json([
            'success' => true,
            'message' => 'Reservasi berhasil dibatalkan',
        ]);
    }
}

