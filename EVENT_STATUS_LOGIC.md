# Event Status Logic - Auto Update

## Status Flow

```
┌─────────────┐
│   DRAFT     │ ← Manual (user belum finalize)
└──────┬──────┘
       │ (auto update saat save)
       ↓
┌─────────────┐
│  SCHEDULED  │ ← Tanggal event di masa depan
└──────┬──────┘
       │ (saat event dimulai)
       ↓
┌─────────────┐
│   ACTIVE    │ ← Event sedang berlangsung (start ≤ now ≤ end)
└──────┬──────┘
       │ (saat event selesai)
       ↓
┌─────────────┐
│  FINISHED   │ ← Event sudah lewat (now > end)
└─────────────┘

     ┌───────────┐
     │ CANCELLED │ ← Manual (admin batalkan event)
     └───────────┘
```

---

## Auto-Update Logic

### 1. **Calculate Status** (`Event::calculateStatus()`)

Compute status berdasarkan tanggal/waktu:

```php
$now = Carbon::now('Asia/Jakarta');
$eventStart = Carbon::parse($startDate . ' ' . $startTime);
$eventEnd = Carbon::parse($endDate . ' ' . $endTime);

if ($now < $eventStart) return 'scheduled';
if ($now >= $eventStart && $now <= $eventEnd) return 'active';
return 'finished';
```

### 2. **Model Event Hooks**

Auto-update saat create/update:

```php
protected static function booted()
{
    static::creating(function ($event) {
        // Auto-set status saat create (jika belum ada)
        if (empty($event->status) || $event->status === 'draft') {
            $event->status = Event::calculateStatus(...);
        }
    });

    static::updating(function ($event) {
        // Auto-update jika tanggal berubah (skip cancelled/finished manual)
        if (!$event->isDirty('status') && !in_array($event->status, ['cancelled', 'finished'])) {
            $event->status = Event::calculateStatus(...);
        }
    });
}
```

### 3. **Artisan Command** (`events:update-statuses`)

Cron job untuk update bulk:

```bash
php artisan events:update-statuses
```

**Scheduled hourly** di `app/Console/Kernel.php`:

```php
$schedule->command('events:update-statuses')
         ->hourly()
         ->withoutOverlapping();
```

---

## Appended Attributes (Real-time)

API response otomatis include:

```json
{
  "id": 1,
  "status": "active",
  "computed_status": "active",   // Real-time compute
  "is_active": true,              // Boolean helper
  "is_finished": false
}
```

**Usage:**

```php
$event = Event::find(1);

// Database status (bisa outdated)
$event->status; // "scheduled"

// Real-time computed status
$event->computed_status; // "active"
$event->is_active; // true
$event->is_finished; // false
```

---

## Frontend Display

### Badge Colors:

```jsx
const statusColors = {
  draft: 'bg-slate-200 text-slate-700',
  scheduled: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  finished: 'bg-slate-300 text-slate-600',
  cancelled: 'bg-red-100 text-red-700',
};

<Badge className={statusColors[event.computed_status || event.status]}>
  {event.computed_status || event.status}
</Badge>
```

### Realtime Check:

Pakai `computed_status` dari API response (bukan `status`).

---

## Scope Query Helpers

### Active Events:

```php
Event::active()->get(); // draft, scheduled, active
```

### Check-in Eligible:

```php
Event::activeForCheckIn()->get(); // active events happening today
```

### Upcoming:

```php
Event::upcoming()->get(); // scheduled + active, sorted by date
```

---

## Manual Override Rules

1. **CANCELLED** → never auto-update (permanent)
2. **DRAFT** → auto-upgrade to scheduled/active/finished saat save
3. **FINISHED (manual)** → auto-respect (skip update)

User bisa:
- Set manual ke "cancelled" (permanent block)
- Keep "draft" (skip auto-update sampai user finalize)

---

## Setup Cron (Production)

### Laravel Scheduler:

Add to server crontab:

```bash
* * * * * cd /path/to/glosindo-backend && php artisan schedule:run >> /dev/null 2>&1
```

This runs `events:update-statuses` hourly auto.

### Manual Run:

```bash
php artisan events:update-statuses
```

---

## Testing

### Create Event Test:

```php
$event = Event::create([
    'name' => 'Test Event',
    'start_date' => today()->addDays(7),
    'end_date' => today()->addDays(7),
    'start_time' => '09:00:00',
    'end_time' => '17:00:00',
]);

// Should auto-set to 'scheduled'
assert($event->status === 'scheduled');
assert($event->computed_status === 'scheduled');
```

### Active Event Test:

```php
$event = Event::create([
    'name' => 'Active Event',
    'start_date' => today(),
    'end_date' => today(),
    'start_time' => '00:00:00',
    'end_time' => '23:59:59',
]);

// Should auto-set to 'active'
assert($event->status === 'active');
assert($event->is_active === true);
```

### Finished Event Test:

```php
$event = Event::create([
    'name' => 'Past Event',
    'start_date' => today()->subDays(7),
    'end_date' => today()->subDays(7),
    'start_time' => '09:00:00',
    'end_time' => '17:00:00',
]);

// Should auto-set to 'finished'
assert($event->status === 'finished');
assert($event->is_finished === true);
```

---

## Migration Notes

Existing events di DB:
- Run `php artisan events:update-statuses` once setelah deploy
- Cron akan sync status hourly after that
