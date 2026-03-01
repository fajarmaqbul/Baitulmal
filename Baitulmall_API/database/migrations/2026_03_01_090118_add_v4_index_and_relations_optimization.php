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
        // Muzaki optimizations
        Schema::table('muzaki', function (Blueprint $table) {
            $table->index(['tahun', 'rt_id']);
            $table->index('status_bayar');
        });

        // Other distributions and transactions
        Schema::table('distribusi', function (Blueprint $table) {
            $table->index(['tahun', 'status']);
        });

        Schema::table('sedekah', function (Blueprint $table) {
            $table->index(['tanggal', 'tipe']);
        });

        // Search optimization for people
        Schema::table('people', function (Blueprint $table) {
            $table->index('nama_lengkap');
            $table->index('rt_id');
        });

        // Clean up or fix any potential issues from previous migrations
        // Ensure standard foreign key indexes exist
        if (Schema::hasTable('assignments')) {
            Schema::table('assignments', function (Blueprint $table) {
                // person_id and structure_id are often missing explicit indexes in rapid dev
                $table->index('person_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('muzaki', function (Blueprint $table) {
            $table->dropIndex(['tahun', 'rt_id']);
            $table->dropIndex(['status_bayar']);
        });

        Schema::table('distribusi', function (Blueprint $table) {
            $table->dropIndex(['tahun', 'status']);
        });

        Schema::table('sedekah', function (Blueprint $table) {
            $table->dropIndex(['tanggal', 'tipe']);
        });

        Schema::table('people', function (Blueprint $table) {
            $table->dropIndex(['nama_lengkap']);
            $table->dropIndex(['rt_id']);
        });

        if (Schema::hasTable('assignments')) {
            Schema::table('assignments', function (Blueprint $table) {
                $table->dropIndex(['person_id']);
            });
        }
    }
};
