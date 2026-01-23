<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Asnaf extends Model
{
    use SoftDeletes;

    protected $table = 'asnaf';

    protected $fillable = [
        'rt_id',
        'nama',
        'kategori',
        'jumlah_jiwa',
        'tahun',
        'latitude',
        'longitude',
        'alamat',
        'status',
    ];

    protected $casts = [
        'jumlah_jiwa' => 'integer',
        'tahun' => 'integer',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    /**
     * Get the RT that owns this Asnaf
     */
    public function rt(): BelongsTo
    {
        return $this->belongsTo(RT::class, 'rt_id');
    }

    /**
     * Get all distributions for this Asnaf
     */
    public function distribusi(): HasMany
    {
        return $this->hasMany(Distribusi::class, 'asnaf_id');
    }

    /**
     * Scope: Filter by kategori
     */
    public function scopeByKategori(Builder $query, string $kategori): Builder
    {
        return $query->where('kategori', $kategori);
    }

    /**
     * Scope: Filter by tahun
     */
    public function scopeByTahun(Builder $query, int $tahun): Builder
    {
        return $query->where('tahun', $tahun);
    }

    /**
     * Scope: Filter by RT
     */
    public function scopeByRT(Builder $query, int $rtId): Builder
    {
        return $query->where('rt_id', $rtId);
    }

    /**
     * Scope: Only active Asnaf
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope: Get Asnaf with coordinates for map
     */
    public function scopeWithCoordinates(Builder $query): Builder
    {
        return $query->whereNotNull('latitude')
                     ->whereNotNull('longitude');
    }
}
