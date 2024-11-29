<?php

namespace App\Http\Controllers\API\Contact;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Notification;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $contacts = Contact::select('id', 'full_name', 'email', 'subject','message')->get();
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
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);
        $contact = Contact::create($validated);
        return response()->json([
            'success' => true,
            'message' => 'Tin nhắn của bạn đã được gửi!',
            'data' => $contact
        ], 201);
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
                'message' => 'Liên hệ không tồn tại'
            ], 404);
        }

        // Trả về dữ liệu liên hệ
        return response()->json([
            'success' => true,
            'message' => 'Chi tiết liên hệ',
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
                'message' => 'Liên hệ không tồn tại'
            ], 404);
        }
        $contact->delete();
    }
}
