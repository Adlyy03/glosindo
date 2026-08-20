<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Visit;
use App\Models\Visitor;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class VisitController extends Controller
{
    /**
     * Display a listing of visits.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = Visit::with(['visitor', 'receptionist:id,name,email', 'event:id,name,code']);

        // Receptionist only see their own visits, supervisor & admin see all
        if ($user->role === 'receptionist') {
            $query->where('receptionist_id', $user->id);
        }

        // Filter by type: regular / event
        if ($request->has('type') && !empty($request->type)) {
            if ($request->type === 'event') {
                $query->whereNotNull('event_id');
            } elseif ($request->type === 'regular') {
                $query->whereNull('event_id');
            }
        }

        // Filter by specific event
        if ($request->has('event_id') && !empty($request->event_id)) {
            $query->where('event_id', $request->event_id);
        }

        // Filter by date range
        if ($request->has('start_date') && !empty($request->start_date)) {
            $query->whereDate('check_in', '>=', $request->start_date);
        }

        if ($request->has('end_date') && !empty($request->end_date)) {
            $query->whereDate('check_in', '<=', $request->end_date);
        }

        // Filter by status
        if ($request->has('status') && in_array($request->status, ['IN', 'OUT'])) {
            $query->where('status', $request->status);
        }

        // Search by visitor name, meet_to, or event name
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('visitor', function ($subQ) use ($search) {
                    $subQ->where('name', 'like', "%{$search}%")
                         ->orWhere('company', 'like', "%{$search}%");
                })
                ->orWhere('visitor_name', 'like', "%{$search}%")
                ->orWhere('visitor_company', 'like', "%{$search}%")
                ->orWhere('meet_to', 'like', "%{$search}%")
                ->orWhere('purpose', 'like', "%{$search}%")
                ->orWhereHas('event', function ($evtQ) use ($search) {
                    $evtQ->where('name', 'like', "%{$search}%");
                });
            });
        }

        $visits = $query->orderBy('check_in', 'desc')->paginate(15);
        
        // Transform data: use snapshot if visitor deleted
        $visits->getCollection()->transform(function ($visit) {
            if (!$visit->visitor && $visit->visitor_name) {
                $visit->visitor = (object) [
                    'id' => null,
                    'name' => $visit->visitor_name,
                    'company' => $visit->visitor_company,
                    'phone' => $visit->visitor_phone,
                    'deleted' => true,
                ];
            }
            return $visit;
        });

        return response()->json([
            'success' => true,
            'data' => $visits,
        ]);
    }

    /**
     * Store a new visit (check-in).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'visitor_id' => 'required|exists:visitors,id',
            'purpose'    => 'required|string|max:255',
            'meet_to'    => 'required_without:event_id|nullable|string|max:255',
            'event_id'   => 'nullable|exists:events,id',
        ]);

        $meetTo = $request->meet_to ?? '-';

        // Validate event if provided
        if ($request->event_id) {
            $event = Event::find($request->event_id);
            if (!$event) {
                return response()->json([
                    'success' => false,
                    'message' => 'Event tidak ditemukan.',
                ], 422);
            }
            if (in_array($event->status, ['cancelled', 'finished'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Event sudah ' . ($event->status === 'cancelled' ? 'dibatalkan' : 'selesai') . ' dan tidak dapat digunakan untuk check-in.',
                ], 422);
            }
            // For event participants, set meet_to format: "Event: {Nama Event}"
            $meetTo = 'Event: ' . $event->name;
        }

        // Check if visitor already has an active visit
        $activeVisit = Visit::where('visitor_id', $request->visitor_id)
            ->where('status', 'IN')
            ->first();

        if ($activeVisit) {
            return response()->json([
                'success' => false,
                'message' => 'Visitor already has an active check-in. Please check-out first.',
            ], 422);
        }

        $visit = Visit::create([
            'visitor_id'       => $request->visitor_id,
            'receptionist_id'  => auth()->id(),
            'event_id'         => $request->event_id ?? null,
            'purpose'          => $request->purpose,
            'meet_to'          => $meetTo,
            'check_in'         => Carbon::now(),
            'status'           => 'IN',
        ]);

        // Sync with EventParticipant if event_id is present
        if ($request->event_id) {
            $participant = EventParticipant::where('event_id', $request->event_id)
                ->where('visitor_id', $request->visitor_id)
                ->first();

            if ($participant) {
                $participant->update([
                    'status'        => 'checked_in',
                    'checked_in_at' => Carbon::now(),
                ]);
            } else {
                $v = Visitor::find($request->visitor_id);
                if ($v) {
                    EventParticipant::create([
                        'event_id'      => $request->event_id,
                        'visitor_id'    => $v->id,
                        'name'          => $v->name,
                        'phone'         => $v->phone,
                        'email'         => $v->email,
                        'company'       => $v->company,
                        'position'      => $v->position,
                        'status'        => 'checked_in',
                        'registered_at' => Carbon::now(),
                        'checked_in_at' => Carbon::now(),
                    ]);
                }
            }
        }

        // Audit log
        $visit->audit('checked_in', null, $visit->toArray(), "Visitor checked in" . ($request->event_id ? " for Event" : ""));

        return response()->json([
            'success' => true,
            'message' => 'Check-in successful',
            'data'    => $visit->load(['visitor', 'receptionist:id,name,email', 'event:id,name,code']),
        ], 201);
    }

    /**
     * Get active visits (status = IN).
     *
     * @return \Illuminate\Http\Response
     */
    public function active(Request $request)
    {
        $user = auth()->user();
        $query = Visit::whereHas('visitor')
            ->with(['visitor', 'receptionist:id,name,email', 'event:id,name,code'])
            ->where('status', 'IN');

        // Receptionist only see their own visits, supervisor & admin see all
        if ($user->role === 'receptionist') {
            $query->where('receptionist_id', $user->id);
        }

        // Filter by type: regular / event
        if ($request->has('type') && !empty($request->type)) {
            if ($request->type === 'event') {
                $query->whereNotNull('event_id');
            } elseif ($request->type === 'regular') {
                $query->whereNull('event_id');
            }
        }

        $visits = $query->orderBy('check_in', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $visits,
        ]);
    }

    /**
     * Get visit history with pagination and filters.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function history(Request $request)
    {
        $query = Visit::with(['visitor', 'receptionist:id,name,email', 'event:id,name,code']);

        // Filter by type: regular / event
        if ($request->has('type') && !empty($request->type)) {
            if ($request->type === 'event') {
                $query->whereNotNull('event_id');
            } elseif ($request->type === 'regular') {
                $query->whereNull('event_id');
            }
        }

        // Filter by event_id
        if ($request->has('event_id') && !empty($request->event_id)) {
            $query->where('event_id', $request->event_id);
        }

        // Filter by date range
        if ($request->has('start_date') && !empty($request->start_date)) {
            $query->whereDate('check_in', '>=', $request->start_date);
        }

        if ($request->has('end_date') && !empty($request->end_date)) {
            $query->whereDate('check_in', '<=', $request->end_date);
        }

        // Search by visitor name, meet_to, or event name
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('visitor', function ($subQ) use ($search) {
                    $subQ->where('name', 'like', "%{$search}%")
                         ->orWhere('company', 'like', "%{$search}%");
                })
                ->orWhere('visitor_name', 'like', "%{$search}%")
                ->orWhere('visitor_company', 'like', "%{$search}%")
                ->orWhere('meet_to', 'like', "%{$search}%")
                ->orWhere('purpose', 'like', "%{$search}%")
                ->orWhereHas('event', function ($evtQ) use ($search) {
                    $evtQ->where('name', 'like', "%{$search}%");
                });
            });
        }

        $visits = $query->orderBy('check_in', 'desc')->paginate(15);
        
        // Transform data: use snapshot if visitor deleted
        $visits->getCollection()->transform(function ($visit) {
            if (!$visit->visitor && $visit->visitor_name) {
                $visit->visitor = (object) [
                    'id' => null,
                    'name' => $visit->visitor_name,
                    'company' => $visit->visitor_company,
                    'phone' => $visit->visitor_phone,
                    'deleted' => true,
                ];
            }
            return $visit;
        });

        return response()->json([
            'success' => true,
            'data' => $visits,
        ]);
    }

    /**
     * Display the specified visit.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $user = auth()->user();
        $query = Visit::with(['visitor', 'receptionist:id,name,email', 'event:id,name,code']);

        // Receptionist only see their own visits, supervisor & admin see all
        if ($user->role === 'receptionist') {
            $query->where('receptionist_id', $user->id);
        }

        $visit = $query->find($id);

        if (!$visit) {
            return response()->json([
                'success' => false,
                'message' => 'Visit not found or you do not have permission',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $visit,
        ]);
    }

    /**
     * Check-out a visitor.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function checkout($id)
    {
        $user = auth()->user();
        $query = Visit::query();

        // Receptionist only checkout their own visits
        if ($user->role === 'receptionist') {
            $query->where('receptionist_id', $user->id);
        }

        $visit = $query->find($id);

        if (!$visit) {
            return response()->json([
                'success' => false,
                'message' => 'Visit not found or you do not have permission',
            ], 404);
        }

        if ($visit->status === 'OUT') {
            return response()->json([
                'success' => false,
                'message' => 'Visit already checked out',
            ], 422);
        }

        $oldValues = $visit->toArray();

        $visit->update([
            'check_out' => Carbon::now(),
            'status'    => 'OUT',
        ]);

        // Sync with EventParticipant if applicable
        if ($visit->event_id) {
            $participant = EventParticipant::where('event_id', $visit->event_id)
                ->where('visitor_id', $visit->visitor_id)
                ->first();

            if ($participant) {
                $participant->update([
                    'status'         => 'checked_out',
                    'checked_out_at' => Carbon::now(),
                ]);
            }
        }

        // Audit log
        $visit->audit('checked_out', $oldValues, $visit->fresh()->toArray(), "Visitor checked out");

        return response()->json([
            'success' => true,
            'message' => 'Check-out successful',
            'data'    => $visit->load(['visitor', 'receptionist:id,name,email', 'event:id,name,code']),
        ]);
    }

    /**
     * Delete a visit record (admin only).
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $visit = Visit::find($id);

        if (!$visit) {
            return response()->json([
                'success' => false,
                'message' => 'Visit not found',
            ], 404);
        }

        // Audit log before deletion
        $visit->audit('deleted', $visit->toArray(), null, "Visit deleted by admin");

        $visit->delete();

        return response()->json([
            'success' => true,
            'message' => 'Visit deleted successfully',
        ]);
    }
}
