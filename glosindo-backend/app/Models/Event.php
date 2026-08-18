<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

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
        'description',
        'event_date',
        'start_time',
        'end_time',
        'location',
        'status',
        'created_by',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'event_date' => 'date',
    ];

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
     * Scope: events that can be used for check-in (scheduled or ongoing, today''s date).
     */
    public function scopeActiveForCheckIn($query)
    {
        return $query->whereIn('status', ['scheduled', 'ongoing'])
                     ->whereDate('event_date', \Illuminate\Support\Carbon::today());
    }

    /**
     * Scope: events that are valid (not cancelled or finished) for general listing.
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['draft', 'scheduled', 'ongoing']);
    }
}