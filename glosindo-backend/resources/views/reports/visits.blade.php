<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Kunjungan Tamu</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; font-size: 11px; color: #1f2937; }
        .header { text-align: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 3px solid #1e3a8a; }
        .header h1 { font-size: 20px; color: #1e3a8a; margin-bottom: 5px; }
        .header p { font-size: 12px; color: #6b7280; }
        .info { margin-bottom: 15px; display: flex; justify-content: space-between; }
        .info-box { background: #f3f4f6; padding: 8px 12px; border-radius: 4px; }
        .info-box strong { color: #1e3a8a; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #1e3a8a; color: white; padding: 10px 8px; text-align: left; font-size: 11px; font-weight: bold; }
        td { padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 10px; }
        tr:nth-child(even) { background: #f9fafb; }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 9px; font-weight: bold; }
        .badge-in { background: #dbeafe; color: #1e40af; }
        .badge-out { background: #d1fae5; color: #065f46; }
        .summary { margin-top: 20px; background: #f3f4f6; padding: 15px; border-radius: 6px; }
        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
        .summary-item { text-align: center; }
        .summary-item .label { font-size: 10px; color: #6b7280; margin-bottom: 5px; }
        .summary-item .value { font-size: 24px; font-weight: bold; color: #1e3a8a; }
        .footer { margin-top: 30px; padding-top: 10px; border-top: 2px solid #e5e7eb; font-size: 9px; color: #9ca3af; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>LAPORAN KUNJUNGAN TAMU</h1>
        <p>Periode: {{ $start_date }} - {{ $end_date }}</p>
    </div>

    <div class="info">
        <div class="info-box">
            <strong>Dibuat oleh:</strong> {{ $generated_by }}
        </div>
        <div class="info-box">
            <strong>Tanggal Cetak:</strong> {{ $generated_at }}
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 5%;">No</th>
                <th style="width: 20%;">Nama Tamu</th>
                <th style="width: 18%;">Perusahaan</th>
                <th style="width: 12%;">Telepon</th>
                <th style="width: 15%;">Keperluan</th>
                <th style="width: 12%;">Check-In</th>
                <th style="width: 12%;">Check-Out</th>
                <th style="width: 6%;">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($visits as $index => $visit)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td><strong>{{ $visit->visitor->name ?? '-' }}</strong></td>
                <td>{{ $visit->visitor->company ?? '-' }}</td>
                <td>{{ $visit->visitor->phone ?? '-' }}</td>
                <td>{{ $visit->purpose }}</td>
                <td>{{ \Carbon\Carbon::parse($visit->check_in)->format('d/m/Y H:i') }}</td>
                <td>{{ $visit->check_out ? \Carbon\Carbon::parse($visit->check_out)->format('d/m/Y H:i') : '-' }}</td>
                <td>
                    <span class="badge {{ $visit->status === 'IN' ? 'badge-in' : 'badge-out' }}">
                        {{ $visit->status === 'IN' ? 'Aktif' : 'Selesai' }}
                    </span>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="8" style="text-align: center; padding: 20px; color: #9ca3af;">
                    Tidak ada data kunjungan pada periode ini
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="summary">
        <div class="summary-grid">
            <div class="summary-item">
                <div class="label">Total Kunjungan</div>
                <div class="value">{{ $total_visits }}</div>
            </div>
            <div class="summary-item">
                <div class="label">Kunjungan Aktif</div>
                <div class="value" style="color: #2563eb;">{{ $active_visits }}</div>
            </div>
            <div class="summary-item">
                <div class="label">Kunjungan Selesai</div>
                <div class="value" style="color: #10b981;">{{ $completed_visits }}</div>
            </div>
        </div>
    </div>

    <div class="footer">
        <p>Dokumen ini dibuat secara otomatis oleh sistem manajemen kunjungan tamu.</p>
    </div>
</body>
</html>
