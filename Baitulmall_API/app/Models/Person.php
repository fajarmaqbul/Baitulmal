<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Person extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'people';

    protected $fillable = [
        'user_id',
        'nik',
        'nama_lengkap',
        'panggilan',
        'tempat_lahir',
        'tanggal_lahir',
        'jenis_kelamin',
        'alamat_ktp',
        'alamat_domisili',
        'no_wa',
        'email',
        'foto_url',
        'status_hidup'
    ];

    public function assignments()
    {
        return $this->hasMany(Assignment::class);
    }
}
