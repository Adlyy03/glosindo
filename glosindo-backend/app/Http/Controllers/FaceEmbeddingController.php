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
