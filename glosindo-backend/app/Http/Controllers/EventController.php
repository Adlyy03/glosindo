<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Visit;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
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
            $query->whereDate('event_date', '>=', $request->start_date);
        }

        if ($request->has('end_date') && !empty($request->end_date)) {
            $query->whereDate('event_date', '<=', $request->end_date);
        }

        if ($request->has('search') && !empty($request->search)) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $events = $query->withCount('visits')
                        ->orderBy('event_date', 'desc')
                        ->paginate(15);

        return response()->json([
            'success' => true,
            'data'    => $events,
        ]);
    }

    /**
     * Get events available for check-in (today, status scheduled/ongoing).
     */
    public function activeEvents()
    {
        $events = Event::activeForCheckIn()
                       ->orderBy('start_time', 'asc')
                       ->get(['id', 'name', 'start_time', 'end_time', 'location', 'status']);

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
        $this->validate($request, [
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'event_date'  => 'required|date',
            'start_time'  => 'required|date_format:H:i',
            'end_time'    => 'required|date_format:H:i|after:start_time',
            'location'    => 'nullable|string|max:255',
            'status'      => 'nullable|in:draft,scheduled,ongoing,finished,cancelled',
        ]);

        $event = Event::create([
            'name'        => $request->name,
            'description' => $request->description,
            'event_date'  => $request->event_date,
            'start_time'  => $request->start_time,
            'end_time'    => $request->end_time,
            'location'    => $request->location,
            'status'      => $request->status ?? 'scheduled',
            'created_by'  => auth()->id(),
        ]);

        $event->audit('created', null, $event->toArray(), 'Event created');

        return response()->json([
            'success' => true,
            'message' => 'Event berhasil dibuat',
            'data'    => $event->load('creator:id,name'),
        ], 201);
    }

    /**
     * Display the specified event with statistics.
     */
    public function show($id)
    {
        $event = Event::with(['creator:id,name'])->find($id);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Event tidak ditemukan',
            ], 404);
        }

        // Statistik event
        $visitsQuery = Visit::where('event_id', $id)->with(['visitor:id,name,company']);

        $totalVisitors = $visitsQuery->count();
        $checkedIn     = (clone $visitsQuery)->where('status', 'IN')->count();
        $checkedOut    = (clone $visitsQuery)->where('status', 'OUT')->count();

        // Rata-rata durasi (hanya untuk yang sudah checkout)
        $avgDuration = Visit::where('event_id', $id)
            ->where('status', 'OUT')
            ->whereNotNull('check_out')
            ->select(DB::raw('AVG(TIMESTAMPDIFF(MINUTE, check_in, check_out)) as avg_minutes'))
            ->value('avg_minutes');

        // Jumlah perusahaan unik
        $companiesCount = Visit::where('event_id', $id)
            ->join('visitors', 'visits.visitor_id', '=', 'visitors.id')
            ->whereNotNull('visitors.company')
            ->where('visitors.company', '!=', '')
            ->distinct('visitors.company')
            ->count('visitors.company');

        // Daftar peserta
        $participants = Visit::where('event_id', $id)
            ->with(['visitor:id,name,company,phone'])
            ->orderBy('check_in', 'asc')
            ->get()
            ->map(function ($visit) {
                $duration = null;
                if ($visit->check_out) {
                    $duration = Carbon::parse($visit->check_in)->diffInMinutes(Carbon::parse($visit->check_out));
                }
                return [
                    'id'         => $visit->id,
                    'visitor'    => $visit->visitor,
                    'check_in'   => $visit->check_in,
                    'check_out'  => $visit->check_out,
                    'status'     => $visit->status,
                    'duration'   => $duration,
                ];
            });

        return response()->json([
            'success' => true,
            'data'    => [
                'event'        => $event,
                'statistics'   => [
                    'total_visitors'  => $totalVisitors,
                    'checked_in'      => $checkedIn,
                    'checked_out'     => $checkedOut,
                    'still_inside'    => $checkedIn,
                    'avg_duration'    => $avgDuration ? round($avgDuration) : null,
                    'companies_count' => $companiesCount,
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
            'name'        => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'event_date'  => 'sometimes|required|date',
            'start_time'  => 'sometimes|required|date_format:H:i',
            'end_time'    => 'sometimes|required|date_format:H:i',
            'location'    => 'nullable|string|max:255',
            'status'      => 'sometimes|required|in:draft,scheduled,ongoing,finished,cancelled',
        ]);

        $oldValues = $event->toArray();

        $event->update($request->only([
            'name', 'description', 'event_date', 'start_time', 'end_time', 'location', 'status',
        ]));

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
                'message' => 'Event tidak dapat dihapus karena masih ada tamu yang check-in.',
            ], 422);
        }

        $event->audit('deleted', $event->toArray(), null, 'Event deleted');
        $event->delete(); // Soft delete — visits.event_id akan jadi NULL via onDelete('set null') tidak berlaku di soft delete,
                          // tapi data historis tetap aman karena event hanya soft-deleted

        return response()->json([
            'success' => true,
            'message' => 'Event berhasil dihapus',
        ]);
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

        $eventQuery = Event::withCount('visits');

        if ($startDate) {
            $eventQuery->whereDate('event_date', '>=', $startDate);
        }
        if ($endDate) {
            $eventQuery->whereDate('event_date', '<=', $endDate);
        }
        if ($status) {
            $eventQuery->where('status', $status);
        }
        if ($eventId) {
            $eventQuery->where('id', $eventId);
        }

        $events = $eventQuery->with('creator:id,name')->orderBy('event_date', 'desc')->get();

        // Per-event statistics
        $eventStats = $events->map(function ($event) {
            $visits     = Visit::where('event_id', $event->id);
            $checkedIn  = (clone $visits)->where('status', 'IN')->count();
            $checkedOut = (clone $visits)->where('status', 'OUT')->count();

            $avgDuration = Visit::where('event_id', $event->id)
                ->where('status', 'OUT')
                ->whereNotNull('check_out')
                ->select(DB::raw('AVG(TIMESTAMPDIFF(MINUTE, check_in, check_out)) as avg_minutes'))
                ->value('avg_minutes');

            $companies = Visit::where('event_id', $event->id)
                ->join('visitors', 'visits.visitor_id', '=', 'visitors.id')
                ->whereNotNull('visitors.company')
                ->where('visitors.company', '!=', '')
                ->distinct('visitors.company')
                ->count('visitors.company');

            return [
                'id'              => $event->id,
                'name'            => $event->name,
                'event_date'      => $event->event_date,
                'start_time'      => $event->start_time,
                'end_time'        => $event->end_time,
                'location'        => $event->location,
                'status'          => $event->status,
                'creator'         => $event->creator,
                'total_visitors'  => $event->visits_count,
                'checked_in'      => $checkedIn,
                'checked_out'     => $checkedOut,
                'avg_duration'    => $avgDuration ? round($avgDuration) : null,
                'companies_count' => $companies,
            ];
        });

        // Summary
        $summary = [
            'total_events'    => $events->count(),
            'total_visitors'  => $eventStats->sum('total_visitors'),
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

        $events = Event::withCount('visits')
            ->whereDate('event_date', '>=', $startDate)
            ->whereDate('event_date', '<=', $endDate)
            ->with('creator:id,name')
            ->orderBy('event_date', 'desc')
            ->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $headerStyle = [
            'font'      => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 12],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E3A8A']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
        ];

        $sheet->setCellValue('A1', 'LAPORAN EVENT');
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

        $headers = ['No', 'Nama Event', 'Tanggal Event', 'Waktu Mulai', 'Waktu Selesai', 'Lokasi', 'Status', 'Total Peserta', 'Peserta Check-Out', 'Peserta Aktif', 'Dibuat Oleh'];
        $sheet->fromArray($headers, null, 'A4');
        $sheet->getStyle('A4:K4')->applyFromArray($headerStyle);

        $row = 5;
        foreach ($events as $index => $event) {
            $checkedOut = $event->visits()->whereNotNull('check_out')->count();
            $active = $event->visits()->whereNull('check_out')->count();
            
            $sheet->setCellValue('A' . $row, $index + 1);
            $sheet->setCellValue('B' . $row, $event->name);
            $sheet->setCellValue('C' . $row, Carbon::parse($event->event_date)->format('d/m/Y'));
            $sheet->setCellValue('D' . $row, substr($event->start_time, 0, 5));
            $sheet->setCellValue('E' . $row, substr($event->end_time, 0, 5));
            $sheet->setCellValue('F' . $row, $event->location ?? '-');
            $sheet->setCellValue('G' . $row, ucfirst($event->status));
            $sheet->setCellValue('H' . $row, $event->visits_count);
            $sheet->setCellValue('I' . $row, $checkedOut);
            $sheet->setCellValue('J' . $row, $active);
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

        $events = Event::withCount('visits')
            ->whereDate('event_date', '>=', $startDate)
            ->whereDate('event_date', '<=', $endDate)
            ->with('creator:id,name')
            ->orderBy('event_date', 'desc')
            ->get();

        $data = [
            'events'       => $events,
            'start_date'   => $startDate->format('d M Y'),
            'end_date'     => $endDate->format('d M Y'),
            'total_events' => $events->count(),
            'generated_by' => $user->name,
            'generated_at' => Carbon::now()->format('d M Y H:i'),
        ];

        $pdf = Pdf::loadView('reports.events', $data)->setPaper('a4', 'landscape');

        $fileName = 'Laporan_Event_' . $startDate->format('Ymd') . '_' . $endDate->format('Ymd') . '.pdf';

        return $pdf->download($fileName);
    }
}