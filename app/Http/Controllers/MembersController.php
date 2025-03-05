<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Members;

class MembersController extends Controller
{
    public function save(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'phone' => 'required|string|max:255',
            'email' => 'required|email|unique:members,email',
            'date_of_birth' => 'required|date',
            'device_uid' => 'required|string|max:255|unique:members,device_uid',
            'current_location' => 'nullable|string|max:255',
            'status' => 'nullable|in:0,1',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048', // Validate image
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 422,
                'errors' => $validator->errors(),
            ], 422);
        }

        $member = Members::create([
            'first_name' => trim($request->input('first_name')),
            'last_name' => trim($request->input('last_name')),
            'middle_name' => trim($request->input('middle_name')),
            'phone' => $request->input('phone'),
            'email' => $request->input('email'),
            'date_of_birth' => $request->input('date_of_birth'),
            'device_uid' => $request->input('device_uid'),
            'current_location' => trim($request->input('current_location')),
            'status' => $request->input('status', 0),
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '.' . $image->getClientOriginalExtension();
            $imagePath = 'uploads/members'; // Correct destination path here
            $image->move($imagePath, $imageName);
            $imageName = $imagePath . "/" . $imageName; // Correct path reference here
            $member->image = $imageName;

            $member->save();
        }

        return response()->json([
            'message' => 'User added successfully',
            'member' => $member,
            'status' => 200,
        ], 200);
    }
}
