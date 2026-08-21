<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class Event extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'code',
        'description',
        'event_date',
        'start_date',
        'end_date',
        'start_time',
        'end_time',
        'location',
        'registration_start_at',
        'registration_end_at',
        'status',
        'created_by',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'event_date'             => 'date',
        'start_date'             => 'date',
        'end_date'               => 'date',
        'registration_start_at'  => 'datetime',
        'registration_end_at'    => 'datetime',
    ];

    /**
     * The attributes that should be appended to arrays/JSON.
     *
     * @var array
     */
    protected $appends = ['computed_status', 'is_active', 'is_finished'];

    /**
     * Model boot
     */
    protected static function booted(): void
    {
        static::creating(function ($event) {
            if (empty($event->code)) {
                $event->code = static::generateUniqueCode($event->name);
            }
            if (empty($event->start_date) && !empty($event->event_date)) {
                $event->start_date = $event->event_date;
            }
            if (empty($event->end_date) && !empty($event->start_date)) {
                $event->end_date = $event->start_date;
            }
            if (empty($event->event_date) && !empty($event->start_date)) {
                $event->event_date = $event->start_date;
            }
            
            // Auto-set status if not provided
            if (empty($event->status) || $event->status === 'draft') {
                $event->status = static::calculateStatus(
                    $event->start_date ?: $event->event_date,
                    $event->end_date ?: $event->start_date ?: $event->event_date,
                    $event->start_time,
                    $event->end_time
                );
            }
        });

        static::updating(function ($event) {
            if (empty($event->event_date) && !empty($event->start_date)) {
                $event->event_date = $event->start_date;
            }
            
            // Auto-update status on date changes (skip if manually set to cancelled/finished)
            if (!$event->isDirty('status') && !in_array($event->status, ['cancelled', 'finished'])) {
                $event->status = static::calculateStatus(
                    $event->start_date ?: $event->event_date,
                    $event->end_date ?: $event->start_date ?: $event->event_date,
                    $event->start_time,
                    $event->end_time
                );
            }
        });
    }

    /**
     * Calculate event status based on dates and times.
     * 
     * Logic:
     * - scheduled: event belum dimulai
     * - active: event sedang berlangsung
     * - finished: event sudah selesai
     */
    public static function calculateStatus($startDate, $endDate, $startTime, $endTime): string
    {
        $now = Carbon::now('Asia/Jakarta');
        
        // Parse dates - handle Carbon objects or strings
        $startDateStr = $startDate instanceof Carbon ? $startDate->format('Y-m-d') : $startDate;
        $endDateStr = $endDate instanceof Carbon ? $endDate->format('Y-m-d') : $endDate;
        
        // Ensure time is HH:MM:SS format
        $startTimeStr = $startTime ? substr($startTime, 0, 8) : '00:00:00';
        $endTimeStr = $endTime ? substr($endTime, 0, 8) : '23:59:59';
        
        $eventStart = Carbon::parse($startDateStr . ' ' . $startTimeStr, 'Asia/Jakarta');
        $eventEnd = Carbon::parse($endDateStr . ' ' . $endTimeStr, 'Asia/Jakarta');
        
        if ($now->lt($eventStart)) {
            return 'scheduled'; // Belum dimulai
        }
        
        if ($now->gte($eventStart) && $now->lte($eventEnd)) {
            return 'active'; // Sedang berlangsung
        }
        
        return 'finished'; // Sudah selesai
    }

    /**
     * Get computed status attribute (real-time).
     */
    public function getComputedStatusAttribute(): string
    {
        // Respect manual overrides (cancelled)
        if ($this->status === 'cancelled') {
            return 'cancelled';
        }
        
        return static::calculateStatus(
            $this->start_date ?: $this->event_date,
            $this->end_date ?: $this->start_date ?: $this->event_date,
            $this->start_time,
            $this->end_time
        );
    }

    /**
     * Check if event is currently active (real-time).
     */
    public function getIsActiveAttribute(): bool
    {
        return $this->getComputedStatusAttribute() === 'active';
    }

    /**
     * Check if event is finished (real-time).
     */
    public function getIsFinishedAttribute(): bool
    {
        return $this->getComputedStatusAttribute() === 'finished';
    }

    /**
     * Generate unique slug/code for event.
     */
    public static function generateUniqueCode(string $name): string
    {
        $base = Str::slug($name);
        if (empty($base)) {
            $base = 'event';
        }
        $code = $base . '-' . Str::lower(Str::random(5));
        
        while (static::where('code', $code)->exists()) {
            $code = $base . '-' . Str::lower(Str::random(6));
        }

        return $code;
    }

    /**
     * Get all participants for this event.
     */
    public function participants()
    {
        return $this->hasMany(EventParticipant::class);
    }

    /**
     * Get all visits for this event.
     */
    public function visits()
    {
        return $this->hasMany(Visit::class);
    }

    /**
     * Get the user who created this event.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope: events that can be used for check-in.
     * Only active or scheduled events happening today.
     */
    public function scopeActiveForCheckIn($query)
    {
        $now = Carbon::now('Asia/Jakarta');
        $today = $now->toDateString();
        
        return $query->where('status', '!=', 'cancelled')
                     ->where(function ($q) use ($today, $now) {
                         // Single-day event today
                         $q->whereDate('event_date', $today)
                           // Multi-day event (start <= today <= end)
                           ->orWhere(function ($sub) use ($today) {
                               $sub->whereDate('start_date', '<=', $today)
                                   ->whereDate('end_date', '>=', $today);
                           });
                     });
    }

    /**
     * Scope: events that are valid (not cancelled or finished) for general listing.
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['draft', 'scheduled', 'active']);
    }

    /**
     * Scope: upcoming events (scheduled or active, not finished).
     */
    public function scopeUpcoming($query)
    {
        return $query->whereIn('status', ['scheduled', 'active'])
                     ->orderBy('start_date', 'asc')
                     ->orderBy('start_time', 'asc');
    }
}