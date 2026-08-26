<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PointQrCode extends Model
{
    use HasFactory, Auditable;

    protected $table = 'point_qr_codes';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'game_event_id',
        'point_value',
        'token',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'point_value' => 'integer',
    ];

    /**
     * Valid point values (MVP requirement).
     */
    public const VALID_POINT_VALUES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

    /**
     * Boot the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($qr) {
            // Generate unique token jika belum ada
            if (empty($qr->token)) {
                $qr->token = static::generateUniqueToken();
            }
            // Default status active
            if (empty($qr->status)) {
                $qr->status = 'active';
            }
        });
    }

    /**
     * Generate unique token untuk QR code.
     */
    public static function generateUniqueToken(): string
    {
        do {
            $token = Str::random(32);
        } while (static::where('token', $token)->exists());

        return $token;
    }

    /**
     * Get the game event that owns this QR code.
     */
    public function gameEvent()
    {
        return $this->belongsTo(GameEvent::class, 'game_event_id');
    }

    /**
     * Get all transactions using this QR code.
     */
    public function transactions()
    {
        return $this->hasMany(PointTransaction::class, 'point_qr_code_id');
    }

    /**
     * Get scan count for this QR code.
     */
    public function getScanCountAttribute()
    {
        return $this->transactions()->count();
    }

    /**
     * Check if QR code is active.
     */
    public function getIsActiveAttribute()
    {
        return $this->status === 'active';
    }

    /**
     * Scope: only active QR codes.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Validate point value.
     */
    public static function isValidPointValue(int $value): bool
    {
        return in_array($value, self::VALID_POINT_VALUES, true);
    }
}
