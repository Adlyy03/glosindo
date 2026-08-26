<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GameEvent extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    protected $table = 'game_events';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'description',
        'start_date',
        'end_date',
        'status',
        'created_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    /**
     * Boot the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($event) {
            if (empty($event->status)) {
                $event->status = 'draft';
            }
        });
    }

    /**
     * Get all groups for this game event.
     */
    public function groups()
    {
        return $this->hasMany(EventGroup::class, 'game_event_id');
    }

    /**
     * Get all point QR codes for this game event.
     */
    public function pointQrCodes()
    {
        return $this->hasMany(PointQrCode::class, 'game_event_id');
    }

    /**
     * Get all point transactions for this game event.
     */
    public function transactions()
    {
        return $this->hasMany(PointTransaction::class, 'game_event_id');
    }

    /**
     * Get the user who created this event.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get total points for this event.
     */
    public function getTotalPointsAttribute()
    {
        return $this->transactions()->sum('points');
    }

    /**
     * Get total participants count.
     */
    public function getTotalParticipantsAttribute()
    {
        return GroupParticipant::whereIn('event_group_id', $this->groups->pluck('id'))->count();
    }

    /**
     * Get total groups count.
     */
    public function getTotalGroupsAttribute()
    {
        return $this->groups()->count();
    }

    /**
     * Scope: only active events.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope: only draft events.
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    /**
     * Scope: only completed events.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }
}
