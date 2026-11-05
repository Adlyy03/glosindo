<?php

namespace App\Http\Controllers;

use App\Models\GameEvent;
use App\Models\Event;
use App\Models\EventGroup;
use App\Models\GroupParticipant;
use App\Models\PointQrCode;
use App\Models\PointTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;

class GameEventController extends Controller
{
    /**
     * Display a listing of game events.
     */
    public function index(Request $request)
    {
        $query = GameEvent::with(['creator:id,name']);

        // Filter by status
        if ($request->has('status') && !empty($request->status)) {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $events = $query->orderBy('created_at', 'desc')->paginate(15);

        // Load counts
        $events->getCollection()->transform(function ($event) {
            $event->groups_count = $event->groups()->count();
            $event->participants_count = GroupParticipant::whereIn('event_group_id', $event->groups->pluck('id'))->count();
            $event->total_points = $event->transactions()->sum('points');
            return $event;
        });

        return response()->json([
            'success' => true,
            'data'    => $events,
        ]);
    }

    /**
     * Store a newly created game event.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date'  => 'required|date',
            'end_date'    => 'required|date|after_or_equal:start_date',
            'status'      => 'nullable|in:draft,active,completed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            $event = GameEvent::create([
                'name'        => $request->name,
                'description' => $request->description,
                'start_date'  => $request->start_date,
                'end_date'    => $request->end_date,
                'status'      => $request->status ?: 'draft',
                'created_by'  => auth()->id(),
            ]);

            $event->audit('created', null, $event->toArray(), 'Game event created');

            return response()->json([
                'success' => true,
                'message' => 'Game event berhasil dibuat',
                'data'    => $event->load('creator:id,name'),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat game event: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified game event.
     */
    public function show($id)
    {
        $event = GameEvent::with(['creator:id,name', 'groups'])->find($id);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Game event tidak ditemukan',
            ], 404);
        }

        // Load counts
        $event->groups_count = $event->groups()->count();
        $event->participants_count = GroupParticipant::whereIn('event_group_id', $event->groups->pluck('id'))->count();
        $event->total_points = $event->transactions()->sum('points');
        $event->qr_codes_count = $event->pointQrCodes()->count();
        $event->transactions_count = $event->transactions()->count();

        return response()->json([
            'success' => true,
            'data'    => $event,
        ]);
    }

    /**
     * Update the specified game event.
     */
    public function update(Request $request, $id)
    {
        $event = GameEvent::find($id);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Game event tidak ditemukan',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date'  => 'required|date',
            'end_date'    => 'required|date|after_or_equal:start_date',
            'status'      => 'nullable|in:draft,active,completed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            $oldValues = $event->toArray();

            $event->update([
                'name'        => $request->name,
                'description' => $request->description,
                'start_date'  => $request->start_date,
                'end_date'    => $request->end_date,
                'status'      => $request->status ?: $event->status,
            ]);

            $event->audit('updated', $oldValues, $event->toArray(), 'Game event updated');

            return response()->json([
                'success' => true,
                'message' => 'Game event berhasil diupdate',
                'data'    => $event->load('creator:id,name'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal update game event: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified game event.
     */
    public function destroy($id)
    {
        $event = GameEvent::find($id);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Game event tidak ditemukan',
            ], 404);
        }

        // Check if has important data
        $hasTransactions = $event->transactions()->exists();
        if ($hasTransactions) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak bisa hapus game event yang sudah memiliki transaksi poin',
            ], 400);
        }

        try {
            $event->audit('deleted', $event->toArray(), null, 'Game event deleted');
            $event->delete();

            return response()->json([
                'success' => true,
                'message' => 'Game event berhasil dihapus',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal hapus game event: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get groups for a game event.
     */
    public function groups($id)
    {
        $event = GameEvent::find($id);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Game event tidak ditemukan',
            ], 404);
        }

        $groups = $event->groups()->orderBy('name', 'asc')->get();

        // Load counts & points
        $groups->transform(function ($group) {
            $group->participants_count = $group->participants()->count();
            $group->total_points = $group->transactions()->sum('points');
            return $group;
        });

        return response()->json([
            'success' => true,
            'data'    => $groups,
        ]);
    }

    /**
     * Create a new group for game event.
     */
    public function storeGroup(Request $request, $id)
    {
        $event = GameEvent::find($id);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Game event tidak ditemukan',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name'  => 'required|string|max:255',
            'color' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            $group = EventGroup::create([
                'game_event_id' => $event->id,
                'name'          => $request->name,
                'color'         => $request->color ?: 'blue',
            ]);

            $group->audit('created', null, $group->toArray(), 'Event group created');

            return response()->json([
                'success' => true,
                'message' => 'Kelompok berhasil dibuat',
                'data'    => $group,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat kelompok: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a group.
     */
    public function updateGroup(Request $request, $id, $groupId)
    {
        $group = EventGroup::where('id', $groupId)->where('game_event_id', $id)->first();

        if (!$group) {
            return response()->json([
                'success' => false,
                'message' => 'Kelompok tidak ditemukan',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name'  => 'required|string|max:255',
            'color' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            $oldValues = $group->toArray();
            $updateData = ['name' => $request->name];
            if ($request->has('color')) {
                $updateData['color'] = $request->color;
            }
            $group->update($updateData);
            $group->audit('updated', $oldValues, $group->toArray(), 'Event group updated');

            return response()->json([
                'success' => true,
                'message' => 'Kelompok berhasil diupdate',
                'data'    => $group,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal update kelompok: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a group.
     */
    public function destroyGroup($id, $groupId)
    {
        $group = EventGroup::where('id', $groupId)->where('game_event_id', $id)->first();

        if (!$group) {
            return response()->json([
                'success' => false,
                'message' => 'Kelompok tidak ditemukan',
            ], 404);
        }

        // Check if has important data
        $hasParticipants = $group->participants()->exists();
        $hasTransactions = $group->transactions()->exists();

        if ($hasParticipants || $hasTransactions) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak bisa hapus kelompok yang sudah memiliki peserta atau transaksi',
            ], 400);
        }

        try {
            $group->audit('deleted', $group->toArray(), null, 'Event group deleted');
            $group->delete();

            return response()->json([
                'success' => true,
                'message' => 'Kelompok berhasil dihapus',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal hapus kelompok: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate QR code for group registration.
     */
    public function generateGroupQr($id, $groupId)
    {
        $group = EventGroup::where('id', $groupId)
                          ->where('game_event_id', $id)
                          ->with('gameEvent')
                          ->first();

        if (!$group) {
            return response()->json([
                'success' => false,
                'message' => 'Kelompok tidak ditemukan',
            ], 404);
        }

        try {
            // Generate URL untuk registration
            $frontendUrl = env('FRONTEND_URL');
            $url = $frontendUrl ? rtrim($frontendUrl, '/') . "/games/register/{$group->register_token}" : url("/games/register/{$group->register_token}");

            // Generate QR Code
            $qrCode = new QrCode($url);
            $qrCode->setSize(300);
            $qrCode->setMargin(10);

            $writer = new PngWriter();
            $result = $writer->write($qrCode);

            // Convert to base64
            $qrBase64 = base64_encode($result->getString());

            return response()->json([
                'success' => true,
                'data'    => [
                    'qr_code'   => 'data:image/png;base64,' . $qrBase64,
                    'url'       => $url,
                    'token'     => $group->register_token,
                    'group'     => $group->name,
                    'event'     => $group->gameEvent->name,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal generate QR code: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get participants for a group.
     */
    public function groupParticipants($id, $groupId)
    {
        $group = EventGroup::where('id', $groupId)->where('game_event_id', $id)->first();

        if (!$group) {
            return response()->json([
                'success' => false,
                'message' => 'Kelompok tidak ditemukan',
            ], 404);
        }

        $participants = $group->participants()
                             ->orderBy('created_at', 'desc')
                             ->get();

        // Load points
        $participants->transform(function ($p) {
            $p->total_points = $p->transactions()->sum('points');
            $p->scan_count = $p->transactions()->count();
            return $p;
        });

        return response()->json([
            'success' => true,
            'data'    => $participants,
        ]);
    }

    /**
     * Get game event linked to an event.
     */
    public function getByEventId($eventId)
    {
        $event = Event::find($eventId);
        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Event tidak ditemukan',
            ], 404);
        }

        $gameEvent = GameEvent::where('event_id', $event->id)
            ->with(['groups' => function ($q) {
                $q->orderBy('name', 'asc');
            }, 'pointQrCodes' => function ($q) {
                $q->orderBy('point_value', 'asc');
            }])
            ->first();

        if ($gameEvent) {
            $gameEvent->groups->transform(function ($group) {
                $group->participants_count = $group->participants()->count();
                $group->total_points = (int) $group->transactions()->sum('points');
                return $group;
            });
            $gameEvent->pointQrCodes->transform(function ($qr) {
                $qr->scan_count = $qr->transactions()->count();
                return $qr;
            });
            $gameEvent->total_points = (int) $gameEvent->transactions()->sum('points');
            $gameEvent->total_participants = (int) GroupParticipant::whereIn('event_group_id', $gameEvent->groups->pluck('id'))->count();
            $gameEvent->total_transactions = (int) $gameEvent->transactions()->count();
        }

        return response()->json([
            'success' => true,
            'data'    => $gameEvent,
        ]);
    }

    /**
     * Link or create a game event for a standard event.
     */
    public function linkToEvent(Request $request, $eventId)
    {
        $event = Event::find($eventId);
        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Event tidak ditemukan',
            ], 404);
        }

        $gameEvent = GameEvent::where('event_id', $event->id)->first();
        if (!$gameEvent) {
            $gameEvent = GameEvent::create([
                'event_id'    => $event->id,
                'name'        => $request->name ?: ('Games: ' . $event->name),
                'description' => $request->description ?: ($event->description ?: 'Sistem point & kompetisi games untuk ' . $event->name),
                'start_date'  => $event->start_date ?: $event->event_date,
                'end_date'    => $event->end_date ?: $event->start_date ?: $event->event_date,
                'status'      => 'active',
                'created_by'  => auth()->id(),
            ]);

            // Create default groups (Merah, Biru, Hijau, Kuning)
            $defaultGroups = [
                ['name' => 'Tim Merah', 'color' => 'red'],
                ['name' => 'Tim Biru', 'color' => 'blue'],
                ['name' => 'Tim Hijau', 'color' => 'emerald'],
                ['name' => 'Tim Emas', 'color' => 'amber'],
            ];

            foreach ($defaultGroups as $grp) {
                EventGroup::create([
                    'game_event_id' => $gameEvent->id,
                    'name'          => $grp['name'],
                    'color'         => $grp['color'],
                ]);
            }

            // Create default QRIS Point checkpoints
            $defaultPoints = [
                ['value' => 10, 'title' => 'Pos 1: Check-In & Yel-yel Tim'],
                ['value' => 25, 'title' => 'Pos 2: Mini Games Ketangkasan'],
                ['value' => 50, 'title' => 'Pos 3: Quiz Wawasan & Kolaborasi'],
                ['value' => 100, 'title' => 'Pos 4: Tantangan Utama Games'],
            ];

            foreach ($defaultPoints as $dp) {
                PointQrCode::create([
                    'game_event_id' => $gameEvent->id,
                    'point_value'   => $dp['value'],
                    'title'         => $dp['title'],
                    'status'        => 'active',
                ]);
            }
        }

        return $this->getByEventId($eventId);
    }

    /**
     * Add a participant manually to a group (by panitia/admin).
     */
    public function storeParticipant(Request $request, $id, $groupId)
    {
        $group = EventGroup::where('id', $groupId)->where('game_event_id', $id)->first();
        if (!$group) {
            return response()->json([
                'success' => false,
                'message' => 'Kelompok tidak ditemukan',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name'  => 'required|string|max:255',
            'phone' => 'required|string|max:30',
            'email' => 'nullable|email|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $exists = GroupParticipant::where('event_group_id', $group->id)
                                  ->where('phone', $request->phone)
                                  ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Nomor telepon sudah terdaftar di kelompok ini',
            ], 400);
        }

        try {
            $participant = GroupParticipant::create([
                'event_group_id' => $group->id,
                'name'           => $request->name,
                'phone'          => $request->phone,
                'email'          => $request->email,
                'registered_at'  => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Peserta berhasil ditambahkan ke ' . $group->name,
                'data'    => $participant,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan peserta: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a participant from a group.
     */
    public function destroyParticipant($id, $groupId, $participantId)
    {
        $participant = GroupParticipant::where('id', $participantId)
                                      ->where('event_group_id', $groupId)
                                      ->first();

        if (!$participant) {
            return response()->json([
                'success' => false,
                'message' => 'Peserta tidak ditemukan',
            ], 404);
        }

        try {
            $participant->delete();

            return response()->json([
                'success' => true,
                'message' => 'Peserta berhasil dihapus dari kelompok',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus peserta: ' . $e->getMessage(),
            ], 500);
        }
    }
}
