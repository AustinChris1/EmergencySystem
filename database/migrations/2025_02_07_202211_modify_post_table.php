<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('post', function (Blueprint $table) {
            $table->string('longitude')->after('user_id');
            $table->string('latitude')->after('user_id');
            $table->string('current_location')->after('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('post', function (Blueprint $table) {
            $table->dropColumn('longitude'); // Remove longitude column
            $table->dropColumn('latitude'); // Remove latitude column
            $table->dropColumn('current_location'); // Remove current_location column
            });
    }
};
