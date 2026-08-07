<?php

namespace App\Http\Controllers;

use App\Models\Visit;
use App\Models\Visitor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics.
     *
     * @return \Illuminate\Http\Response
     */
    public function stats()
    {
        $stats = [
            'total_visitor' => Visitor::count(),
            'visitor_today' => Visit::whereDate('check_in', today())->distinct('visitor_id')->count('visitor_id'),
            'active_visitor' => Visit::where('status', 'IN')->count(),
            'total_visit_this_month' => Visit::whereMonth('check_in', now()->month)
                ->whereYear('check_in', now()->year)
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get visit trends for chart (last 7 days).
     *
     * @return \Illuminate\Http\Response
     */
    public function visitTrends()
    {
        $trends = Visit::select(
                DB::raw('DATE(check_in) as date'),
                DB::raw('COUNT(*) as count')
            )
            ->where('check_in', '>=', now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $trends,
        ]);
    }

    /**
     * Get monthly visit trends (last 6 months).
     *
     * @return \Illuminate\Http\Response
     */
    public function monthlyTrends()
    {
        $trends = Visit::select(
                DB::raw('YEAR(check_in) as year'),
                DB::raw('MONTH(check_in) as month'),
                DB::raw('COUNT(*) as count')
            )
            ->where('check_in', '>=', now()->subMonths(6))
            ->groupBy('year', 'month')
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $trends,
        ]);
    }

    /**
     * Get top visitors (most visits).
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
            'data' => $topVisitors,
        ]);
    }
}
