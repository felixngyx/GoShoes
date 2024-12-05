<?php

namespace App\Http\Controllers\API\Contact;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Notification;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $contacts = Contact::select('id', 'full_name', 'email', 'subject', 'message')->get();
        if (!$contacts) {
            return response()->json([
                'success' => false,
                'message' => 'Không có liên hệ nào '
            ], 404);
        }
        return response()->json([
            'success' => true,
            'message' => 'Danh sách liên hệ',
            'data' => $contacts
        ], 200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            // Validate input
            $validated = $request->validate([
                'full_name' => 'required|string|max:255',
                'email' => 'required|email',
                'subject' => 'required|string|max:255',
                'message' => 'required|string',
            ]);

            // Kiểm tra spam
            $emailCount = Contact::where('email', $request->email)
                ->where('created_at', '>=', Carbon::now()->subHours(24))
                ->count();

            if ($emailCount >= 3) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are suspected of spam. Please try again after 24 hours.'
                ], 429);
            }

            // Tạo contact mới
            $contact = Contact::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Your message has been sent!',
                'data' => $contact
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred. Please try again.'
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // Tìm liên hệ theo ID
        $contact = Contact::find($id);

        // Kiểm tra nếu không tìm thấy liên hệ
        if (!$contact) {
            return response()->json([
                'success' => false,
                'message' => 'Contact not found'
            ], 404);
        }

        // Trả về dữ liệu liên hệ
        return response()->json([
            'success' => true,
            'message' => 'Contact details',
            'data' => $contact
        ], 200);
    }


    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $contact = Contact::find($id);
        if (!$contact) {
            return response()->json([
                'success' => false,
                'message' => 'Contact not found'
            ], 404);
        }
        $contact->delete();
    }
}
