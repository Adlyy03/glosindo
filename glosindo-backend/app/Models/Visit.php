<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Visit extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'visitor_id',
        'receptionist_id',
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
}
