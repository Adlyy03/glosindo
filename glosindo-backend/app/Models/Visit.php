<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class Visit extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    /**
     * Default idle minutes before an active regular visit is automatically checked out.
     */
    public const AUTO_CHECKOUT_MINUTES = 10;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'visitor_id',
        'visitor_name',
        'visitor_company',
        'visitor_phone',
        'receptionist_id',
        'event_id',
        'purpose',
        'meet_to',
        'check_in',
        'check_out',
        'status',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'check_in' => 'datetime',
        'check_out' => 'datetime',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($visit) {
            if (!$visit->check_in) {
                $visit->check_in = \Illuminate\Support\Carbon::now();
            }
            
            // Auto-snapshot visitor data
            if ($visit->visitor_id && !$visit->visitor_name) {
                $visitor = Visitor::find($visit->visitor_id);
                if ($visitor) {
                    $visit->visitor_name = $visitor->name;
                    $visit->visitor_company = $visitor->company;
                    $visit->visitor_phone = $visitor->phone;
                }
            }
        });
    }

    /**
     * Get the visitor that owns the visit.
     */
    public function visitor()
    {
        return $this->belongsTo(Visitor::class);
    }

    /**
     * Get the receptionist who created the visit.
     */
    public function receptionist()
    {
        return $this->belongsTo(User::class, 'receptionist_id');
    }

    /**
     * Get the event associated with this visit.
     */
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Get the reservation associated with this visit.
     */
    public function reservation()
    {
        return $this->hasOne(Reservation::class, 'visit_id');
    }

    /**
     * Scope a query to only include active visits (status IN).
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'IN');
    }

    /**
     * Scope a query to only include completed visits (status OUT).
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'OUT');
    }

    /**
     * Automatically check out regular (non-event) active visits that have exceeded
     * the idle timeout without a checkout scan.
     *
     * @param  int  $minutes
     * @return int Number of visits transitioned to OUT
     */
    public static function autoCheckoutExpired(int $minutes = self::AUTO_CHECKOUT_MINUTES): int
    {
        $minutes = max(1, $minutes);
        $now = Carbon::now();
        $cutoff = $now->copy()->subMinutes($minutes);

        $expiredIds = self::where('status', 'IN')
            ->whereNull('event_id')
            ->where('check_in', '<=', $cutoff)
            ->pluck('id');

        if ($expiredIds->isEmpty()) {
            return 0;
        }

        return DB::transaction(function () use ($expiredIds, $cutoff, $minutes) {
            $checkedOutCount = 0;

            foreach ($expiredIds as $visitId) {
                $visit = self::where('id', $visitId)
                    ->where('status', 'IN')
                    ->whereNull('event_id')
                    ->where('check_in', '<=', $cutoff)
                    ->lockForUpdate()
                    ->first();

                if (!$visit) {
                    continue;
                }

                $oldValues = $visit->toArray();

                $visit->update([
                    'check_out' => null,
                    'status'    => 'OUT',
                ]);

                Reservation::where('visit_id', $visit->id)
                    ->where('status', 'CHECKED_IN')
                    ->update([
                        'status'         => 'CHECKED_OUT',
                        'checked_out_at' => null,
                    ]);

                $visit->audit(
                    'auto_checked_out',
                    $oldValues,
                    $visit->fresh()->toArray(),
                    "Auto checkout otomatis setelah {$minutes} menit tidak melakukan scan checkout"
                );

                $checkedOutCount++;
            }

            return $checkedOutCount;
        });
    }
}
