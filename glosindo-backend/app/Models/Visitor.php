<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;

class Visitor extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'phone',
        'email',
        'company',
        'position',
        'photo',
    ];

    /**
     * Boot the model to handle cascading cleanup.
     */
    protected static function booted()
    {
        static::deleting(function ($visitor) {
            FaceEmbedding::where('visitor_id', $visitor->id)->delete();
            Cache::forget('face_embeddings_all');
        });
    }

    /**
     * Get the face embedding for the visitor.
     */
    public function faceEmbedding()
    {
        return $this->hasOne(FaceEmbedding::class);
    }

    /**
     * Get all visits for the visitor.
     */
    public function visits()
    {
        return $this->hasMany(Visit::class);
    }

    /**
     * Get all event participant records for the visitor.
     */
    public function eventParticipants()
    {
        return $this->hasMany(EventParticipant::class);
    }

    /**
     * Scope a query to only include regular visitors.
     */
    public function scopeRegular($query)
    {
        return $query->whereDoesntHave('visits', function ($q) {
            $q->whereNotNull('event_id');
        })->whereDoesntHave('eventParticipants');
    }

    /**
     * Scope a query to only include event participants.
     */
    public function scopeEventParticipants($query)
    {
        return $query->whereHas('visits', function ($q) {
            $q->whereNotNull('event_id');
        })->orWhereHas('eventParticipants');
    }

    /**
     * Scope a query to search visitors.
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('phone', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhere('company', 'like', "%{$search}%");
        });
    }

    /**
     * Get all reservations for the visitor.
     */
    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    /**
     * Get the latest visit for the visitor.
     */
    public function latestVisit()
    {
        return $this->hasOne(Visit::class)->latestOfMany();
    }
}
