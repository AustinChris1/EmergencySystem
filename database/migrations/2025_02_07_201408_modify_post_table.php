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
            $table->dropColumn(['image', 'slug']); // Remove columns
            $table->string('device_id')->after('user_id'); // Add device_id column
            $table->string('longitude')->after('user_id');
            $table->string('latitude')->after('user_id');
            $table->string('current_location')->after('user_id');
            $table->string('status')->default('0')->change(); // Set default value to "0"
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('post', function (Blueprint $table) {
            $table->string('image')->nullable(); // Restore image column
            $table->string('slug')->unique(); // Restore slug column
            $table->dropColumn('device_id'); // Remove device_id column
            $table->string('status')->change(); // Remove default value (not fully reversible)
        });
    }
};
