<?php

namespace App\Http\Controllers;

use App\Models\GameEvent;
use App\Models\EventGroup;
use App\Models\GroupParticipant;
use App\Models\PointTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GamesDashboardController extends Controller
{
    /**
     * Get dashboard statistics for a game event.
     */
    public function stats($id)
    {
        $event = GameEvent::with('groups')->find($id);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Game event tidak ditemukan',
            ], 404);
        }

        // Total groups
        $totalGroups = $event->groups()->count();

        // Total participants
        $groupIds = $event->groups->pluck('id');
        $totalParticipants = GroupParticipant::whereIn('event_group_id', $groupIds)->count();

        // Total points
        $totalPoints = PointTransaction::where('game_event_id', $id)->sum('points');

        // Total transactions
        $totalTransactions = PointTransaction::where('game_event_id', $id)->count();

        return response()->json([
            'success' => true,
            'data'    => [
                'total_groups'       => $totalGroups,
                'total_participants' => $totalParticipants,
                'total_points'       => $totalPoints,
                'total_transactions' => $totalTransactions,
            ],
        ]);
    }

    /**
     * Get group rankings.
     */
    public function groupRankings($id)
    {
        $event = GameEvent::find($id);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Game event tidak ditemukan',
            ], 404);
        }

        // Ranking per kelompok berdasarkan total poin
        $rankings = EventGroup::where('event_groups.game_event_id', $id)
            ->select('event_groups.*')
            ->leftJoin('point_transactions', 'event_groups.id', '=', 'point_transactions.event_group_id')
            ->selectRaw('COALESCE(SUM(point_transactions.points), 0) as total_points')
            ->selectRaw('COUNT(DISTINCT point_transactions.group_participant_id) as active_participants')
            ->selectRaw('COUNT(point_transactions.id) as transaction_count')
            ->groupBy('event_groups.id', 'event_groups.game_event_id', 'event_groups.name', 'event_groups.code', 'event_groups.register_token', 'event_groups.created_at', 'event_groups.updated_at')
            ->orderByRaw('total_points DESC')
            ->get();

        // Add rank
        $rank = 1;
        $rankings->transform(function ($group) use (&$rank) {
            $group->rank = $rank++;
            $group->total_participants = $group->participants()->count();
            return $group;
        });

        return response()->json([
            'success' => true,
            'data'    => $rankings,
        ]);
    }

    /**
     * Get participant rankings.
     */
    public function participantRankings(Request $request, $id)
    {
        $event = GameEvent::with('groups')->find($id);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Game event tidak ditemukan',
            ], 404);
        }

        $groupIds = $event->groups->pluck('id');

        // Base query
        $query = GroupParticipant::whereIn('event_group_id', $groupIds)
            ->select('group_participants.*')
            ->with('eventGroup:id,name,game_event_id')
            ->leftJoin('point_transactions', 'group_participants.id', '=', 'point_transactions.group_participant_id')
            ->selectRaw('COALESCE(SUM(point_transactions.points), 0) as total_points')
            ->selectRaw('COUNT(point_transactions.id) as transaction_count')
            ->groupBy('group_participants.id', 'group_participants.event_group_id', 'group_participants.name', 'group_participants.phone', 'group_participants.email', 'group_participants.registered_at', 'group_participants.created_at', 'group_participants.updated_at', 'group_participants.deleted_at');

        // Filter by group if provided
        if ($request->has('group_id') && !empty($request->group_id)) {
            $query->where('group_participants.event_group_id', $request->group_id);
        }

        $rankings = $query->orderByRaw('total_points DESC')
                         ->orderBy('group_participants.name', 'asc')
                         ->get();

        // Add rank
        $rank = 1;
        $rankings->transform(function ($participant) use (&$rank) {
            $participant->rank = $rank++;
            return $participant;
        });

        return response()->json([
            'success' => true,
            'data'    => $rankings,
        ]);
    }

    /**
     * Get point distribution chart data.
     */
    public function pointDistribution($id)
    {
        $event = GameEvent::with('groups')->find($id);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Game event tidak ditemukan',
            ], 404);
        }

        // Total poin per kelompok untuk chart
        $distribution = EventGroup::where('game_event_id', $id)
            ->select('event_groups.id', 'event_groups.name')
            ->leftJoin('point_transactions', 'event_groups.id', '=', 'point_transactions.event_group_id')
            ->selectRaw('COALESCE(SUM(point_transactions.points), 0) as total_points')
            ->groupBy('event_groups.id', 'event_groups.name')
            ->orderBy('event_groups.name', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $distribution,
        ]);
    }

    /**
     * Get transactions history.
     */
    public function transactions(Request $request, $id)
    {
        $event = GameEvent::find($id);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Game event tidak ditemukan',
            ], 404);
        }

        $query = PointTransaction::where('game_event_id', $id)
            ->with([
                'participant:id,event_group_id,name,phone',
                'eventGroup:id,name',
                'pointQrCode:id,point_value',
            ])
            ->orderBy('scanned_at', 'desc');

        // Filter by group
        if ($request->has('group_id') && !empty($request->group_id)) {
            $query->where('event_group_id', $request->group_id);
        }

        // Filter by participant
        if ($request->has('participant_id') && !empty($request->participant_id)) {
            $query->where('group_participant_id', $request->participant_id);
        }

        // Date range
        if ($request->has('start_date') && !empty($request->start_date)) {
            $query->whereDate('scanned_at', '>=', $request->start_date);
        }

        if ($request->has('end_date') && !empty($request->end_date)) {
            $query->whereDate('scanned_at', '<=', $request->end_date);
        }

        $transactions = $query->paginate(50);

        return response()->json([
            'success' => true,
            'data'    => $transactions,
        ]);
    }

    /**
     * Export transactions to Excel.
     */
    public function exportTransactions($id)
    {
        $event = GameEvent::find($id);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Game event tidak ditemukan',
            ], 404);
        }

        // TODO: Implement Excel export similar to EventController
        // For now return JSON for MVP
        $transactions = PointTransaction::where('game_event_id', $id)
            ->with([
                'participant:id,event_group_id,name,phone',
                'eventGroup:id,name',
                'pointQrCode:id,point_value',
            ])
            ->orderBy('scanned_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $transactions,
            'message' => 'Export Excel will be implemented in next iteration',
        ]);
    }
}
