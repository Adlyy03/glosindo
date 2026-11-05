<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Reservation extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    protected $fillable = [
        'invitation_id',
        'reservation_code',
        'visitor_id',
        'visitor_name',
        'visitor_phone',
        'visitor_email',
        'visitor_company',
        'purpose',
        'meet_to',
        'scheduled_date',
        'scheduled_time',
        'status',
        'approved_at',
        'checked_in_at',
        'checked_out_at',
        'visit_id',
        'biometric_consent',
        'has_face_registered',
        'notes',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'approved_at' => 'datetime',
        'checked_in_at' => 'datetime',
        'checked_out_at' => 'datetime',
        'biometric_consent' => 'boolean',
        'has_face_registered' => 'boolean',
    ];

    /**
     * Relationship to the invitation link.
     */
    public function invitation()
    {
        return $this->belongsTo(ReservationInvitation::class, 'invitation_id');
    }

    /**
     * Relationship to the visitor.
     */
    public function visitor()
    {
        return $this->belongsTo(Visitor::class, 'visitor_id');
    }

    /**
     * Relationship to the visit record.
     */
    public function visit()
    {
        return $this->belongsTo(Visit::class, 'visit_id');
    }

    /**
     * Scope for approved reservations.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'APPROVED');
    }

    /**
     * Scope for checked-in reservations.
     */
    public function scopeCheckedIn($query)
    {
        return $query->where('status', 'CHECKED_IN');
    }

    /**
     * Scope for today's reservations.
     */
    public function scopeToday($query)
    {
        return $query->whereDate('scheduled_date', \Illuminate\Support\Carbon::today());
    }
}

