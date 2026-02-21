<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    use HasFactory;

    protected $table = 'assignments';

    protected $fillable = [
        'person_id',
        'structure_id',
        'jabatan',
        'tipe_sk',
        'no_sk',
        'tanggal_mulai',
        'tanggal_selesai',
        'status',
        'kewenangan', // JSON Cast
        'keterangan'
    ];

    protected $casts = [
        'kewenangan' => 'array'
    ];

    public function person()
    {
        return $this->belongsTo(Person::class);
    }

    public function structure()
    {
        return $this->belongsTo(OrganizationStructure::class, 'structure_id');
    }

    public function agenda()
    {
        return $this->belongsTo(AgendaPost::class, 'agenda_id');
    }
}
