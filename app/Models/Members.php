<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Members extends Model
{
    use HasFactory;

    protected $table = 'members';

    protected $fillable = [
        'first_name',
        'last_name',
        'phone',
        'email',
        'middle_name',
        'date_of_birth',
        'device_uid',
        'longitude',
        'latitude',
        'current_location',
        'status',
    ];

    // Cast attributes to correct data types
    protected $casts = [
        'date_of_birth' => 'date',
        'longitude' => 'float',
        'latitude' => 'float',
        'status' => 'boolean',
    ];
}
