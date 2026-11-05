<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

class ReservationInvitation extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    protected $fillable = [
        'token',
        'type',
        'company_name',
        'guest_name',
        'purpose',
        'meet_to',
        'scheduled_date',
        'scheduled_time',
        'quota',
        'used_count',
        'expires_at',
        'is_active',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
        'quota' => 'integer',
        'used_count' => 'integer',
    ];

    /**
     * Relationship to reservations registered via this link.
     */
    public function reservations()
    {
        return $this->hasMany(Reservation::class, 'invitation_id');
    }

    /**
     * Relationship to the user who created this invitation.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Check if invitation link is still valid.
     */
    public function isValid(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->isExpired()) {
            return false;
        }

        if ($this->isQuotaExceeded()) {
            return false;
        }

        return true;
    }

    /**
     * Check if invitation has expired.
     */
    public function isExpired(): bool
    {
        return Carbon::now()->greaterThan($this->expires_at);
    }

    /**
     * Check if registration quota is full.
     */
    public function isQuotaExceeded(): bool
    {
        return $this->quota > 0 && $this->used_count >= $this->quota;
    }

    /**
     * Remaining quota.
     */
    public function remainingQuota(): int
    {
        return max(0, $this->quota - $this->used_count);
    }
}

