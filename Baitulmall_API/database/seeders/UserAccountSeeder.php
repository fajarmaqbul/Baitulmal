<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Person;
use App\Models\Assignment;
use App\Models\OrganizationStructure;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserAccountSeeder extends Seeder
{
    public function run()
    {
        $this->command->info('Creating required user accounts...');

        // 1. Super Admin
        $admin = User::updateOrCreate(
            ['email' => 'admin@baitulmall.com'],
            [
                'name' => 'Admin Baitulmal',
                'password' => Hash::make('password123'),
            ]
        );
        $this->command->info('✅ Super Admin: admin@baitulmall.com / password123');

        // Ensure Structures Exist (from SDMSeeder logic)
        $baitulmall = OrganizationStructure::firstOrCreate(
            ['kode_struktur' => 'BAITULMALL_2023'],
            ['nama_struktur' => 'Pengurus Baitulmall', 'tipe' => 'Struktural', 'is_active' => true]
        );

        // 2. Bendahara (3 Orang)
        $bendaharas = [
            ['name' => 'Ahmad Bendahara', 'email' => 'bendahara1@baitulmall.com', 'jabatan' => 'Bendahara Umum'],
            ['name' => 'Siti Keuangan', 'email' => 'bendahara2@baitulmall.com', 'jabatan' => 'Bendahara Penerimaan'],
            ['name' => 'Budi Anggaran', 'email' => 'bendahara3@baitulmall.com', 'jabatan' => 'Bendahara Pengeluaran'],
        ];

        foreach ($bendaharas as $b) {
            $user = User::updateOrCreate(
                ['email' => $b['email']],
                [
                    'name' => $b['name'],
                    'password' => Hash::make('bendahara123'),
                ]
            );

            // Create Person linkage
            $person = Person::firstOrCreate(
                ['nama_lengkap' => $b['name']],
                ['jenis_kelamin' => 'L', 'alamat_domisili' => 'Kandri', 'no_wa' => '08123456789']
            );

            $person->user_id = $user->id;
            $person->save();

            // Create Assignment
            Assignment::updateOrCreate(
                [
                    'person_id' => $person->id,
                    'structure_id' => $baitulmall->id,
                    'jabatan' => $b['jabatan']
                ],
                [
                    'status' => 'Aktif',
                    'tanggal_mulai' => now(),
                    'tipe_sk' => 'SK Pengurus'
                ]
            );
        }
        $this->command->info('✅ 3 Bendahara created (password: bendahara123)');

        // 3. Koordinator RT (7 Orang)
        for ($i = 1; $i <= 7; $i++) {
            $rtCode = str_pad($i, 2, '0', STR_PAD_LEFT);
            $kodeStruktur = "RT_{$rtCode}_2023";
            
            $structure = OrganizationStructure::firstOrCreate(
                ['kode_struktur' => $kodeStruktur],
                [
                    'nama_struktur' => "Pengurus RT {$rtCode}",
                    'tipe' => 'Struktural',
                    'is_active' => true
                ]
            );

            $email = "rt{$rtCode}@baitulmall.com";
            $name = "Ketua RT {$rtCode}";

            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => Hash::make('rt123456'), 
                ]
            );

            $person = Person::firstOrCreate(
                ['nama_lengkap' => $name],
                ['jenis_kelamin' => 'L', 'alamat_domisili' => "RT {$rtCode} Kandri", 'no_wa' => '08123456789']
            );
            
            $person->user_id = $user->id;
            $person->save();

            Assignment::updateOrCreate(
                [
                    'person_id' => $person->id,
                    'structure_id' => $structure->id,
                    'jabatan' => 'Koordinator RT'
                ],
                [
                    'status' => 'Aktif',
                    'tanggal_mulai' => now(),
                    'tipe_sk' => 'SK RT'
                ]
            );
        }
        $this->command->info('✅ 7 Koordinator RT created (password: rt123456)');
    }
}
