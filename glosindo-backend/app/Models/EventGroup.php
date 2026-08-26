<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class EventGroup extends Model
{
    use HasFactory, Auditable;

    protected $table = 'event_groups';

    protected $fillable = [
        'game_event_id',
        'name',
        'code',
        'register_token',
    ];

    protected static function booted(): void
    {
        static::creating(function ($group) {
            if (empty($group->code)) {
                $group->code = static::generateUniqueCode();
            }
            if (empty($group->register_token)) {
                $group->register_token = static::generateUniqueToken();
            }
        });
    }

    public static function generateUniqueCode(): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (static::where('code', $code)->exists());
        return $code;
    }

    public static function generateUniqueToken(): string
    {
        do {
            $token = Str::random(32);
        } while (static::where('register_token', $token)->exists());
        return $token;
    }

    public function gameEvent()
    {
        return $this->belongsTo(GameEvent::class, 'game_event_id');
    }

    public function participants()
    {
        return $this->hasMany(GroupParticipant::class, 'event_group_id');
    }

    public function transactions()
    {
        return $this->hasMany(PointTransaction::class, 'event_group_id');
    }

    public function getTotalPointsAttribute()
    {
        return $this->transactions()->sum('points');
    }

    public function getTotalParticipantsAttribute()
    {
        return $this->participants()->count();
    }

    public function getRegistrationUrlAttribute()
    {
        return url("/games/register/{$this->register_token}");
    }
}
