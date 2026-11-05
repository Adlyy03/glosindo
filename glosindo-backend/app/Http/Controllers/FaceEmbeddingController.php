<?php

namespace App\Http\Controllers;

use App\Models\FaceEmbedding;
use App\Models\Visitor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class FaceEmbeddingController extends Controller
{
    /**
     * Get all face embeddings with visitor info (Role restricted: admin, receptionist, supervisor).
     * Cached in memory/redis for 5 minutes with float precision compression.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $data = Cache::remember('face_embeddings_all', 60, function () {
            return FaceEmbedding::whereHas('visitor', function ($q) { $q->whereNull('deleted_at'); })
                ->with(['visitor' => function ($q) { $q->select('id', 'name', 'company')->whereNull('deleted_at'); }])
                ->get(['id', 'visitor_id', 'face_vector'])
                ->map(function ($embedding) {
                    $vec = $embedding->face_vector;
                    if (is_string($vec)) {
                        $vec = json_decode($vec, true);
                    }
                    if (!is_array($vec) || count($vec) !== 128) {
                        return null;
                    }
                    // Compress float precision to 4 decimal places to reduce JSON payload size by ~60%
                    $compactVec = array_map(function ($val) {
                        return round((float) $val, 4);
                    }, $vec);

                    return [
                        'visitor_id'  => $embedding->visitor_id,
                        'name'        => $embedding->visitor->name,
                        'company'     => $embedding->visitor->company,
                        'face_vector' => $compactVec,
                    ];
                })
                ->filter()
                ->values();
        });

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    /**
     * Check if face already registered (duplicate detection).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function checkDuplicate(Request $request)
    {
        $this->validate($request, [
            'face_vector'   => 'required|array',
            'face_vector.*' => 'required|numeric',
        ]);

        if (count($request->face_vector) !== 128) {
            return response()->json([
                'success' => false,
                'message' => 'Face vector must contain exactly 128 dimensions',
            ], 422);
        }

        $threshold = (float) env('FACE_MATCH_THRESHOLD', 0.35);
        $thresholdSq = $threshold * $threshold;

        $embeddings = FaceEmbedding::has('visitor')
            ->with('visitor:id,name,company,photo')
            ->get(['id', 'visitor_id', 'face_vector']);

        foreach ($embeddings as $embedding) {
            $distSq = FaceEmbedding::distanceSquared($request->face_vector, $embedding->face_vector, $thresholdSq);
            if ($distSq < $thresholdSq) {
                return response()->json([
                    'success'   => true,
                    'duplicate' => true,
                    'visitor'   => $embedding->visitor,
                    'distance'  => round(sqrt($distSq), 4),
                ]);
            }
        }

        return response()->json([
            'success'   => true,
            'duplicate' => false,
        ]);
    }

    /**
     * Store or update face embedding for a visitor.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $visitorId
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, $visitorId)
    {
        $visitor = Visitor::find($visitorId);

        if (!$visitor) {
            return response()->json([
                'success' => false,
                'message' => 'Visitor not found',
            ], 404);
        }

        $this->validate($request, [
            'face_vector'   => 'required|array',
            'face_vector.*' => 'required|numeric',
        ]);

        if (count($request->face_vector) !== 128) {
            return response()->json([
                'success' => false,
                'message' => 'Face vector must contain exactly 128 dimensions',
            ], 422);
        }

        $threshold = (float) env('FACE_MATCH_THRESHOLD', 0.35);
        $thresholdSq = $threshold * $threshold;

        // Check duplicate face before storing (except own embedding)
        $embeddings = FaceEmbedding::where('visitor_id', '!=', $visitorId)->get(['id', 'visitor_id', 'face_vector']);

        foreach ($embeddings as $embedding) {
            $distSq = FaceEmbedding::distanceSquared($request->face_vector, $embedding->face_vector, $thresholdSq);
            if ($distSq < $thresholdSq) {
                $existingVisitor = Visitor::find($embedding->visitor_id);
                return response()->json([
                    'success'          => false,
                    'message'          => 'Face already registered',
                    'duplicate'        => true,
                    'existing_visitor' => $existingVisitor,
                    'distance'         => round(sqrt($distSq), 4),
                ], 422);
            }
        }

        // Compact vector floats to 4 decimals before saving
        $compactVector = array_map(function ($val) {
            return round((float) $val, 4);
        }, $request->face_vector);

        $embedding = FaceEmbedding::updateOrCreate(
            ['visitor_id' => $visitorId],
            ['face_vector' => $compactVector]
        );

        Cache::forget('face_embeddings_all');

        return response()->json([
            'success' => true,
            'message' => 'Face embedding saved successfully',
            'data'    => $embedding,
        ], 201);
    }

    /**
     * Delete face embedding for a visitor (ADMIN ONLY).
     *
     * @param  int  $visitorId
     * @return \Illuminate\Http\Response
     */
    public function destroy($visitorId)
    {
        $embedding = FaceEmbedding::where('visitor_id', $visitorId)->first();

        if (!$embedding) {
            return response()->json([
                'success' => false,
                'message' => 'Face embedding not found',
            ], 404);
        }

        $embedding->delete();
        Cache::forget('face_embeddings_all');

        return response()->json([
            'success' => true,
            'message' => 'Face embedding deleted successfully',
        ]);
    }
}
