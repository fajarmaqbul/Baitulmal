<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$id = 26;
$person = \App\Models\Person::withTrashed()->find($id);
if ($person) {
    echo "Person Found! ID: {$person->id}, Name: {$person->nama_lengkap}, Deleted: " . ($person->trashed() ? 'Yes' : 'No') . "\n";
} else {
    echo "Person NOT FOUND even in trash.\n";
}

$assignment = \App\Models\Assignment::find($id);
if ($assignment) {
    echo "Assignment ID {$id} exists. Pointing to Person ID: " . $assignment->person_id . "\n";
}
