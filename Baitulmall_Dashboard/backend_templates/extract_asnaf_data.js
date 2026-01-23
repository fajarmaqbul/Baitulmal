const fs = require('fs');

// Read the React context file
const contextFile = fs.readFileSync('../src/context/BaitulmallContext.jsx', 'utf8');

// Extract the asnafData array using regex
const match = contextFile.match(/const \[asnafData[\s\S]*?return saved \? JSON\.parse\(saved\) : \[([\s\S]*?)\];/);

if (!match) {
    console.error('Could not find asnafData array');
    process.exit(1);
}

const arrayContent = match[1];

// Parse the entries
const entries = [];
const entryRegex = /\{\s*id:\s*(\d+),\s*rt:\s*'(\d+)',\s*kategori:\s*'(\w+)',\s*nama:\s*'([^']+)',\s*jumlahJiwa:\s*(\d+),\s*tahun:\s*'(\d+)'\s*\}/g;

let entryMatch;
while ((entryMatch = entryRegex.exec(arrayContent)) !== null) {
    entries.push({
        id: parseInt(entryMatch[1]),
        rt: entryMatch[2],
        kategori: entryMatch[3],
        nama: entryMatch[4],
        jumlahJiwa: parseInt(entryMatch[5]),
        tahun: parseInt(entryMatch[6])
    });
}

console.log(`Extracted ${entries.length} Asnaf entries`);

// Generate PHP seeder code
let php Code = `<?php

namespace Database\\Seeders;

use App\\Models\\Asnaf;
use App\\Models\\RT;
use Illuminate\\Database\\Seeder;

class AsnafSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Data migrated from React MVP (localStorage)
     * Total: ${entries.length} Asnaf entries from Desa Kandri RW 01
     */
    public function run(): void
    {
        // Get RT IDs for foreign key mapping
        $rtMap = RT::pluck('id', 'kode')->toArray();

        $asnafData = [
`;

entries.forEach(entry => {
    const rtVar = `$rtMap['${entry.rt}']`;
    phpCode += `            [\n`;
    phpCode += `                'rt_id' => ${rtVar},\n`;
    phpCode += `                'nama' => '${entry.nama.replace(/'/g, "\\'")}',\n`;
    phpCode += `                'kategori' => '${entry.kategori}',\n`;
    phpCode += `                'jumlah_jiwa' => ${entry.jumlahJiwa},\n`;
    phpCode += `                'tahun' => ${entry.tahun},\n`;
    phpCode += `                'status' => 'active',\n`;
    phpCode += `            ],\n`;
});

phpCode += `        ];

        foreach ($asnafData as $asnaf) {
            Asnaf::create($asnaf);
        }

        $this->command->info('✅ Successfully seeded ${entries.length} Asnaf entries');
        $this->command->info('📊 Breakdown by kategori:');
        
        $stats = Asnaf::selectRaw('kategori, COUNT(*) as count, SUM(jumlah_jiwa) as total_jiwa')
            ->groupBy('kategori')
            ->get();
            
        foreach ($stats as $stat) {
            $this->command->info("   {$stat->kategori}: {$stat->count} KK, {$stat->total_jiwa} jiwa");
        }
    }
}
`;

// Write the seeder file
fs.writeFileSync('../../Baitulmall_API/database/seeders/AsnafSeeder.php', phpCode);
console.log('✅ AsnafSeeder.php created successfully');
console.log(`📝 File written to: ../../Baitulmall_API/database/seeders/AsnafSeeder.php`);
