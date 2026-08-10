<?php

namespace App\Http\Controllers;

use App\Models\Visitor;
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
     * Store a newly created visitor.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'company' => 'nullable|string|max:255',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048', // 2MB max
            'face_vector' => 'nullable|array',
            'face_vector.*' => 'nullable|numeric',
        ]);

        // Check duplicate face if face_vector provided
        if ($request->has('face_vector') && is_array($request->face_vector)) {
            if (count($request->face_vector) !== 128) {
                return response()->json([
                    'success' => false,
                    'message' => 'Face vector must contain exactly 128 dimensions',
                ], 422);
            }

            $embeddings = \App\Models\FaceEmbedding::with('visitor:id,name,company,photo')->get();
            $threshold = 0.6;

            foreach ($embeddings as $embedding) {
                $distance = $this->calculateEuclideanDistance($request->face_vector, $embedding->face_vector);
                
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
        if ($request->has('face_vector') && is_array($request->face_vector)) {
            \App\Models\FaceEmbedding::create([
                'visitor_id' => $visitor->id,
                'face_vector' => $request->face_vector,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Visitor created successfully',
            'data' => $visitor->load('faceEmbedding'),
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

        $this->validate($request, [
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'company' => 'nullable|string|max:255',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
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

        $visitor->delete();

        return response()->json([
            'success' => true,
            'message' => 'Visitor deleted successfully',
        ]);
    }
}
