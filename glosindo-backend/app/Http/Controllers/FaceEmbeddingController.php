<?php

namespace App\Http\Controllers;

use App\Models\FaceEmbedding;
use App\Models\Visitor;
use Illuminate\Http\Request;

class FaceEmbeddingController extends Controller
{
    /**
     * Get all face embeddings with visitor info (for client-side matching).
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $embeddings = FaceEmbedding::with('visitor:id,name,company')->get();

        $data = $embeddings->map(function ($embedding) {
            return [
                'visitor_id' => $embedding->visitor_id,
                'name' => $embedding->visitor->name,
                'company' => $embedding->visitor->company,
                'face_vector' => $embedding->face_vector,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
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
            'face_vector' => 'required|array',
            'face_vector.*' => 'required|numeric',
        ]);

        if (count($request->face_vector) !== 128) {
            return response()->json([
                'success' => false,
                'message' => 'Face vector must contain exactly 128 dimensions',
            ], 422);
        }

        $embeddings = FaceEmbedding::with('visitor:id,name,company,photo')->get();
        $threshold = 0.4; // lower threshold to reduce false-positive duplicates

        foreach ($embeddings as $embedding) {
            $distance = $this->calculateEuclideanDistance($request->face_vector, $embedding->face_vector);
            
            if ($distance < $threshold) {
                return response()->json([
                    'success' => true,
                    'duplicate' => true,
                    'visitor' => $embedding->visitor,
                    'distance' => $distance,
                ]);
            }
        }

        return response()->json([
            'success' => true,
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
            'face_vector' => 'required|array',
            'face_vector.*' => 'required|numeric',
        ]);

        // Validate face_vector length (should be 128 dimensions for face-api.js)
        if (count($request->face_vector) !== 128) {
            return response()->json([
                'success' => false,
                'message' => 'Face vector must contain exactly 128 dimensions',
            ], 422);
        }

        // Check duplicate face before storing (except own embedding)
        $embeddings = FaceEmbedding::where('visitor_id', '!=', $visitorId)->get();
        $threshold = 0.4;

        foreach ($embeddings as $embedding) {
            $distance = $this->calculateEuclideanDistance($request->face_vector, $embedding->face_vector);
            
            if ($distance < $threshold) {
                $existingVisitor = Visitor::find($embedding->visitor_id);
                return response()->json([
                    'success' => false,
                    'message' => 'Face already registered',
                    'duplicate' => true,
                    'existing_visitor' => $existingVisitor,
                    'distance' => $distance,
                ], 422);
            }
        }

        // Update or create face embedding
        $embedding = FaceEmbedding::updateOrCreate(
            ['visitor_id' => $visitorId],
            ['face_vector' => $request->face_vector]
        );

        return response()->json([
            'success' => true,
            'message' => 'Face embedding saved successfully',
            'data' => $embedding,
        ], 201);
    }

    /**
     * Calculate Euclidean distance between two face vectors.
     *
     * @param  array  $vector1
     * @param  array  $vector2
     * @return float
     */
    private function calculateEuclideanDistance($vector1, $vector2)
    {
        $sum = 0;
        for ($i = 0; $i < count($vector1); $i++) {
            $sum += pow($vector1[$i] - $vector2[$i], 2);
        }
        return sqrt($sum);
    }

    /**
     * Delete face embedding for a visitor.
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

        return response()->json([
            'success' => true,
            'message' => 'Face embedding deleted successfully',
        ]);
    }
}
