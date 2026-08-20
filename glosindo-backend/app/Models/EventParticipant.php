<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EventParticipant extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    protected $table = 'event_participants';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'event_id',
        'visitor_id',
        'name',
        'phone',
        'email',
        'company',
        'position',
        'status',
        'registered_at',
        'checked_in_at',
        'checked_out_at',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'registered_at'  => 'datetime',
        'checked_in_at'  => 'datetime',
        'checked_out_at' => 'datetime',
    ];

    /**
     * Boot the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($participant) {
            if (!$participant->registered_at) {
                $participant->registered_at = \Illuminate\Support\Carbon::now();
            }
            if (!$participant->status) {
                $participant->status = 'registered';
            }
        });
    }

    /**
     * Get the event associated with this participant.
     */
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Get the visitor profile associated with this participant.
     */
    public function visitor()
    {
        return $this->belongsTo(Visitor::class);
    }
}
