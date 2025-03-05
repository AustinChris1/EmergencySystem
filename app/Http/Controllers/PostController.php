<?php

namespace App\Http\Controllers;

use App\Models\Members;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Post;

class PostController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'alertType' => 'required|string|max:255',
            'content' => 'nullable|string',
            'UID' => 'required|exists:members,device_uid', // Ensure user exists
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 422,
                'errors' => $validator->messages(),
            ], 422);
        }

        $post = new Post();
        $post->alertType = trim($request->input('alertType'));
        $post->content = "Incoming Emergency Alert";
        $post->status = $request->input('status', 0);
        $post->longitude = $request->input('longitude');
        $post->latitude = $request->input('latitude');
        $post->UID = $request->input('UID');
        $post->save();

        return response()->json([
            'message' => 'Alert created successfully',
            'post' => $post,
            'status' => 200,
        ], 200);
    }

    public function allAlerts()
    {
        $alerts = Post::orderBy('created_at', 'desc')->get();

        $user = Members::all();
        if ($user) {
            return response()->json([
                'status' => 200,
                'alerts' => $alerts,
                'message' => 'Successfully fetched',
                'user' => $user,
            ]);
        } else {
            return response()->json([
                'status' => 404,
                'alerts' => $alerts,
                'user' => $user,
                'message' => 'Failed to fetch!'
            ]);
        }
    }

    public function index($id)
    {
        $user = Members::where('id', $id)->where('status', 0)->first();

        if (!$user) {
            return response()->json([
                'status' => 404,
                'message' => 'User does not exist!',
            ]);
        }

        $alert = Post::where('status', '0')->where('UID', $user->device_uid)->orderBy('created_at', 'desc')->first(); // Fetch only the last row

        if (!$alert) {
            return response()->json([
                'status' => 404,
                'alert' => null,
                'message' => 'Failed to fetch!',
                'user' => $user,
            ]);
        }

        return response()->json([
            'status' => 200,
            'alert' => $alert,
            'message' => 'Successfully fetched',
            'user' => $user,
        ]);
    }

    public function changeStatus($id)
    {
        $alert = Post::where('id', $id)->first();
        if (!$alert) {
            return response()->json([
                'status' => 404,
                'message' => 'Alert does not exist!',
            ]);
        }
        $alert->status = '1';
        $alert->save();
        return response()->json([
            'status' => 200,
            'message' => 'Alert status changed successfully!',
            'alert' => $alert,
        ]);
    }

    public function search(Request $request)
    {
        $searchTerm = $request->query('query');

        if ($searchTerm) {
            // Search for alerts where the name or description contains the search term
            $alerts = Post::where('alertType', 'LIKE', "%{$searchTerm}%")
                ->orWhere('UID', 'LIKE', "%{$searchTerm}%")
                ->get();

            // Check if any alerts were found
            if ($alerts->isNotEmpty()) {
                // Retrieve users for each Post by mapping the Post IDs to their category
                $users = Members::whereIn('device_uid', $alerts->pluck('UID'))
                    ->where('status', '0')
                    ->get();

                return response()->json([
                    'status' => 200,
                    'alerts' => $alerts,
                    'users' => $users
                ]);
            }

            // If no alerts are found, return a 404 response
            return response()->json([
                'status' => 404,
                'alerts' => [],
                'message' => 'No alerts found'
            ]);
        }

        // If no search term was provided, return an empty result
        return response()->json([
            'status' => 404,
            'alerts' => [],
            'message' => 'No search term provided'
        ]);
    }
}
