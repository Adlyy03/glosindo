<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PointTransaction extends Model
{
    use HasFactory, Auditable;

    protected $table = 'point_transactions';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'game_event_id',
        'event_group_id',
        'group_participant_id',
        'point_qr_code_id',
        'points',
        'scanned_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'points' => 'integer',
        'scanned_at' => 'datetime',
    ];

    /**
     * Boot the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($transaction) {
            if (empty($transaction->scanned_at)) {
                $transaction->scanned_at = now();
            }
        });
    }

    /**
     * Get the game event that owns this transaction.
     */
    public function gameEvent()
    {
        return $this->belongsTo(GameEvent::class, 'game_event_id');
    }

    /**
     * Get the event group that owns this transaction.
     */
    public function eventGroup()
    {
        return $this->belongsTo(EventGroup::class, 'event_group_id');
    }

    /**
     * Get the participant that owns this transaction.
     */
    public function participant()
    {
        return $this->belongsTo(GroupParticipant::class, 'group_participant_id');
    }

    /**
     * Get the QR code used in this transaction.
     */
    public function pointQrCode()
    {
        return $this->belongsTo(PointQrCode::class, 'point_qr_code_id');
    }

    /**
     * Check if participant already scanned this QR code.
     * 
     * @param int $participantId
     * @param int $qrCodeId
     * @return bool
     */
    public static function hasDuplicateScan(int $participantId, int $qrCodeId): bool
    {
        return static::where('group_participant_id', $participantId)
            ->where('point_qr_code_id', $qrCodeId)
            ->exists();
    }

    /**
     * Get total points for a participant.
     * 
     * @param int $participantId
     * @return int
     */
    public static function getTotalPointsForParticipant(int $participantId): int
    {
        return static::where('group_participant_id', $participantId)->sum('points');
    }

    /**
     * Get total points for a group.
     * 
     * @param int $groupId
     * @return int
     */
    public static function getTotalPointsForGroup(int $groupId): int
    {
        return static::where('event_group_id', $groupId)->sum('points');
    }

    /**
     * Get total points for an event.
     * 
     * @param int $eventId
     * @return int
     */
    public static function getTotalPointsForEvent(int $eventId): int
    {
        return static::where('game_event_id', $eventId)->sum('points');
    }
}
