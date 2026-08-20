<?php

namespace App\Http\Controllers;

use App\Models\Visitor;
use App\Models\Visit;
use App\Models\FaceEmbedding;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PublicRegistrationController extends Controller
{
    /**
     * Check if public registration is enabled.
     */
    public function checkStatus()
    {
        $enabled = SystemSetting::get('public_registration_enabled', '1') === '1';
        
        return response()->json([
            'success' => true,
            'enabled' => $enabled,
            'message' => $enabled 
                ? 'Pendaftaran tamu mandiri dibuka' 
                : 'Pendaftaran tamu mandiri sedang dinonaktifkan'
        ]);
    }

    /**
     * Toggle public registration enabled/disabled status.
     */
    public function toggleStatus(Request $request)
    {
        $enabled = filter_var($request->input('enabled', true), FILTER_VALIDATE_BOOLEAN);
        SystemSetting::set('public_registration_enabled', $enabled ? '1' : '0');

        return response()->json([
            'success' => true,
            'enabled' => $enabled,
            'message' => $enabled 
                ? 'Pendaftaran tamu mandiri berhasil diaktifkan' 
                : 'Pendaftaran tamu mandiri berhasil dinonaktifkan',
        ]);
    }

    /**
     * Parse face_vector from request input safely.
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
     * Store photo file or base64 string into storage.
     */
    private function handlePhotoStorage($photoInput, Request $request)
    {
        try {
            $storageDir = storage_path('app/public/visitors');
            if (!is_dir($storageDir)) {
                @mkdir($storageDir, 0755, true);
            }

            if ($request->hasFile('photo')) {
                $photo = $request->file('photo');
                $filename = time() . '_' . Str::random(8) . '.' . $photo->getClientOriginalExtension();
                $photo->move($storageDir, $filename);
                return 'visitors/' . $filename;
            }

            // Handle Base64 Data URL
            if (is_string($photoInput) && preg_match('/^data:image\/(\w+);base64,/', $photoInput, $matches)) {
                $extension = strtolower($matches[1]);
                if (in_array($extension, ['jpeg', 'jpg', 'png', 'webp'])) {
                    $imageData = substr($photoInput, strpos($photoInput, ',') + 1);
                    $decodedImage = base64_decode($imageData);

                    if ($decodedImage !== false) {
                        $filename = time() . '_' . Str::random(8) . '.' . ($extension === 'jpeg' ? 'jpg' : $extension);
                        $fullPath = $storageDir . '/' . $filename;
                        @file_put_contents($fullPath, $decodedImage);
                        return 'visitors/' . $filename;
                    }
                }
            }
        } catch (\Throwable $e) {
            \Log::error('PublicRegistration handlePhotoStorage error: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Register visitor and visit manually from public self-service page.
     */
    public function register(Request $request)
    {
        // 1. Check if public registration is enabled
        $enabled = SystemSetting::get('public_registration_enabled', '1') === '1';
        if (!$enabled) {
            return response()->json([
                'success' => false,
                'message' => 'Pendaftaran tamu mandiri sedang dinonaktifkan oleh pihak resepsionis / admin.',
            ], 403);
        }

        // 2. Parse face vector
        $faceVector = $this->parseFaceVector($request);
        if ($faceVector !== null) {
            $request->merge(['face_vector' => $faceVector]);
        }

        // 3. Validation
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'company' => 'nullable|string|max:255',
            'purpose' => 'required|string|max:255',
            'meet_to' => 'required|string|max:255',
            'photo' => 'nullable',
            'face_vector' => 'nullable|array',
            'face_vector.*' => 'nullable|numeric',
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'phone.required' => 'Nomor WhatsApp / telepon wajib diisi.',
            'purpose.required' => 'Keperluan atau tujuan kunjungan wajib diisi.',
            'meet_to.required' => 'Nama pihak / staf yang ingin ditemui wajib diisi.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Data pendaftaran tidak valid',
                'errors' => $validator->errors(),
            ], 422);
        }

        // 4. Duplicate Face Check if face vector is provided
        if ($faceVector !== null && is_array($faceVector)) {
            if (count($faceVector) !== 128) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vektor biometrik wajah harus tepat 128 dimensi.',
                ], 422);
            }

            $embeddings = FaceEmbedding::with('visitor:id,name,company,phone')->get();
            $threshold = 0.3;

            foreach ($embeddings as $embedding) {
                if (!$embedding->visitor) {
                    continue;
                }
                $distance = $this->calculateEuclideanDistance($faceVector, $embedding->face_vector);
                
                if ($distance < $threshold) {
                    // Check if visitor has same phone or is exact match
                    if ($embedding->visitor->phone !== $request->phone) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Wajah sudah terdaftar atas nama: ' . $embedding->visitor->name,
                            'duplicate' => true,
                            'existing_visitor' => $embedding->visitor,
                            'distance' => $distance,
                        ], 422);
                    }
                }
            }
        }

        // 5. Store Photo if present
        $photoPath = $this->handlePhotoStorage($request->input('photo'), $request);

        // 6. Find existing visitor by phone or create new
        $visitor = Visitor::where('phone', $request->phone)->first();

        if ($visitor) {
            $updateData = [
                'name' => $request->name,
                'email' => $request->email ?: $visitor->email,
                'company' => $request->company ?: $visitor->company,
            ];
            if ($photoPath) {
                if ($visitor->photo) {
                    $oldPhotoPath = storage_path('app/public/' . $visitor->photo);
                    if (file_exists($oldPhotoPath)) {
                        @unlink($oldPhotoPath);
                    }
                }
                $updateData['photo'] = $photoPath;
            }
            $visitor->update($updateData);
        } else {
            $visitor = Visitor::create([
                'name' => $request->name,
                'phone' => $request->phone,
                'email' => $request->email,
                'company' => $request->company,
                'photo' => $photoPath,
            ]);
        }

        // 7. Store Face Embedding
        if ($faceVector !== null && is_array($faceVector) && count($faceVector) === 128) {
            FaceEmbedding::updateOrCreate(
                ['visitor_id' => $visitor->id],
                ['face_vector' => $faceVector]
            );
        }

        // 8. Create Visit record
        // Check if there is already an active visit (status IN)
        $existingActiveVisit = Visit::where('visitor_id', $visitor->id)
            ->where('status', 'IN')
            ->first();

        if (!$existingActiveVisit) {
            $visit = Visit::create([
                'visitor_id' => $visitor->id,
                'receptionist_id' => null, // Guest self-registration
                'purpose' => $request->purpose,
                'meet_to' => $request->meet_to,
                'check_in' => Carbon::now(),
                'status' => 'IN',
            ]);

            $visit->audit('checked_in', null, $visit->toArray(), "Tamu daftar mandiri dari publik / online");
        } else {
            $visit = $existingActiveVisit;
            $visit->update([
                'purpose' => $request->purpose,
                'meet_to' => $request->meet_to,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran mandiri berhasil! Data kunjungan Anda telah tercatat di sistem.',
            'data' => [
                'visitor' => $visitor->fresh(['faceEmbedding']),
                'visit' => $visit,
            ],
        ], 201);
    }
}
