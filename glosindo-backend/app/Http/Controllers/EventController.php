<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Visit;
use App\Models\Visitor;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use Barryvdh\DomPDF\Facade\Pdf;

class EventController extends Controller
{
    /**
     * Display a listing of events.
     */
    public function index(Request $request)
    {
        $query = Event::with(['creator:id,name']);

        if ($request->has('status') && !empty($request->status)) {
            $query->where('status', $request->status);
        }

        if ($request->has('start_date') && !empty($request->start_date)) {
            $query->where(function($q) use ($request) {
                $q->whereDate('start_date', '>=', $request->start_date)
                  ->orWhereDate('event_date', '>=', $request->start_date);
            });
        }

        if ($request->has('end_date') && !empty($request->end_date)) {
            $query->where(function($q) use ($request) {
                $q->whereDate('end_date', '<=', $request->end_date)
                  ->orWhereDate('event_date', '<=', $request->end_date);
            });
        }

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        $events = $query->withCount(['visits', 'participants'])
                        ->orderBy(DB::raw('COALESCE(start_date, event_date)'), 'desc')
                        ->paginate(15);

        return response()->json([
            'success' => true,
            'data'    => $events,
        ]);
    }

    /**
     * Get events available for check-in.
     */
    public function activeEvents()
    {
        $events = Event::activeForCheckIn()
                       ->orderBy('start_time', 'asc')
                       ->get(['id', 'code', 'name', 'start_date', 'end_date', 'start_time', 'end_time', 'location', 'status']);

        return response()->json([
            'success' => true,
            'data'    => $events,
        ]);
    }

    /**
     * Store a newly created event.
     */
    public function store(Request $request)
    {
        $startDate = $request->start_date ?: $request->event_date;
        $endDate   = $request->end_date ?: $startDate;

        $request->merge([
            'start_date' => $startDate,
            'end_date'   => $endDate,
            'event_date' => $startDate,
        ]);

        $this->validate($request, [
            'name'                  => 'required|string|max:255',
            'code'                  => 'nullable|string|max:64|unique:events,code',
            'description'           => 'nullable|string',
            'start_date'            => 'required|date',
            'end_date'              => 'required|date|after_or_equal:start_date',
            'start_time'            => 'required|date_format:H:i',
            'end_time'              => 'required|date_format:H:i',
            'registration_start_at' => 'nullable|date',
            'registration_end_at'   => 'nullable|date|after:registration_start_at',
            'location'              => 'nullable|string|max:255',
            'status'                => 'nullable|in:draft,scheduled,ongoing,active,finished,cancelled',
        ], [
            'end_date.after_or_equal'        => 'Tanggal selesai event tidak boleh sebelum tanggal mulai.',
            'registration_end_at.after'      => 'Batas akhir registrasi harus setelah waktu mulai registrasi.',
            'code.unique'                    => 'Kode / slug event sudah digunakan. Pilih kode lain.',
        ]);

        // Validation for single-day event: start_time < end_time
        if ($startDate === $endDate && $request->start_time >= $request->end_time) {
            return response()->json([
                'success' => false,
                'message' => 'Untuk event pada hari yang sama, waktu selesai harus setelah waktu mulai.',
                'errors'  => ['end_time' => ['Waktu selesai harus setelah waktu mulai.']]
            ], 422);
        }

        // Validation: registration period should not exceed event end reasonably
        if ($request->registration_end_at) {
            $eventEndDateTime = Carbon::parse($endDate . ' ' . $request->end_time);
            $regEndDateTime   = Carbon::parse($request->registration_end_at);
            if ($regEndDateTime->gt($eventEndDateTime->copy()->addDays(1))) {
                return response()->json([
                    'success' => false,
                    'message' => 'Batas akhir pendaftaran tidak boleh melewati waktu selesai event.',
                    'errors'  => ['registration_end_at' => ['Batas akhir pendaftaran tidak boleh melewati akhir event.']]
                ], 422);
            }
        }

        $code = $request->code ? Str::slug($request->code) : Event::generateUniqueCode($request->name);

        $event = Event::create([
            'name'                  => $request->name,
            'code'                  => $code,
            'description'           => $request->description,
            'event_date'            => $startDate,
            'start_date'            => $startDate,
            'end_date'              => $endDate,
            'start_time'            => $request->start_time,
            'end_time'              => $request->end_time,
            'registration_start_at' => $request->registration_start_at,
            'registration_end_at'   => $request->registration_end_at,
            'location'              => $request->location,
            'status'                => $request->status ?? 'scheduled',
            'created_by'            => auth()->id(),
        ]);

        $event->audit('created', null, $event->toArray(), 'Event created');

        return response()->json([
            'success' => true,
            'message' => 'Event berhasil dibuat',
            'data'    => $event->load('creator:id,name'),
        ], 201);
    }

