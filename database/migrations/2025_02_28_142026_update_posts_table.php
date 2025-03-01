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
            $table->dropColumn(['current_location', 'user_id']); // Remove columns
            $table->renameColumn('title', 'alertType'); // Rename title to alertType
            $table->renameColumn('device_id', 'UID'); // Rename device_id to UID
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('post', function (Blueprint $table) {
            $table->string('current_location')->nullable(); // Re-add current_location
            $table->unsignedBigInteger('user_id')->nullable(); // Re-add user_id
            $table->renameColumn('alertType', 'title'); // Revert alertType to title
            $table->renameColumn('UID', 'device_id'); // Revert UID to device_id
        });
    }
};
