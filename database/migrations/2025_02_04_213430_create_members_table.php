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
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable(); // Use 'middle_name' instead of 'surname'
            $table->date('date_of_birth'); // Correct column name and type
            $table->string('device_uid')->unique(); // Assuming device UID should be unique
            $table->decimal('longitude', 10, 7); // Storing coordinates with precision
            $table->decimal('latitude', 10, 7);
            $table->string('current_location')->nullable();
            $table->boolean('status')->default(0);
            $table->string('image')->nullable(); // Nullable in case the member doesn't have an image
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
