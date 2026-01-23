<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\OrganizationStructure;
use App\Models\Person;
use App\Models\Assignment;

class SDMSeeder extends Seeder
{
    public function run()
    {
        // 1. Create Structures
        $struktur = OrganizationStructure::firstOrCreate(
            ['kode_struktur' => 'BAITULMALL_2023'],
            [
                'nama_struktur' => 'Pengurus Inti Baitulmall',
                'tipe' => 'Struktural',
                'tanggal_mulai' => '2023-01-01',
                'tanggal_selesai' => '2028-12-31',
                'is_active' => true
            ]
        );

        // 2. Create People & Assignments
        $members = [
            [
                'nama' => 'H. Sulaiman',
                'jabatan' => 'Ketua Umum',
                'no_wa' => '081234567890',
                'alamat' => 'Jl. Merpati No. 10',
                'status' => 'Aktif'
            ],
            [
                'nama' => 'Siti Aminah',
                'jabatan' => 'Bendahara',
                'no_wa' => '081345678901',
                'alamat' => 'Jl. Anggrek No. 12',
                'status' => 'Aktif'
            ],
            [
                'nama' => 'Rina Wati',
                'jabatan' => 'Sekretaris',
                'no_wa' => '081900000000',
                'alamat' => 'Jl. Mawar No. 3',
                'status' => 'Aktif'
            ]
        ];

        foreach ($members as $m) {
            $person = Person::firstOrCreate(
                ['nama_lengkap' => $m['nama']],
                [
                    'no_wa' => $m['no_wa'],
                    'alamat_domisili' => $m['alamat'],
                    'jenis_kelamin' => 'L'
                ]
            );

            Assignment::updateOrCreate(
                [
                    'person_id' => $person->id,
                    'structure_id' => $struktur->id,
                    'jabatan' => $m['jabatan']
                ],
                [
                    'tipe_sk' => 'SK Resmi',
                    'tanggal_mulai' => '2023-01-01',
                    'status' => $m['status']
                ]
            );
        }
    }
}
