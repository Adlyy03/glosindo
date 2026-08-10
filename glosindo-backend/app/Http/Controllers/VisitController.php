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
        $query = Visit::with('visitor');

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
     * Get active visitors (status IN).
     *
     * @return \Illuminate\Http\Response
     */
    public function active()
    {
        $visits = Visit::with('visitor')
            ->where('status', 'IN')
            ->orderBy('check_in', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $visits,
        ]);
    }

    /**
     * Get visit history with pagination.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function history(Request $request)
    {
        $query = Visit::with('visitor');

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

        $visits = $query->orderBy('check_in', 'desc')->paginate(20);

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
            'purpose' => $request->purpose,
            'meet_to' => $request->meet_to,
            'status' => 'IN',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Check-in successful',
            'data' => $visit->load('visitor'),
        ], 201);
    }

    /**
     * Display the specified visit.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $visit = Visit::with('visitor')->find($id);

        if (!$visit) {
            return response()->json([
                'success' => false,
                'message' => 'Visit not found',
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
        $visit = Visit::find($id);

        if (!$visit) {
            return response()->json([
                'success' => false,
                'message' => 'Visit not found',
            ], 404);
        }

        if ($visit->status === 'OUT') {
            return response()->json([
                'success' => false,
                'message' => 'Visit already checked out',
            ], 422);
        }

        $visit->update([
            'check_out' => Carbon::now(),
            'status' => 'OUT',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Check-out successful',
            'data' => $visit->load('visitor'),
        ]);
    }

    /**
     * Delete a visit record.
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

        $visit->delete();

        return response()->json([
            'success' => true,
            'message' => 'Visit deleted successfully',
        ]);
    }
}
