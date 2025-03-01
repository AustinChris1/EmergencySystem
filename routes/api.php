<?php

use App\Http\Controllers\MembersController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\PostController;

Route::post('/save', [PostController::class, 'store']);
Route::get('/all', [PostController::class, 'allAlerts']);
Route::get('/index/{id}', [PostController::class, 'index']);
Route::post('/status/{id}', [PostController::class, 'changeStatus']);
Route::get('/search', [PostController::class, 'search']);


Route::post('/add', [MembersController::class, 'save']);