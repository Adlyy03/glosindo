<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FaceEmbedding extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'visitor_id',
        'face_vector',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'face_vector' => 'array',
    ];

    /**
     * Get the visitor that owns the face embedding.
     */
    public function visitor()
    {
        return $this->belongsTo(Visitor::class);
    }

    /**
     * Compute squared Euclidean distance with early exit optimization.
     * Comparing squared distances avoids calling sqrt() on every vector comparison.
     *
     * @param array|string $vecA 128-float array
     * @param array|string $vecB 128-float array
     * @param float $maxDistSq Early exit distance threshold squared
     * @return float Squared distance
     */
    public static function distanceSquared($vecA, $vecB, $maxDistSq = 999.0)
    {
        if (is_string($vecA)) {
            $vecA = json_decode($vecA, true);
        }
        if (is_string($vecB)) {
            $vecB = json_decode($vecB, true);
        }

        if (!is_array($vecA) || !is_array($vecB)) {
            return 999.0;
        }

        if (count($vecA) !== 128 || count($vecB) !== 128) {
            return 999.0;
        }

        $sum = 0.0;
        for ($i = 0; $i < 128; $i++) {
            $diff = (float)$vecA[$i] - (float)$vecB[$i];
            $sum += $diff * $diff;
            if ($sum >= $maxDistSq) {
                return $sum; // Early exit: exceeds threshold, stop calculating remaining dimensions
            }
        }

        return $sum;
    }
}
