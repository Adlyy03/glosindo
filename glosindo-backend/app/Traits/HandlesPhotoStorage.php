<?php

namespace App\Traits;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

trait HandlesPhotoStorage
{
    /**
     * Store photo file (UploadedFile) or base64 data URI string into storage/app/public/{folder}.
     *
     * @param mixed $photoInput UploadedFile, Base64 data URI string, or existing relative path
     * @param Request|null $request
     * @param string $folder Target directory under storage/app/public (e.g. 'visits' or 'visitors')
     * @return string|null Relative storage path (e.g. 'visits/1732000000_abc12345.jpg')
     */
    public function storePhoto($photoInput, ?Request $request = null, string $folder = 'visits'): ?string
    {
        try {
            $storageDir = storage_path('app/public/' . $folder);
            if (!is_dir($storageDir)) {
                @mkdir($storageDir, 0755, true);
            }

            // Case 1: Uploaded file via multipart form-data
            if ($request && $request->hasFile('photo')) {
                $photo = $request->file('photo');
                $ext = strtolower($photo->getClientOriginalExtension() ?: 'jpg');
                $filename = time() . '_' . Str::random(8) . '.' . $ext;
                $photo->move($storageDir, $filename);
                return $folder . '/' . $filename;
            }

            // Case 2: Base64 data URI string (from webcam snapshot)
            if (is_string($photoInput) && preg_match('/^data:image\/(\w+);base64,/', $photoInput, $matches)) {
                $extension = strtolower($matches[1]);
                if (in_array($extension, ['jpeg', 'jpg', 'png', 'webp'])) {
                    $imageData = substr($photoInput, strpos($photoInput, ',') + 1);
                    $decodedImage = base64_decode($imageData);

                    if ($decodedImage !== false) {
                        $filename = time() . '_' . Str::random(8) . '.' . ($extension === 'jpeg' ? 'jpg' : $extension);
                        $fullPath = $storageDir . '/' . $filename;
                        @file_put_contents($fullPath, $decodedImage);
                        return $folder . '/' . $filename;
                    }
                }
            }

            // Case 3: Already an existing valid path relative to storage
            if (is_string($photoInput) && (str_starts_with($photoInput, 'visits/') || str_starts_with($photoInput, 'visitors/'))) {
                return $photoInput;
            }
        } catch (\Throwable $e) {
            Log::error("HandlesPhotoStorage storePhoto error in [{$folder}]: " . $e->getMessage());
        }

        return null;
    }
}
