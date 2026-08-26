<?php

namespace App\Http\Controllers;

use App\Models\GameEvent;
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
            'name' => 'required|string|max:255',
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
            'name' => 'required|string|max:255',
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
            $group->update(['name' => $request->name]);
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
            $url = url("/games/register/{$group->register_token}");

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
}
