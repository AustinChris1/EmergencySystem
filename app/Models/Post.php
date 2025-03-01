<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Post extends Model
{
    //

    use HasFactory;

    protected $table = 'post';
    protected $fillable = [
        'title',
        'content',
        'user_id',
        'longitude',
        'latitude',
        'current_location',
        'device_id',
        'status',
        
    ];
}
