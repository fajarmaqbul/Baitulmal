<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrganizationStructure extends Model
{
    use HasFactory;

    protected $table = 'organization_structures';

    protected $fillable = [
        'parent_id',
        'kode_struktur',
        'nama_struktur',
        'tipe',
        'tanggal_mulai',
        'tanggal_selesai',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    public function assignments()
    {
        return $this->hasMany(Assignment::class, 'structure_id');
    }
}
