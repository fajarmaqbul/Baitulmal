<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RT extends Model
{
    protected $table = 'rts';

    protected $fillable = [
        'kode',
        'rw',
        'ketua',
        'latitude',
        'longitude',
        'polygon',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    /**
     * Get all Asnaf in this RT
     */
    public function asnaf(): HasMany
    {
        return $this->hasMany(Asnaf::class, 'rt_id');
    }

    /**
     * Get all Muzaki in this RT
     */
    public function muzaki(): HasMany
    {
        return $this->hasMany(Muzaki::class, 'rt_id');
    }

    /**
     * Get all Zakat Fit rah transactions in this RT
     */
    public function zakatFitrah(): HasMany
    {
        return $this->hasMany(ZakatFitrah::class, 'rt_id');
    }

    /**
     * Get polygon as GeoJSON
     */
    public function getPolygonGeoJsonAttribute(): ?array
    {
        if (!$this->polygon) {
            return null;
        }

        // Convert geometry to GeoJSON format
        // This assumes polygon is stored as WKT or geometry type
        return json_decode($this->polygon, true);
    }
}
