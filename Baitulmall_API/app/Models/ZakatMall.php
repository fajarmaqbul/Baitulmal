<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\RT;

class ZakatMall extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'zakat_malls';

    protected $fillable = [
        'rt_id',
        'nama_muzaki',
        'kategori',
        'jumlah',
        'keterangan',
        'tanggal'
    ];

    public function rt()
    {
        return $this->belongsTo(RT::class, 'rt_id');
    }
}
