<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Event</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 11px; color: #1a1a2e; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 3px solid #1e3a8a; padding-bottom: 15px; }
        .header h1 { font-size: 20px; color: #1e3a8a; font-weight: 900; letter-spacing: 1px; margin-bottom: 4px; }
        .header p { font-size: 11px; color: #555; }
        .meta { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 10px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        thead tr { background: #1e3a8a; color: white; }
        thead th { padding: 7px 6px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        tbody tr:nth-child(even) { background: #f8fafc; }
        tbody tr:hover { background: #e0f2fe; }
        tbody td { padding: 6px 6px; border-bottom: 1px solid #e2e8f0; font-size: 10px; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 9px; font-weight: 700; text-transform: uppercase; }
        .badge-scheduled { background: #dbeafe; color: #1d4ed8; }
        .badge-ongoing   { background: #d1fae5; color: #065f46; }
        .badge-finished  { background: #f1f5f9; color: #475569; }
        .badge-cancelled { background: #fee2e2; color: #991b1b; }
        .badge-draft     { background: #f3f4f6; color: #6b7280; }
        .footer { margin-top: 20px; text-align: right; font-size: 9px; color: #9ca3af; border-top: 1px solid #e2e8f0; padding-top: 10px; }
        .summary { display: flex; gap: 15px; margin-bottom: 15px; }
        .stat-card { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; flex: 1; text-align: center; }
        .stat-card .num { font-size: 22px; font-weight: 900; color: #1e3a8a; }
        .stat-card .lbl { font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: 600; }
    </style>
</head>
<body>
    <div class="header">
        <h1>LAPORAN EVENT</h1>
        <p>Periode {{ $start_date }} — {{ $end_date }}</p>
    </div>

    <table style="width:100%; margin-bottom:15px; font-size:10px;">
        <tr>
            <td style="width:50%"><strong>Total Event:</strong> {{ $total_events }}</td>
            <td style="width:50%; text-align:right"><strong>Digenerate oleh:</strong> {{ $generated_by }} pada {{ $generated_at }}</td>
        </tr>
    </table>

    <table>
        <thead>
            <tr>
                <th style="width:3%">No</th>
                <th style="width:18%">Nama Event</th>
                <th style="width:8%">Tanggal</th>
                <th style="width:7%">Mulai</th>
                <th style="width:7%">Selesai</th>
                <th style="width:12%">Lokasi</th>
                <th style="width:8%">Status</th>
                <th style="width:7%">Peserta</th>
                <th style="width:7%">Checkout</th>
                <th style="width:7%">Aktif</th>
                <th style="width:13%">Dibuat Oleh</th>
            </tr>
        </thead>
        <tbody>
            @forelse($events as $index => $event)
            @php
                $checkedOut = $event->visits()->whereNotNull('check_out')->count();
                $active = $event->visits()->whereNull('check_out')->count();
            @endphp
            <tr>
                <td>{{ $index + 1 }}</td>
                <td><strong>{{ $event->name }}</strong></td>
                <td>{{ \Carbon\Carbon::parse($event->event_date)->format('d/m/Y') }}</td>
                <td>{{ substr($event->start_time, 0, 5) }}</td>
                <td>{{ substr($event->end_time, 0, 5) }}</td>
                <td>{{ $event->location ?? '-' }}</td>
                <td>
                    <span class="badge badge-{{ $event->status }}">{{ ucfirst($event->status) }}</span>
                </td>
                <td style="text-align:center; font-weight:700;">{{ $event->visits_count }}</td>
                <td style="text-align:center; font-weight:700;">{{ $checkedOut }}</td>
                <td style="text-align:center; font-weight:700;">{{ $active }}</td>
                <td>{{ $event->creator->name ?? '-' }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="11" style="text-align:center; padding: 20px; color:#9ca3af;">Tidak ada data event.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Dokumen ini digenerate secara otomatis oleh sistem GLOSINDO Digital Guestbook.
    </div>
</body>
</html>