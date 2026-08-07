<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Visitor extends Model
{
    use HasFactory;

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
        'photo',
    ];

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
     * Get the latest visit for the visitor.
     */
    public function latestVisit()
    {
        return $this->hasOne(Visit::class)->latestOfMany();
    }

    /**
     * Get active visit (status IN) for the visitor.
     */
    public function activeVisit()
    {
        return $this->hasOne(Visit::class)->where('status', 'IN');
    }
}