    /**
     * Display the specified event with statistics and participants.
     */
    public function show($id)
    {
        $event = is_numeric($id) 
            ? Event::with(['creator:id,name'])->find($id)
            : Event::with(['creator:id,name'])->where('code', $id)->first();

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Event tidak ditemukan',
            ], 404);
        }

        // Statistik peserta dari event_participants & visits
        $totalRegistered = EventParticipant::where('event_id', $event->id)->count();
        $checkedInCount  = EventParticipant::where('event_id', $event->id)->where('status', 'checked_in')->count();
        $checkedOutCount = EventParticipant::where('event_id', $event->id)->where('status', 'checked_out')->count();
        $registeredOnly  = EventParticipant::where('event_id', $event->id)->where('status', 'registered')->count();

        // Visits linked directly
        $visitsQuery   = Visit::where('event_id', $event->id);
        $totalVisits   = (clone $visitsQuery)->count();
        $activeVisits  = (clone $visitsQuery)->where('status', 'IN')->count();
        $outVisits     = (clone $visitsQuery)->where('status', 'OUT')->count();

        $effectiveCheckedIn  = max($checkedInCount, $activeVisits);
        $effectiveCheckedOut = max($checkedOutCount, $outVisits);
        $totalParticipants   = max($totalRegistered, $totalVisits);

        // Rata-rata durasi
        $avgDuration = Visit::where('event_id', $event->id)
            ->where('status', 'OUT')
            ->whereNotNull('check_out')
            ->select(DB::raw('AVG(TIMESTAMPDIFF(MINUTE, check_in, check_out)) as avg_minutes'))
            ->value('avg_minutes');

        // Jumlah perusahaan unik
        $companiesCount = EventParticipant::where('event_id', $event->id)
            ->whereNotNull('company')
            ->where('company', '!=', '')
            ->distinct('company')
            ->count('company');

        if ($companiesCount === 0) {
            $companiesCount = Visit::where('event_id', $event->id)
                ->join('visitors', 'visits.visitor_id', '=', 'visitors.id')
                ->whereNotNull('visitors.company')
                ->where('visitors.company', '!=', '')
                ->distinct('visitors.company')
                ->count('visitors.company');
        }

        // Daftar peserta lengkap
        $participants = EventParticipant::where('event_id', $event->id)
            ->with(['visitor:id,name,company,phone,email,position'])
            ->orderBy('registered_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => [
                'event'        => $event,
                'statistics'   => [
                    'total_participants' => $totalParticipants,
                    'total_visitors'     => $totalParticipants,
                    'registered_only'    => $registeredOnly,
                    'checked_in'         => $effectiveCheckedIn,
                    'checked_out'        => $effectiveCheckedOut,
                    'still_inside'       => $effectiveCheckedIn,
                    'avg_duration'       => $avgDuration ? round($avgDuration) : null,
                    'companies_count'    => $companiesCount,
                ],
                'participants' => $participants,
            ],
        ]);
    }

    /**
     * Update the specified event.
     */
    public function update(Request $request, $id)
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Event tidak ditemukan',
            ], 404);
        }

        $this->validate($request, [
            'name'                  => 'sometimes|required|string|max:255',
            'code'                  => 'sometimes|nullable|string|max:64|unique:events,code,' . $id,
            'description'           => 'nullable|string',
            'start_date'            => 'sometimes|required|date',
            'end_date'              => 'sometimes|required|date|after_or_equal:start_date',
            'start_time'            => 'sometimes|required|date_format:H:i',
            'end_time'              => 'sometimes|required|date_format:H:i',
            'registration_start_at' => 'nullable|date',
            'registration_end_at'   => 'nullable|date',
            'location'              => 'nullable|string|max:255',
            'status'                => 'sometimes|required|in:draft,scheduled,ongoing,active,finished,cancelled',
        ]);

        $startDate = $request->start_date ?? $event->start_date ?? $event->event_date;
        $endDate   = $request->end_date ?? $event->end_date ?? $startDate;

        if ($startDate === $endDate) {
            $startTime = $request->start_time ?? $event->start_time;
            $endTime   = $request->end_time ?? $event->end_time;
            if ($startTime >= $endTime) {
                return response()->json([
                    'success' => false,
                    'message' => 'Untuk event pada hari yang sama, waktu selesai harus setelah waktu mulai.',
                    'errors'  => ['end_time' => ['Waktu selesai harus setelah waktu mulai.']]
                ], 422);
            }
        }

        $oldValues = $event->toArray();

        $updateData = $request->only([
            'name', 'description', 'start_date', 'end_date', 'start_time', 'end_time',
            'registration_start_at', 'registration_end_at', 'location', 'status'
        ]);

        if ($request->has('code') && !empty($request->code)) {
            $updateData['code'] = Str::slug($request->code);
        }

        $updateData['event_date'] = $startDate;

        $event->update($updateData);

        $event->audit('updated', $oldValues, $event->fresh()->toArray(), 'Event updated');

        return response()->json([
            'success' => true,
            'message' => 'Event berhasil diperbarui',
            'data'    => $event->load('creator:id,name'),
        ]);
    }

    /**
     * Remove the specified event (soft delete).
     */
    public function destroy($id)
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Event tidak ditemukan',
            ], 404);
        }

        // Jangan hapus jika ada visit aktif
        $activeVisits = Visit::where('event_id', $id)->where('status', 'IN')->count();
        if ($activeVisits > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Event tidak dapat dihapus karena masih ada tamu yang check-in di lokasi.',
            ], 422);
        }

        $event->audit('deleted', $event->toArray(), null, 'Event deleted');
        $event->delete();

        return response()->json([
            'success' => true,
            'message' => 'Event berhasil dihapus',
        ]);
    }

    /**
     * Get participants list for event with filters.
     */
    public function participants($id, Request $request)
    {
        $event = Event::find($id);
        if (!$event) {
            return response()->json(['success' => false, 'message' => 'Event tidak ditemukan'], 404);
        }

        $query = EventParticipant::where('event_id', $id)->with(['visitor']);

        if ($request->has('status') && !empty($request->status)) {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%")
                  ->orWhere('position', 'like', "%{$search}%");
            });
        }

        $participants = $query->orderBy('registered_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => $participants,
        ]);
    }

    /**
     * Manual store participant from admin/receptionist.
     */
    public function storeParticipant(Request $request, $id)
    {
        $event = Event::find($id);
        if (!$event) {
            return response()->json(['success' => false, 'message' => 'Event tidak ditemukan'], 404);
        }

        $this->validate($request, [
            'name'     => 'required|string|max:255',
            'phone'    => 'required|string|max:30',
            'email'    => 'nullable|email|max:255',
            'company'  => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
        ]);

        // Duplicate check
        $exists = EventParticipant::where('event_id', $id)
            ->where(function ($q) use ($request) {
                $q->where('phone', $request->phone);
                if ($request->email) {
                    $q->orWhere('email', $request->email);
                }
            })->first();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Peserta dengan nomor telepon atau email tersebut sudah terdaftar pada event ini.',
            ], 422);
        }

        // Find or create visitor
        $visitor = Visitor::where('phone', $request->phone)->first();
        if ($visitor) {
            $visitor->update([
                'name'     => $request->name,
                'email'    => $request->email ?: $visitor->email,
                'company'  => $request->company ?: $visitor->company,
                'position' => $request->position ?: $visitor->position,
            ]);
        } else {
            $visitor = Visitor::create([
                'name'     => $request->name,
                'phone'    => $request->phone,
                'email'    => $request->email,
                'company'  => $request->company,
                'position' => $request->position,
            ]);
        }

        $participant = EventParticipant::create([
            'event_id'      => $event->id,
            'visitor_id'    => $visitor->id,
            'name'          => $request->name,
            'phone'         => $request->phone,
            'email'         => $request->email,
            'company'       => $request->company,
            'position'      => $request->position,
            'status'        => 'registered',
            'registered_at' => Carbon::now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Peserta berhasil ditambahkan ke event',
            'data'    => $participant->load('visitor'),
        ], 201);
    }

    /**
     * Check-in participant to event.
     */
    public function checkInParticipant($id, $participantId)
    {
        $event = Event::find($id);
        if (!$event) {
            return response()->json(['success' => false, 'message' => 'Event tidak ditemukan'], 404);
        }

        $participant = EventParticipant::where('event_id', $id)->find($participantId);
        if (!$participant) {
            return response()->json(['success' => false, 'message' => 'Peserta tidak ditemukan'], 404);
        }

        // Ensure visitor exists
        if (!$participant->visitor_id) {
            $visitor = Visitor::where('phone', $participant->phone)->first();
            if (!$visitor) {
                $visitor = Visitor::create([
                    'name'     => $participant->name,
                    'phone'    => $participant->phone,
                    'email'    => $participant->email,
                    'company'  => $participant->company,
                    'position' => $participant->position,
                ]);
            }
            $participant->visitor_id = $visitor->id;
        }

        // Check if there is already an active visit for this visitor
        $activeVisit = Visit::where('visitor_id', $participant->visitor_id)
            ->where('status', 'IN')
            ->first();

        if (!$activeVisit) {
            $visit = Visit::create([
                'visitor_id'      => $participant->visitor_id,
                'receptionist_id' => auth()->id(),
                'event_id'        => $event->id,
                'purpose'         => 'Event: ' . $event->name,
                'meet_to'         => 'Event: ' . $event->name,
                'check_in'        => Carbon::now(),
                'status'          => 'IN',
            ]);
            $visit->audit('checked_in', null, $visit->toArray(), 'Event check-in: ' . $event->name);
        } else {
            $activeVisit->update([
                'event_id' => $event->id,
                'meet_to'  => 'Event: ' . $event->name,
                'purpose'  => 'Event: ' . $event->name,
            ]);
        }

        $participant->update([
            'status'        => 'checked_in',
            'checked_in_at' => Carbon::now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Peserta berhasil check-in ke event ' . $event->name,
            'data'    => $participant->fresh(['visitor']),
        ]);
    }

    /**
     * Check-out participant from event.
     */
    public function checkOutParticipant($id, $participantId)
    {
        $event = Event::find($id);
        if (!$event) {
            return response()->json(['success' => false, 'message' => 'Event tidak ditemukan'], 404);
        }

        $participant = EventParticipant::where('event_id', $id)->find($participantId);
        if (!$participant) {
            return response()->json(['success' => false, 'message' => 'Peserta tidak ditemukan'], 404);
        }

        // Find and check out active visit
        if ($participant->visitor_id) {
            $activeVisit = Visit::where('visitor_id', $participant->visitor_id)
                ->where('status', 'IN')
                ->first();

            if ($activeVisit) {
                $oldValues = $activeVisit->toArray();
                $activeVisit->update([
                    'check_out' => Carbon::now(),
                    'status'    => 'OUT',
                ]);
                $activeVisit->audit('checked_out', $oldValues, $activeVisit->fresh()->toArray(), 'Event check-out: ' . $event->name);
            }
        }

        $participant->update([
            'status'         => 'checked_out',
            'checked_out_at' => Carbon::now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Peserta berhasil check-out dari event',
            'data'    => $participant->fresh(['visitor']),
        ]);
    }

    /**
     * Delete participant from event.
     */
    public function destroyParticipant($id, $participantId)
    {
        $participant = EventParticipant::where('event_id', $id)->find($participantId);
        if (!$participant) {
            return response()->json(['success' => false, 'message' => 'Peserta tidak ditemukan'], 404);
        }

        $participant->delete();

        return response()->json([
            'success' => true,
            'message' => 'Peserta berhasil dihapus dari event',
        ]);
    }

    /**
     * Public show event info for registration link /event/{code}/register.
     */
    public function publicShow($code)
    {
        $event = Event::where('code', $code)
                      ->orWhere('id', is_numeric($code) ? $code : 0)
                      ->first();

        if (!$event) {
            return response()->json([
                'success' => false,
                'status_code' => 'NOT_FOUND',
                'message' => 'Event tidak ditemukan. Pastikan link pendaftaran sudah benar.',
            ], 404);
        }

        $now = Carbon::now();

        // 1. Status Cancelled
        if ($event->status === 'cancelled') {
            return response()->json([
                'success' => false,
                'status_code' => 'EVENT_CANCELLED',
                'message' => 'Event dibatalkan oleh pihak penyelenggara.',
                'data'    => [
                    'name'        => $event->name,
                    'status'      => $event->status,
                ]
            ], 422);
        }

        // 2. Registration not yet open
        if ($event->registration_start_at && $now->lt(Carbon::parse($event->registration_start_at))) {
            return response()->json([
                'success' => false,
                'status_code' => 'REGISTRATION_NOT_OPEN',
                'message' => 'Pendaftaran belum dibuka. Pendaftaran akan dibuka pada ' . Carbon::parse($event->registration_start_at)->translatedFormat('d F Y H:i') . ' WIB.',
                'data'    => [
                    'name'                  => $event->name,
                    'registration_start_at' => $event->registration_start_at,
                    'start_date'            => $event->start_date ?: $event->event_date,
                    'status'                => $event->status,
                ]
            ], 422);
        }

        // 3. Registration closed or event finished
        $isClosed = false;
        if ($event->status === 'finished') {
            $isClosed = true;
        } elseif ($event->registration_end_at && $now->gt(Carbon::parse($event->registration_end_at))) {
            $isClosed = true;
        } elseif (empty($event->registration_end_at)) {
            // If no registration_end_at specified, close when event end_date and end_time passes
            $eventEndDate = $event->end_date ?: ($event->start_date ?: $event->event_date);
            $eventEndTime = $event->end_time ?: '23:59:59';
            if ($now->gt(Carbon::parse($eventEndDate . ' ' . $eventEndTime))) {
                $isClosed = true;
            }
        }

        if ($isClosed) {
            return response()->json([
                'success' => false,
                'status_code' => 'REGISTRATION_CLOSED',
                'message' => 'Pendaftaran sudah ditutup.',
                'data'    => [
                    'name'                => $event->name,
                    'registration_end_at' => $event->registration_end_at,
                    'status'              => $event->status,
                ]
            ], 422);
        }

        // Return clean public event detail (no sensitive info)
        return response()->json([
            'success' => true,
            'data'    => [
                'id'                    => $event->id,
                'name'                  => $event->name,
                'code'                  => $event->code,
                'description'           => $event->description,
                'start_date'            => $event->start_date ?: $event->event_date,
                'end_date'              => $event->end_date ?: ($event->start_date ?: $event->event_date),
                'start_time'            => $event->start_time,
                'end_time'              => $event->end_time,
                'location'              => $event->location,
                'registration_start_at' => $event->registration_start_at,
                'registration_end_at'   => $event->registration_end_at,
                'status'                => $event->status,
            ]
        ]);
    }

    /**
     * Public registration for event.
     */
    public function publicRegister(Request $request, $code)
    {
        $event = Event::where('code', $code)
                      ->orWhere('id', is_numeric($code) ? $code : 0)
                      ->first();

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Event tidak ditemukan.',
            ], 404);
        }

        $now = Carbon::now();

        // Validations
        if ($event->status === 'cancelled') {
            return response()->json([
                'success' => false,
                'message' => 'Event dibatalkan. Pendaftaran tidak dapat diproses.',
            ], 422);
        }

        if ($event->registration_start_at && $now->lt(Carbon::parse($event->registration_start_at))) {
            return response()->json([
                'success' => false,
                'message' => 'Pendaftaran belum dibuka.',
            ], 422);
        }

        $isClosed = false;
        if ($event->status === 'finished') {
            $isClosed = true;
        } elseif ($event->registration_end_at && $now->gt(Carbon::parse($event->registration_end_at))) {
            $isClosed = true;
        } elseif (empty($event->registration_end_at)) {
            $eventEndDate = $event->end_date ?: ($event->start_date ?: $event->event_date);
            $eventEndTime = $event->end_time ?: '23:59:59';
            if ($now->gt(Carbon::parse($eventEndDate . ' ' . $eventEndTime))) {
                $isClosed = true;
            }
        }

        if ($isClosed) {
            return response()->json([
                'success' => false,
                'message' => 'Pendaftaran sudah ditutup.',
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'name'     => 'required|string|max:255',
            'phone'    => 'required|string|max:30',
            'email'    => 'nullable|email|max:255',
            'company'  => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
        ], [
            'name.required'  => 'Nama lengkap wajib diisi.',
            'phone.required' => 'Nomor HP / WhatsApp wajib diisi.',
            'email.email'    => 'Format email tidak valid.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Data pendaftaran tidak valid.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // Duplicate participant check on this same event
        $duplicate = EventParticipant::where('event_id', $event->id)
            ->where(function ($q) use ($request) {
                $q->where('phone', $request->phone);
                if ($request->email) {
                    $q->orWhere('email', $request->email);
                }
            })->first();

        if ($duplicate) {
            return response()->json([
                'success' => false,
                'message' => 'Sudah terdaftar! Nomor HP atau email Anda telah terdaftar sebagai peserta pada event ini.',
                'duplicate' => true,
            ], 422);
        }

        // Find or create Visitor
        $visitor = Visitor::where('phone', $request->phone)->first();
        if ($visitor) {
            $visitor->update([
                'name'     => $request->name,
                'email'    => $request->email ?: $visitor->email,
                'company'  => $request->company ?: $visitor->company,
                'position' => $request->position ?: $visitor->position,
            ]);
        } else {
            $visitor = Visitor::create([
                'name'     => $request->name,
                'phone'    => $request->phone,
                'email'    => $request->email,
                'company'  => $request->company,
                'position' => $request->position,
            ]);
        }

        // Create participant
        $participant = EventParticipant::create([
            'event_id'      => $event->id,
            'visitor_id'    => $visitor->id,
            'name'          => $request->name,
            'phone'         => $request->phone,
            'email'         => $request->email,
            'company'       => $request->company,
            'position'      => $request->position,
            'status'        => 'registered',
            'registered_at' => Carbon::now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran event berhasil! Terima kasih telah mendaftar.',
            'data'    => [
                'registration_id' => $participant->id,
                'participant'     => [
                    'name'     => $participant->name,
                    'phone'    => $participant->phone,
                    'email'    => $participant->email,
                    'company'  => $participant->company,
                    'position' => $participant->position,
                    'registered_at' => $participant->registered_at,
                ],
                'event'           => [
                    'name'        => $event->name,
                    'start_date'  => $event->start_date ?: $event->event_date,
                    'end_date'    => $event->end_date ?: ($event->start_date ?: $event->event_date),
                    'start_time'  => $event->start_time,
                    'end_time'    => $event->end_time,
                    'location'    => $event->location,
                ],
            ]
        ], 201);
    }

    /**
     * Get event report statistics.
     */
    public function eventReport(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate   = $request->input('end_date');
        $status    = $request->input('status');
        $eventId   = $request->input('event_id');

        $eventQuery = Event::withCount(['visits', 'participants']);

        if ($startDate) {
            $eventQuery->where(function($q) use ($startDate) {
                $q->whereDate('start_date', '>=', $startDate)
                  ->orWhereDate('event_date', '>=', $startDate);
            });
        }
        if ($endDate) {
            $eventQuery->where(function($q) use ($endDate) {
                $q->whereDate('end_date', '<=', $endDate)
                  ->orWhereDate('event_date', '<=', $endDate);
            });
        }
        if ($status) {
            $eventQuery->where('status', $status);
        }
        if ($eventId) {
            $eventQuery->where('id', $eventId);
        }

        $events = $eventQuery->with('creator:id,name')->orderBy('created_at', 'desc')->get();

        $eventStats = $events->map(function ($event) {
            $totalParticipants = max($event->participants_count, $event->visits_count);
            $checkedIn          = EventParticipant::where('event_id', $event->id)->where('status', 'checked_in')->count();
            $checkedOut         = EventParticipant::where('event_id', $event->id)->where('status', 'checked_out')->count();

            if ($checkedIn === 0 && $checkedOut === 0) {
                $visits     = Visit::where('event_id', $event->id);
                $checkedIn  = (clone $visits)->where('status', 'IN')->count();
                $checkedOut = (clone $visits)->where('status', 'OUT')->count();
            }

            $avgDuration = Visit::where('event_id', $event->id)
                ->where('status', 'OUT')
                ->whereNotNull('check_out')
                ->select(DB::raw('AVG(TIMESTAMPDIFF(MINUTE, check_in, check_out)) as avg_minutes'))
                ->value('avg_minutes');

            $companies = EventParticipant::where('event_id', $event->id)
                ->whereNotNull('company')
                ->where('company', '!=', '')
                ->distinct('company')
                ->count('company');

            return [
                'id'              => $event->id,
                'code'            => $event->code,
                'name'            => $event->name,
                'start_date'      => $event->start_date ?: $event->event_date,
                'end_date'        => $event->end_date ?: ($event->start_date ?: $event->event_date),
                'event_date'      => $event->start_date ?: $event->event_date,
                'start_time'      => $event->start_time,
                'end_time'        => $event->end_time,
                'location'        => $event->location,
                'status'          => $event->status,
                'creator'         => $event->creator,
                'total_visitors'  => $totalParticipants,
                'total_participants' => $totalParticipants,
                'checked_in'      => $checkedIn,
                'checked_out'     => $checkedOut,
                'avg_duration'    => $avgDuration ? round($avgDuration) : null,
                'companies_count' => $companies,
            ];
        });

        $summary = [
            'total_events'      => $events->count(),
            'total_visitors'    => $eventStats->sum('total_visitors'),
            'total_checked_in'  => $eventStats->sum('checked_in'),
            'total_checked_out' => $eventStats->sum('checked_out'),
            'still_inside'      => $eventStats->sum('checked_in'),
        ];

        return response()->json([
            'success' => true,
            'data'    => [
                'summary' => $summary,
                'events'  => $eventStats,
            ],
        ]);
    }

    /**
     * Export event report to Excel.
     */
    public function exportExcel(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth());
        $endDate   = $request->input('end_date', Carbon::now()->endOfMonth());
        $startDate = Carbon::parse($startDate);
        $endDate   = Carbon::parse($endDate);

        $events = Event::withCount(['visits', 'participants'])
            ->where(function($q) use ($startDate, $endDate) {
                $q->whereDate('start_date', '>=', $startDate)
                  ->whereDate('end_date', '<=', $endDate);
            })
            ->orWhere(function($q) use ($startDate, $endDate) {
                $q->whereDate('event_date', '>=', $startDate)
                  ->whereDate('event_date', '<=', $endDate);
            })
            ->with('creator:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $headerStyle = [
            'font'      => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 12],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E3A8A']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
        ];

        $sheet->setCellValue('A1', 'LAPORAN EVENT & TAMU PERUSAHAAN');
        $sheet->mergeCells('A1:K1');
        $sheet->getStyle('A1')->applyFromArray([
            'font'      => ['bold' => true, 'size' => 16],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        $sheet->setCellValue('A2', 'Periode: ' . $startDate->format('d M Y') . ' - ' . $endDate->format('d M Y'));
        $sheet->mergeCells('A2:K2');
        $sheet->getStyle('A2')->applyFromArray([
            'font'      => ['size' => 11],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        $headers = ['No', 'Nama Event', 'Kode', 'Tanggal Event', 'Waktu Mulai', 'Waktu Selesai', 'Lokasi', 'Status', 'Total Peserta', 'Peserta Check-In', 'Dibuat Oleh'];
        $sheet->fromArray($headers, null, 'A4');
        $sheet->getStyle('A4:K4')->applyFromArray($headerStyle);

        $row = 5;
        foreach ($events as $index => $event) {
            $totalPart = max($event->participants_count, $event->visits_count);
            $checkedIn = EventParticipant::where('event_id', $event->id)->where('status', 'checked_in')->count();
            if ($checkedIn === 0) {
                $checkedIn = $event->visits()->where('status', 'IN')->count();
            }

            $dateDisplay = Carbon::parse($event->start_date ?: $event->event_date)->format('d/m/Y');
            if ($event->end_date && $event->end_date != $event->start_date) {
                $dateDisplay .= ' - ' . Carbon::parse($event->end_date)->format('d/m/Y');
            }
            
            $sheet->setCellValue('A' . $row, $index + 1);
            $sheet->setCellValue('B' . $row, $event->name);
            $sheet->setCellValue('C' . $row, $event->code ?? '-');
            $sheet->setCellValue('D' . $row, $dateDisplay);
            $sheet->setCellValue('E' . $row, substr($event->start_time, 0, 5));
            $sheet->setCellValue('F' . $row, substr($event->end_time, 0, 5));
            $sheet->setCellValue('G' . $row, $event->location ?? '-');
            $sheet->setCellValue('H' . $row, ucfirst($event->status));
            $sheet->setCellValue('I' . $row, $totalPart);
            $sheet->setCellValue('J' . $row, $checkedIn);
            $sheet->setCellValue('K' . $row, $event->creator->name ?? '-');

            if ($index % 2 === 0) {
                $sheet->getStyle('A' . $row . ':K' . $row)->applyFromArray([
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F3F4F6']],
                ]);
            }
            $row++;
        }

        $sheet->getStyle('A4:K' . ($row - 1))->applyFromArray([
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
        ]);

        foreach (range('A', 'K') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $row += 2;
        $sheet->setCellValue('A' . $row, 'Total Event:');
        $sheet->setCellValue('B' . $row, $events->count());
        $sheet->getStyle('A' . $row . ':B' . $row)->applyFromArray(['font' => ['bold' => true]]);

        $fileName = 'Laporan_Event_' . $startDate->format('Ymd') . '_' . $endDate->format('Ymd') . '.xlsx';
        $tempFile = tempnam(sys_get_temp_dir(), $fileName);

        $writer = new Xlsx($spreadsheet);
        $writer->save($tempFile);

        return response()->download($tempFile, $fileName)->deleteFileAfterSend(true);
    }

    /**
     * Export event report to PDF.
     */
    public function exportPdf(Request $request)
    {
        $user      = auth()->user();
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth());
        $endDate   = $request->input('end_date', Carbon::now()->endOfMonth());
        $startDate = Carbon::parse($startDate);
        $endDate   = Carbon::parse($endDate);

        $events = Event::withCount(['visits', 'participants'])
            ->where(function($q) use ($startDate, $endDate) {
                $q->whereDate('start_date', '>=', $startDate)
                  ->whereDate('end_date', '<=', $endDate);
            })
            ->orWhere(function($q) use ($startDate, $endDate) {
                $q->whereDate('event_date', '>=', $startDate)
                  ->whereDate('event_date', '<=', $endDate);
            })
            ->with('creator:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        $data = [
            'events'       => $events,
            'start_date'   => $startDate->format('d M Y'),
            'end_date'     => $endDate->format('d M Y'),
            'total_events' => $events->count(),
            'generated_by' => $user ? $user->name : 'System',
            'generated_at' => Carbon::now()->format('d M Y H:i'),
        ];

        $pdf = Pdf::loadView('reports.events', $data)->setPaper('a4', 'landscape');

        $fileName = 'Laporan_Event_' . $startDate->format('Ymd') . '_' . $endDate->format('Ymd') . '.pdf';

        return $pdf->download($fileName);
    }
}