<?php

namespace App\Http\Controllers;

use App\Models\Visit;
use App\Models\Visitor;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    /**
     * Get statistics data for charts (weekly/monthly)
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function statistics(Request $request)
    {
        $user = auth()->user();
        $period = $request->input('period', 'weekly'); // weekly or monthly
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        // Default date ranges
        if (!$startDate || !$endDate) {
            if ($period === 'weekly') {
                $startDate = Carbon::now()->startOfWeek();
                $endDate = Carbon::now()->endOfWeek();
            } else {
                $startDate = Carbon::now()->startOfMonth();
                $endDate = Carbon::now()->endOfMonth();
            }
        } else {
            $startDate = Carbon::parse($startDate);
            $endDate = Carbon::parse($endDate);
        }

        $query = Visit::whereBetween('check_in', [$startDate, $endDate]);

        // Receptionist only see their own data, supervisor & admin see all
        if ($user->role === 'receptionist') {
            $query->where('receptionist_id', $user->id);
        }

        // Group by date
        $dailyStats = $query->select(
            DB::raw('DATE(check_in) as date'),
            DB::raw('COUNT(*) as total_visits'),
            DB::raw('SUM(CASE WHEN status = "IN" THEN 1 ELSE 0 END) as active_visits'),
            DB::raw('SUM(CASE WHEN status = "OUT" THEN 1 ELSE 0 END) as completed_visits')
        )
        ->groupBy('date')
        ->orderBy('date', 'asc')
        ->get();

        // Total statistics - supervisor & admin see all
        $totalQuery = Visit::whereBetween('check_in', [$startDate, $endDate]);
        if ($user->role === 'receptionist') {
            $totalQuery->where('receptionist_id', $user->id);
        }

        $totalVisits = $totalQuery->count();
        $activeVisits = $totalQuery->where('status', 'IN')->count();
        $completedVisits = $totalQuery->where('status', 'OUT')->count();

        // Top visitors
        $topVisitors = Visit::whereBetween('check_in', [$startDate, $endDate])
            ->when($user->role === 'receptionist', fn($q) => $q->where('receptionist_id', $user->id))
            ->select('visitor_id', DB::raw('COUNT(*) as visit_count'))
            ->with('visitor:id,name,company,phone')
            ->groupBy('visitor_id')
            ->orderBy('visit_count', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'period' => $period,
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'daily_stats' => $dailyStats,
                'summary' => [
                    'total_visits' => $totalVisits,
                    'active_visits' => $activeVisits,
                    'completed_visits' => $completedVisits,
                ],
                'top_visitors' => $topVisitors,
            ],
        ]);
    }

    /**
     * Export report to Excel
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function exportExcel(Request $request)
    {
        try {
            $user = auth()->user();
            $startDate = $request->input('start_date', Carbon::now()->startOfMonth());
            $endDate = $request->input('end_date', Carbon::now()->endOfMonth());

            $startDate = Carbon::parse($startDate);
            $endDate = Carbon::parse($endDate);

            $query = Visit::with(['visitor:id,name,company,phone', 'receptionist:id,name'])
                ->whereBetween('check_in', [$startDate, $endDate]);

            if ($user->role === 'receptionist') {
                $query->where('receptionist_id', $user->id);
            }

            $visits = $query->orderBy('check_in', 'desc')->get();

            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();

            // Header styling
            $headerStyle = [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 12],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E3A8A']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
            ];

            // Set title
            $sheet->setCellValue('A1', 'LAPORAN KUNJUNGAN TAMU');
            $sheet->mergeCells('A1:H1');
            $sheet->getStyle('A1')->applyFromArray([
                'font' => ['bold' => true, 'size' => 16],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);

            $sheet->setCellValue('A2', 'Periode: ' . $startDate->format('d M Y') . ' - ' . $endDate->format('d M Y'));
            $sheet->mergeCells('A2:H2');
            $sheet->getStyle('A2')->applyFromArray([
                'font' => ['size' => 11],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);

            // Headers
            $headers = ['No', 'Nama Tamu', 'Perusahaan', 'Telepon', 'Keperluan', 'Check-In', 'Check-Out', 'Status'];
            $sheet->fromArray($headers, null, 'A4');
            $sheet->getStyle('A4:H4')->applyFromArray($headerStyle);

            // Data rows
            $row = 5;
            foreach ($visits as $index => $visit) {
                $sheet->setCellValue('A' . $row, $index + 1);
                $sheet->setCellValue('B' . $row, $visit->visitor->name ?? '-');
                $sheet->setCellValue('C' . $row, $visit->visitor->company ?? '-');
                $sheet->setCellValue('D' . $row, $visit->visitor->phone ?? '-');
                $sheet->setCellValue('E' . $row, $visit->purpose);
                $sheet->setCellValue('F' . $row, Carbon::parse($visit->check_in)->format('d/m/Y H:i'));
                $sheet->setCellValue('G' . $row, $visit->check_out ? Carbon::parse($visit->check_out)->format('d/m/Y H:i') : '-');
                $sheet->setCellValue('H' . $row, $visit->status === 'IN' ? 'Aktif' : 'Selesai');

                // Alternating row colors
                if ($index % 2 === 0) {
                    $sheet->getStyle('A' . $row . ':H' . $row)->applyFromArray([
                        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F3F4F6']],
                    ]);
                }

                $row++;
            }

            // Apply borders to data
            $sheet->getStyle('A4:H' . ($row - 1))->applyFromArray([
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
            ]);

            // Auto-size columns
            foreach (range('A', 'H') as $col) {
                $sheet->getColumnDimension($col)->setAutoSize(true);
            }

            // Summary
            $row += 2;
            $sheet->setCellValue('A' . $row, 'Total Kunjungan:');
            $sheet->setCellValue('B' . $row, $visits->count());
            $sheet->getStyle('A' . $row . ':B' . $row)->applyFromArray([
                'font' => ['bold' => true],
            ]);

            $row++;
            $sheet->setCellValue('A' . $row, 'Kunjungan Aktif:');
            $sheet->setCellValue('B' . $row, $visits->where('status', 'IN')->count());

            $row++;
            $sheet->setCellValue('A' . $row, 'Kunjungan Selesai:');
            $sheet->setCellValue('B' . $row, $visits->where('status', 'OUT')->count());

            // Generate file to string
            $fileName = 'Laporan_Kunjungan_' . $startDate->format('Ymd') . '_' . $endDate->format('Ymd') . '.xlsx';
            
            $writer = new Xlsx($spreadsheet);
            
            // Write to output buffer
            ob_start();
            $writer->save('php://output');
            $content = ob_get_clean();

            return response($content, 200, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Expose-Headers' => 'Content-Disposition',
            ]);
        } catch (\Exception $e) {
            \Log::error('Excel export error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal export Excel: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Export report to PDF
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function exportPdf(Request $request)
    {
        try {
            $user = auth()->user();
            $startDate = $request->input('start_date', Carbon::now()->startOfMonth());
            $endDate = $request->input('end_date', Carbon::now()->endOfMonth());

            $startDate = Carbon::parse($startDate);
            $endDate = Carbon::parse($endDate);

            $query = Visit::with(['visitor:id,name,company,phone', 'receptionist:id,name'])
                ->whereBetween('check_in', [$startDate, $endDate]);

            if ($user->role === 'receptionist') {
                $query->where('receptionist_id', $user->id);
            }

            $visits = $query->orderBy('check_in', 'desc')->get();

            $data = [
                'visits' => $visits,
                'start_date' => $startDate->format('d M Y'),
                'end_date' => $endDate->format('d M Y'),
                'total_visits' => $visits->count(),
                'active_visits' => $visits->where('status', 'IN')->count(),
                'completed_visits' => $visits->where('status', 'OUT')->count(),
                'generated_by' => $user->name,
                'generated_at' => Carbon::now()->format('d M Y H:i'),
            ];

            $pdf = Pdf::loadView('reports.visits', $data)
                ->setPaper('a4', 'landscape');

            $fileName = 'Laporan_Kunjungan_' . $startDate->format('Ymd') . '_' . $endDate->format('Ymd') . '.pdf';

            $content = $pdf->output();

            return response($content, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Expose-Headers' => 'Content-Disposition',
            ]);
        } catch (\Exception $e) {
            \Log::error('PDF export error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal export PDF: ' . $e->getMessage(),
            ], 500);
        }
    }
}
