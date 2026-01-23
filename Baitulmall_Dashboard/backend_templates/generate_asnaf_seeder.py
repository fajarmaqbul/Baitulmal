import re
import json

# Read the JSX file
with open('src/context/BaitulmallContext.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract all asnaf entries using regex
pattern = r"\{\s*id:\s*(\d+),\s*rt:\s*'(\d+)',\s*kategori:\s*'(\w+)',\s*nama:\s*'([^']+)',\s*jumlahJiwa:\s*(\d+),\s*tahun:\s*'(\d+)'\s*\}"

matches = re.findall(pattern, content, re.MULTILINE)

print(f"Found {len(matches)} Asnaf entries")

# RT mapping (kode -> database id)
rt_map = {'01': 1, '02': 2, '03': 3, '04': 4, '05': 5, '06': 6, '07': 7}

# Generate PHP seeder
php_code = f'''<?php

namespace Database\\Seeders;

use App\\Models\\Asnaf;
use App\\Models\\RT;
use Illuminate\\Database\\Seeder;

class AsnafSeeder extends Seeder
{{
    /**
     * Run the database seeds.
     * 
     * Data migrated from React MVP localStorage
     * Total: {len(matches)} Asnaf entries from Desa Kandri RW 01
     */
    public function run(): void
    {{
        // Get RT IDs for foreign key mapping
        $rtMap = RT::pluck('id', 'kode')->toArray();

        $asnafData = [
'''

for match in matches:
    id_val, rt, kategori, nama, jiwa, tahun = match
    # Escape single quotes in names
    nama = nama.replace("'", "\\'")
    rt_var = f"$rtMap['{rt}']"
    
    php_code += f"            ['rt_id' => {rt_var}, 'nama' => '{nama}', 'kategori' => '{kategori}', 'jumlah_jiwa' => {jiwa}, 'tahun' => {tahun}, 'status' => 'active'],\n"

php_code += '''        ];

        foreach ($asnafData as $asnaf) {
            Asnaf::create($asnaf);
        }

        $this->command->info('✅ Successfully seeded ' . count($asnafData) . ' Asnaf entries');
        
        // Show statistics
        $stats = Asnaf::selectRaw('kategori, COUNT(*) as count, SUM(jumlah_jiwa) as total_jiwa')
            ->groupBy('kategori')
            ->get();
            
        $this->command->info('📊 Breakdown by kategori:');
        foreach ($stats as $stat) {
            $this->command->info("   {$stat->kategori}: {$stat->count} KK, {$stat->total_jiwa} jiwa");
        }
    }
}
'''

# Write to file
with open('../Baitulmall_API/database/seeders/AsnafSeeder.php', 'w', encoding='utf-8') as f:
    f.write(php_code)

print(f"✅ AsnafSeeder.php created with {len(matches)} entries")
print("Ready to run: php artisan db:seed --class=AsnafSeeder")
