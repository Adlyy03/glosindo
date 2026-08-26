<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GroupParticipant extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    protected $table = 'group_participants';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'event_group_id',
        'name',
        'phone',
        'email',
        'registered_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'registered_at' => 'datetime',
    ];

    /**
     * Boot the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($participant) {
            if (empty($participant->registered_at)) {
                $participant->registered_at = now();
            }
        });
    }

    /**
     * Get the event group that owns this participant.
     */
    public function eventGroup()
    {
        return $this->belongsTo(EventGroup::class, 'event_group_id');
    }

    /**
     * Get all point transactions for this participant.
     */
    public function transactions()
    {
        return $this->hasMany(PointTransaction::class, 'group_participant_id');
    }

    /**
     * Get total points earned by this participant.
     */
    public function getTotalPointsAttribute()
    {
        return $this->transactions()->sum('points');
    }

    /**
     * Get transaction count for this participant.
     */
    public function getTransactionCountAttribute()
    {
        return $this->transactions()->count();
    }
}
