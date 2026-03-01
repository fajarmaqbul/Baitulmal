<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$people = \App\Models\Person::where('nama_lengkap', 'like', '%Idi%')->get();
foreach ($people as $p) {
    echo "Person ID: {$p->id} Name: {$p->nama_lengkap}\n";
    foreach ($p->assignments as $a) {
        echo "  Assignment ID: {$a->id} Job: {$a->jabatan}\n";
    }
}
