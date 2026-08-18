<?php

namespace App\Http\Controllers;

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
        $query = Visit::with(['visitor', 'receptionist:id,name,email']);

        // Receptionist only see their own visits, supervisor & admin see all
        if ($user->role === 'receptionist') {
            $query->where('receptionist_id', $user->id);
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

        // Search by visitor name
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->whereHas('visitor', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $visits = $query->orderBy('check_in', 'desc')->paginate(15);

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
            'purpose' => 'required|string|max:255',
            'meet_to' => 'required|string|max:255',
        ]);

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
            'visitor_id' => $request->visitor_id,
            'receptionist_id' => auth()->id(),
            'purpose' => $request->purpose,
            'meet_to' => $request->meet_to,
            'check_in' => Carbon::now(),
            'status' => 'IN',
        ]);

        // Audit log
        $visit->audit('checked_in', null, $visit->toArray(), "Visitor checked in");

        return response()->json([
            'success' => true,
            'message' => 'Check-in successful',
            'data' => $visit->load(['visitor', 'receptionist:id,name,email']),
        ], 201);
    }

    /**
     * Get active visits (status = IN).
     *
     * @return \Illuminate\Http\Response
     */
    public function active()
    {
        $user = auth()->user();
        $query = Visit::whereHas('visitor')
            ->with(['visitor', 'receptionist:id,name,email'])
            ->where('status', 'IN');

        // Receptionist only see their own visits, supervisor & admin see all
        if ($user->role === 'receptionist') {
            $query->where('receptionist_id', $user->id);
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
        $user = auth()->user();
        $query = Visit::with(['visitor', 'receptionist:id,name,email']);

        // Receptionist only see their own visits, supervisor & admin see all
        if ($user->role === 'receptionist') {
            $query->where('receptionist_id', $user->id);
        }

        // Filter by date range
        if ($request->has('start_date') && !empty($request->start_date)) {
            $query->whereDate('check_in', '>=', $request->start_date);
        }

        if ($request->has('end_date') && !empty($request->end_date)) {
            $query->whereDate('check_in', '<=', $request->end_date);
        }

        // Search by visitor name
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->whereHas('visitor', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $visits = $query->orderBy('check_in', 'desc')->paginate(15);

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
        $query = Visit::with(['visitor', 'receptionist:id,name,email']);

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
            'status' => 'OUT',
        ]);

        // Audit log
        $visit->audit('checked_out', $oldValues, $visit->fresh()->toArray(), "Visitor checked out");

        return response()->json([
            'success' => true,
            'message' => 'Check-out successful',
            'data' => $visit->load(['visitor', 'receptionist:id,name,email']),
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
