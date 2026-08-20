<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Visit;
use App\Models\Visitor;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics for admin & supervisor.
     *
     * @return \Illuminate\Http\Response
     */
    public function stats()
    {
        $today = Carbon::today()->toDateString();

        // Regular visitor stats
        $totalVisitor       = Visitor::count();
        $visitorToday       = Visit::whereDate('check_in', Carbon::today())->distinct('visitor_id')->count('visitor_id');
        $activeVisitor      = Visit::where('status', 'IN')->count();
        $totalVisitThisMonth = Visit::whereMonth('check_in', Carbon::now()->month)
            ->whereYear('check_in', Carbon::now()->year)
            ->count();

        // Event stats
        $totalEvents   = Event::count();
        $activeEvents  = Event::whereIn('status', ['scheduled', 'ongoing', 'active'])
            ->where(function ($q) use ($today) {
                $q->whereDate('event_date', $today)
                  ->orWhere(function ($sub) use ($today) {
                      $sub->whereDate('start_date', '<=', $today)
                          ->whereDate('end_date', '>=', $today);
                  });
            })->count();

        $finishedEvents = Event::where('status', 'finished')
            ->orWhere(function ($q) use ($today) {
                $q->where('status', '!=', 'cancelled')
                  ->whereDate('end_date', '<', $today);
            })->count();

        $totalParticipants        = EventParticipant::count();
        $participantsCheckedIn    = EventParticipant::where('status', 'checked_in')->count();
        $participantsNotCheckedIn = EventParticipant::where('status', 'registered')->count();

        // Upcoming / Active Events List
        $upcomingEvents = Event::where('status', '!=', 'cancelled')
            ->where(function ($q) use ($today) {
                $q->whereDate('end_date', '>=', $today)
                  ->orWhereDate('event_date', '>=', $today)
                  ->orWhereNull('end_date');
            })
            ->withCount(['participants', 'visits'])
            ->orderBy(DB::raw('COALESCE(start_date, event_date)'), 'asc')
            ->limit(5)
            ->get();

        $stats = [
            'total_visitor'               => $totalVisitor,
            'visitor_today'               => $visitorToday,
            'active_visitor'              => $activeVisitor,
            'total_visit_this_month'      => $totalVisitThisMonth,
            // Event Specific Statistics
            'total_events'                => $totalEvents,
            'active_events'               => $activeEvents,
            'finished_events'             => $finishedEvents,
            'total_event_participants'    => $totalParticipants,
            'event_participants_checked_in' => $participantsCheckedIn,
            'event_participants_not_checked_in' => $participantsNotCheckedIn,
            'event_today'                 => $activeEvents,
            'upcoming_events'             => $upcomingEvents,
        ];

        return response()->json([
            'success' => true,
            'data'    => $stats,
        ]);
    }

    /**
     * Get simple dashboard statistics for receptionist.
     *
     * @return \Illuminate\Http\Response
     */
    public function receptionistStats()
    {
        $user  = auth()->user();
        $today = Carbon::today()->toDateString();

        $activeEvents = Event::whereIn('status', ['scheduled', 'ongoing', 'active'])
            ->where(function ($q) use ($today) {
                $q->whereDate('event_date', $today)
                  ->orWhere(function ($sub) use ($today) {
                      $sub->whereDate('start_date', '<=', $today)
                          ->whereDate('end_date', '>=', $today);
                  });
            })->count();

        $stats = [
            'active_visitor'       => Visit::where('status', 'IN')
                ->where('receptionist_id', $user->id)
                ->count(),
            'visitor_today'        => Visit::whereDate('check_in', Carbon::today())
                ->where('receptionist_id', $user->id)
                ->distinct('visitor_id')
                ->count('visitor_id'),
            'total_check_in_today' => Visit::whereDate('check_in', Carbon::today())
                ->where('receptionist_id', $user->id)
                ->count(),
            'events_today'         => $activeEvents,
            'active_events'        => $activeEvents,
            'total_events'         => Event::count(),
            'total_participants'   => EventParticipant::count(),
        ];

        return response()->json([
            'success' => true,
            'data'    => $stats,
        ]);
    }

    /**
     * Get visit trends for chart (last 7 days) - Admin only.
     *
     * @return \Illuminate\Http\Response
     */
    public function visitTrends()
    {
        $trends = Visit::select(
                DB::raw('DATE(check_in) as date'),
                DB::raw('COUNT(*) as count'),
                DB::raw('COUNT(event_id) as event_count'),
                DB::raw('COUNT(CASE WHEN event_id IS NULL THEN 1 END) as regular_count')
            )
            ->where('check_in', '>=', Carbon::now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $trends,
        ]);
    }

    /**
     * Get monthly visit trends (last 6 months) - Admin only.
     *
     * @return \Illuminate\Http\Response
     */
    public function monthlyTrends()
    {
        $trends = Visit::select(
                DB::raw('YEAR(check_in) as year'),
                DB::raw('MONTH(check_in) as month'),
                DB::raw('COUNT(*) as count'),
                DB::raw('COUNT(event_id) as event_count')
            )
            ->where('check_in', '>=', Carbon::now()->subMonths(6))
            ->groupBy('year', 'month')
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $trends,
        ]);
    }

    /**
     * Get top visitors (most visits) - Admin only.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function topVisitors(Request $request)
    {
        $limit = $request->get('limit', 10);

        $topVisitors = Visitor::select('visitors.*')
            ->withCount('visits')
            ->orderBy('visits_count', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $topVisitors,
        ]);
    }
}
