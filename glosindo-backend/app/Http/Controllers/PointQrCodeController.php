<?php

namespace App\Http\Controllers;

use App\Models\GameEvent;
use App\Models\PointQrCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;

class PointQrCodeController extends Controller
{
    /**
     * Get all point QR codes for a game event.
     */
    public function index($id)
    {
        $event = GameEvent::find($id);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Game event tidak ditemukan',
            ], 404);
        }

        $qrCodes = $event->pointQrCodes()
                        ->orderBy('point_value', 'asc')
                        ->orderBy('created_at', 'desc')
                        ->get();

        // Load scan counts
        $qrCodes->transform(function ($qr) {
            $qr->scan_count = $qr->transactions()->count();
            return $qr;
        });

        return response()->json([
            'success' => true,
            'data'    => $qrCodes,
        ]);
    }

    /**
     * Create a new point QR code.
     */
    public function store(Request $request, $id)
    {
        $event = GameEvent::find($id);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Game event tidak ditemukan',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'point_value' => 'required|integer|in:10,20,30,40,50,60,70,80,90,100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // Additional validation
        if (!PointQrCode::isValidPointValue($request->point_value)) {
            return response()->json([
                'success' => false,
                'message' => 'Nilai poin tidak valid. Harus 10, 20, 30, ..., 100',
            ], 422);
        }

        try {
            $qr = PointQrCode::create([
                'game_event_id' => $event->id,
                'point_value'   => $request->point_value,
                'status'        => 'active',
            ]);

            $qr->audit('created', null, $qr->toArray(), 'Point QR code created');

            return response()->json([
                'success' => true,
                'message' => 'QR poin berhasil dibuat',
                'data'    => $qr,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat QR poin: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate QR code image for a point QR.
     */
    public function generateQr($id, $qrId)
    {
        $qr = PointQrCode::where('id', $qrId)
                        ->where('game_event_id', $id)
                        ->with('gameEvent')
                        ->first();

        if (!$qr) {
            return response()->json([
                'success' => false,
                'message' => 'QR poin tidak ditemukan',
            ], 404);
        }

        try {
            // Token adalah data yang akan di-scan
            $data = $qr->token;

            // Generate QR Code
            $qrCode = new QrCode($data);
            $qrCode->setSize(300);
            $qrCode->setMargin(10);

            $writer = new PngWriter();
            $result = $writer->write($qrCode);

            // Convert to base64
            $qrBase64 = base64_encode($result->getString());

            return response()->json([
                'success' => true,
                'data'    => [
                    'qr_code'     => 'data:image/png;base64,' . $qrBase64,
                    'token'       => $qr->token,
                    'point_value' => $qr->point_value,
                    'event_name'  => $qr->gameEvent->name,
                    'status'      => $qr->status,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal generate QR code: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update QR code status.
     */
    public function updateStatus(Request $request, $id, $qrId)
    {
        $qr = PointQrCode::where('id', $qrId)
                        ->where('game_event_id', $id)
                        ->first();

        if (!$qr) {
            return response()->json([
                'success' => false,
                'message' => 'QR poin tidak ditemukan',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            $oldValues = $qr->toArray();
            $qr->update(['status' => $request->status]);
            $qr->audit('updated', $oldValues, $qr->toArray(), 'Point QR code status changed');

            return response()->json([
                'success' => true,
                'message' => 'Status QR berhasil diupdate',
                'data'    => $qr,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal update status: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a point QR code.
     */
    public function destroy($id, $qrId)
    {
        $qr = PointQrCode::where('id', $qrId)
                        ->where('game_event_id', $id)
                        ->first();

        if (!$qr) {
            return response()->json([
                'success' => false,
                'message' => 'QR poin tidak ditemukan',
            ], 404);
        }

        // Check if has transactions
        $hasTransactions = $qr->transactions()->exists();

        if ($hasTransactions) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak bisa hapus QR yang sudah digunakan. Nonaktifkan saja.',
            ], 400);
        }

        try {
            $qr->audit('deleted', $qr->toArray(), null, 'Point QR code deleted');
            $qr->delete();

            return response()->json([
                'success' => true,
                'message' => 'QR poin berhasil dihapus',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal hapus QR: ' . $e->getMessage(),
            ], 500);
        }
    }
}
