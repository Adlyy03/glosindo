<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Peserta Event</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 11px; color: #1a1a2e; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 3px solid #1e3a8a; padding-bottom: 15px; }
        .header h1 { font-size: 20px; color: #1e3a8a; font-weight: 900; margin-bottom: 4px; }
        .header p { font-size: 11px; color: #555; }
        .event-info { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px; margin-bottom: 15px; }
        .event-info h2 { font-size: 14px; color: #1e3a8a; margin-bottom: 8px; }
        .event-info p { font-size: 10px; color: #64748b; margin-bottom: 4px; }
        .summary { display: flex; gap: 10px; margin-bottom: 15px; }
        .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; flex: 1; text-align: center; }
        .stat-card .num { font-size: 18px; font-weight: 900; color: #1e3a8a; }
        .stat-card .lbl { font-size: 8px; color: #64748b; text-transform: uppercase; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        thead tr { background: #1e3a8a; color: white; }
        thead th { padding: 7px 6px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; }
        tbody tr:nth-child(even) { background: #f8fafc; }
        tbody td { padding: 6px; border-bottom: 1px solid #e2e8f0; font-size: 10px; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 9px; font-weight: 700; text-transform: uppercase; }
        .badge-registered { background: #dbeafe; color: #1d4ed8; }
        .badge-checked_in { background: #d1fae5; color: #065f46; }
        .badge-checked_out { background: #f1f5f9; color: #475569; }
        .footer { margin-top: 20px; text-align: right; font-size: 9px; color: #9ca3af; border-top: 1px solid #e2e8f0; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>LAPORAN PESERTA EVENT</h1>
        <p>{{ $event->name }}</p>
    </div>

    <div class="event-info">
        <h2>Informasi Event</h2>
        <p><strong>Nama:</strong> {{ $event->name }}</p>
        <p><strong>Tanggal:</strong> {{ $dateRange }}</p>
        <p><strong>Waktu:</strong> {{ substr($event->start_time, 0, 5) }} - {{ substr($event->end_time, 0, 5) }}</p>
        <p><strong>Lokasi:</strong> {{ $event->location ?? '-' }}</p>
        <p><strong>Status:</strong> {{ ucfirst($event->status) }}</p>
    </div>

    <div class="summary">
        <div class="stat-card">
            <div class="num">{{ $participants->count() }}</div>
            <div class="lbl">Total Peserta</div>
        </div>
        <div class="stat-card">
            <div class="num">{{ $totalRegistered }}</div>
            <div class="lbl">Terdaftar</div>
        </div>
        <div class="stat-card">
            <div class="num">{{ $totalCheckedIn }}</div>
            <div class="lbl">Check-In</div>
        </div>
        <div class="stat-card">
            <div class="num">{{ $totalCheckedOut }}</div>
            <div class="lbl">Check-Out</div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width:4%">No</th>
                <th style="width:18%">Nama</th>
                <th style="width:12%">No. HP</th>
                <th style="width:16%">Email</th>
                <th style="width:14%">Perusahaan</th>
                <th style="width:12%">Posisi</th>
                <th style="width:10%">Status</th>
                <th style="width:14%">Tgl Daftar</th>
            </tr>
        </thead>
        <tbody>
            @forelse($participants as $index => $p)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td><strong>{{ $p->name }}</strong></td>
                <td>{{ $p->phone ?? '-' }}</td>
                <td>{{ $p->email ?? '-' }}</td>
                <td>{{ $p->company ?? '-' }}</td>
                <td>{{ $p->position ?? '-' }}</td>
                <td>
                    <span class="badge badge-{{ $p->status }}">{{ ucfirst($p->status) }}</span>
                </td>
                <td>{{ $p->registered_at ? \Carbon\Carbon::parse($p->registered_at)->format('d/m/Y H:i') : '-' }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="8" style="text-align:center; padding: 20px; color:#9ca3af;">Belum ada peserta terdaftar.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Digenerate pada {{ \Carbon\Carbon::now()->format('d M Y H:i') }} WIB oleh sistem GLOSINDO Digital Guestbook.
    </div>
</body>
</html>
