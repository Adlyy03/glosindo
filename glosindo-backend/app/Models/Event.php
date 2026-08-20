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
        });

        static::updating(function ($event) {
            if (empty($event->event_date) && !empty($event->start_date)) {
                $event->event_date = $event->start_date;
            }
        });
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
     */
    public function scopeActiveForCheckIn($query)
    {
        $today = Carbon::today()->toDateString();
        return $query->whereIn('status', ['scheduled', 'ongoing', 'active'])
                     ->where(function ($q) use ($today) {
                         $q->whereDate('event_date', $today)
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
        return $query->whereIn('status', ['draft', 'scheduled', 'ongoing', 'active']);
    }
}