<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Now that we have doctrine/dbal, we can use change() even on SQLite usually.
        // However, changing an ENUM to include more values is still semantic.
        // If it fails again, we revert to the drop/create strategy but letting dbal handle specifics if possible.
        
        // Actually, dbal 4.x has some changes? Let's check if simple change works.
        Schema::table('santunan', function (Blueprint $table) {
             $table->enum('kategori', ['yatim', 'dhuafa', 'kematian'])->default('yatim')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
         Schema::table('santunan', function (Blueprint $table) {
            $table->enum('kategori', ['yatim', 'dhuafa'])->default('yatim')->change();
        });
    }
};
