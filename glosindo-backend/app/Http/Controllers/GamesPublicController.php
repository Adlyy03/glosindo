<?php

namespace App\Http\Controllers;

use App\Models\EventGroup;
use App\Models\GroupParticipant;
use App\Models\PointQrCode;
use App\Models\PointTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class GamesPublicController extends Controller
{
    /**
     * Get group info by registration token (public).
     */
    public function getGroupInfo($token)
    {
        $group = EventGroup::where('register_token', $token)
                          ->with('gameEvent')
                          ->first();

        if (!$group) {
            return response()->json([
                'success' => false,
                'message' => 'Link registrasi tidak valid',
            ], 404);
        }

        // Validate event is active
        if ($group->gameEvent->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Event tidak aktif. Status: ' . $group->gameEvent->status,
            ], 400);
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'event_name' => $group->gameEvent->name,
                'event_desc' => $group->gameEvent->description,
                'group_name' => $group->name,
                'start_date' => $group->gameEvent->start_date,
                'end_date'   => $group->gameEvent->end_date,
                'status'     => $group->gameEvent->status,
            ],
        ]);
    }

    /**
     * Register participant via token (public, rate limited).
     */
    public function register(Request $request, $token)
    {
        $group = EventGroup::where('register_token', $token)
                          ->with('gameEvent')
                          ->first();

        if (!$group) {
            return response()->json([
                'success' => false,
                'message' => 'Link registrasi tidak valid',
            ], 404);
        }

        // Validate event is active
        if ($group->gameEvent->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Event tidak aktif. Registrasi ditutup.',
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'name'  => 'required|string|max:255',
            'phone' => 'required|string|max:30',
            'email' => 'nullable|email|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            // Check duplicate phone di kelompok yang sama (DB constraint juga enforce ini)
            $exists = GroupParticipant::where('event_group_id', $group->id)
                                      ->where('phone', $request->phone)
                                      ->exists();

            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nomor telepon sudah terdaftar di kelompok ini',
                ], 400);
            }

            $participant = GroupParticipant::create([
                'event_group_id' => $group->id,
                'name'           => $request->name,
                'phone'          => $request->phone,
                'email'          => $request->email,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Registrasi berhasil!',
                'data'    => [
                    'participant_id'   => $participant->id,
                    'participant_name' => $participant->name,
                    'group_name'       => $group->name,
                    'event_name'       => $group->gameEvent->name,
                    'registered_at'    => $participant->registered_at,
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal registrasi: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Scan QR poin (public/peserta, rate limited).
     */
    public function scanPoint(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'qr_token'       => 'required|string',
            'participant_id' => 'required|integer|exists:group_participants,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Find QR code
            $qr = PointQrCode::where('token', $request->qr_token)
                            ->with('gameEvent')
                            ->first();

            if (!$qr) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'QR poin tidak valid',
                ], 404);
            }

            // Validate QR status
            if ($qr->status !== 'active') {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'QR poin tidak aktif',
                ], 400);
            }

            // Validate event is active
            if ($qr->gameEvent->status !== 'active') {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Event sudah tidak aktif',
                ], 400);
            }

            // Get participant
            $participant = GroupParticipant::with('eventGroup')->find($request->participant_id);

            if (!$participant) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Peserta tidak ditemukan',
                ], 404);
            }

            // Validate participant berada di event yang sama
            if ($participant->eventGroup->game_event_id !== $qr->game_event_id) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'QR poin tidak sesuai dengan event Anda',
                ], 400);
            }

            // Check duplicate scan (DB constraint juga enforce ini)
            $hasDuplicate = PointTransaction::hasDuplicateScan($participant->id, $qr->id);

            if ($hasDuplicate) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'QR poin ini sudah pernah Anda gunakan',
                ], 400);
            }

            // Create transaction (BACKEND menentukan point value, BUKAN dari request!)
            $transaction = PointTransaction::create([
                'game_event_id'        => $qr->game_event_id,
                'event_group_id'       => $participant->event_group_id,
                'group_participant_id' => $participant->id,
                'point_qr_code_id'     => $qr->id,
                'points'               => $qr->point_value, // Backend determines value!
                'scanned_at'           => now(),
            ]);

            $transaction->audit('created', null, $transaction->toArray(), 'Point scanned');

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Berhasil mendapatkan {$qr->point_value} poin!",
                'data'    => [
                    'points_earned'   => $qr->point_value,
                    'participant'     => $participant->name,
                    'group'           => $participant->eventGroup->name,
                    'total_points'    => PointTransaction::getTotalPointsForParticipant($participant->id),
                    'scanned_at'      => $transaction->scanned_at,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal scan QR: ' . $e->getMessage(),
            ], 500);
        }
    }
}
