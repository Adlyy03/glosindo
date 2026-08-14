<?php

namespace App\Http\Controllers;

use App\Models\Visitor;
use App\Models\FaceEmbedding;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class VisitorController extends Controller
{
    /**
     * Display a listing of visitors.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $query = Visitor::query()->with(['faceEmbedding', 'latestVisit']);

        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%");
            });
        }

        $visitors = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $visitors,
        ]);
    }

    /**
     * Parse face_vector from request input safely.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|null
     */
    private function parseFaceVector(Request $request)
    {
        $faceVectorInput = $request->input('face_vector');

        if (is_string($faceVectorInput)) {
            $decoded = json_decode($faceVectorInput, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return array_map('floatval', $decoded);
            }
        }

        if (is_array($faceVectorInput)) {
            return array_map('floatval', $faceVectorInput);
        }

        return null;
    }

    /**
     * Calculate Euclidean distance between two face vectors safely.
     *
     * @param  mixed  $vector1
     * @param  mixed  $vector2
     * @return float
     */
    private function calculateEuclideanDistance($vector1, $vector2)
    {
        if (is_string($vector1)) {
            $vector1 = json_decode($vector1, true);
        }
        if (is_string($vector2)) {
            $vector2 = json_decode($vector2, true);
        }

        if (!is_array($vector1) || !is_array($vector2)) {
            return 999.0;
        }

        if (count($vector1) !== 128 || count($vector2) !== 128) {
            return 999.0;
        }

        $sum = 0;
        for ($i = 0; $i < 128; $i++) {
            $v1 = isset($vector1[$i]) ? floatval($vector1[$i]) : 0;
            $v2 = isset($vector2[$i]) ? floatval($vector2[$i]) : 0;
            $sum += pow($v1 - $v2, 2);
        }

        return sqrt($sum);
    }

    /**
     * Store a newly created visitor.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $faceVector = $this->parseFaceVector($request);
        if ($faceVector !== null) {
            $request->merge(['face_vector' => $faceVector]);
        }

        $this->validate($request, [
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'company' => 'nullable|string|max:255',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'face_vector' => 'nullable|array',
            'face_vector.*' => 'nullable|numeric',
        ]);

        // Check duplicate face if face_vector provided
        if ($faceVector !== null && is_array($faceVector)) {
            if (count($faceVector) !== 128) {
                return response()->json([
                    'success' => false,
                    'message' => 'Face vector must contain exactly 128 dimensions',
                ], 422);
            }

            $embeddings = FaceEmbedding::with('visitor:id,name,company,photo')->get();
            $threshold = 0.3;

            foreach ($embeddings as $embedding) {
                if (!$embedding->visitor) {
                    continue;
                }
                $distance = $this->calculateEuclideanDistance($faceVector, $embedding->face_vector);
                
                if ($distance < $threshold) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Face already registered. Visitor already exists.',
                        'duplicate' => true,
                        'existing_visitor' => $embedding->visitor,
                        'distance' => $distance,
                    ], 422);
                }
            }
        }

        $data = $request->only(['name', 'phone', 'email', 'company']);

        // Handle photo upload
        if ($request->hasFile('photo')) {
            $photo = $request->file('photo');
            $filename = time() . '_' . $photo->getClientOriginalName();
            $path = $photo->storeAs('visitors', $filename, 'public');
            $data['photo'] = $path;
        }

        $visitor = Visitor::create($data);

        // Save face embedding if provided
        if ($faceVector !== null && is_array($faceVector) && count($faceVector) === 128) {
            FaceEmbedding::updateOrCreate(
                ['visitor_id' => $visitor->id],
                ['face_vector' => $faceVector]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Visitor created successfully',
            'data' => $visitor->load('faceEmbedding'),
        ], 201);
    }

    /**
     * Display the specified visitor.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $visitor = Visitor::with(['faceEmbedding', 'visits' => function ($query) {
            $query->orderBy('check_in', 'desc');
        }])->find($id);

        if (!$visitor) {
            return response()->json([
                'success' => false,
                'message' => 'Visitor not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $visitor,
        ]);
    }

    /**
     * Update the specified visitor.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $visitor = Visitor::find($id);

        if (!$visitor) {
            return response()->json([
                'success' => false,
                'message' => 'Visitor not found',
            ], 404);
        }

        $faceVector = $this->parseFaceVector($request);
        if ($faceVector !== null) {
            $request->merge(['face_vector' => $faceVector]);
        }

        $this->validate($request, [
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'company' => 'nullable|string|max:255',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'face_vector' => 'nullable|array',
            'face_vector.*' => 'nullable|numeric',
        ]);

        $data = $request->only(['name', 'phone', 'email', 'company']);

        // Handle photo upload
        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($visitor->photo && Storage::disk('public')->exists($visitor->photo)) {
                Storage::disk('public')->delete($visitor->photo);
            }

            $photo = $request->file('photo');
            $filename = time() . '_' . $photo->getClientOriginalName();
            $path = $photo->storeAs('visitors', $filename, 'public');
            $data['photo'] = $path;
        }

        $visitor->update($data);

        // Handle face_vector update (separate from visitor data)
        if ($faceVector !== null && is_array($faceVector)) {
            if (count($faceVector) !== 128) {
                return response()->json([
                    'success' => false,
                    'message' => 'Face vector must contain exactly 128 dimensions',
                ], 422);
            }

            // Check duplicate face (exclude own embedding)
            $embeddings = FaceEmbedding::where('visitor_id', '!=', $id)->with('visitor:id,name,company,photo')->get();
            $threshold = 0.3;

            foreach ($embeddings as $embedding) {
                if (!$embedding->visitor) {
                    continue;
                }
                $distance = $this->calculateEuclideanDistance($faceVector, $embedding->face_vector);
                
                if ($distance < $threshold) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Face already registered to another visitor',
                        'duplicate' => true,
                        'existing_visitor' => $embedding->visitor,
                        'distance' => $distance,
                    ], 422);
                }
            }

            // Update or create face embedding
            FaceEmbedding::updateOrCreate(
                ['visitor_id' => $id],
                ['face_vector' => $faceVector]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Visitor updated successfully',
            'data' => $visitor->load('faceEmbedding'),
        ]);
    }

    /**
     * Remove the specified visitor.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $visitor = Visitor::find($id);

        if (!$visitor) {
            return response()->json([
                'success' => false,
                'message' => 'Visitor not found',
            ], 404);
        }

        // Delete photo if exists
        if ($visitor->photo && Storage::disk('public')->exists($visitor->photo)) {
            Storage::disk('public')->delete($visitor->photo);
        }

        // Soft-delete active and associated visits of deleted visitor
        $visitor->visits()->delete();

        $visitor->delete();

        return response()->json([
            'success' => true,
            'message' => 'Visitor deleted successfully',
        ]);
    }
}

