<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        if (!auth()->user()->is_admin) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied'
            ], 403);
        }

        $perPage = $request->get('per_page', 10);
        $notifications = Notification::with(['order:id,sku', 'user:id,name,email'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => [
                'current_page' => $notifications->currentPage(),
                'data' => $notifications->items(),
                'total' => $notifications->total(),
                'per_page' => $notifications->perPage(),
                'last_page' => $notifications->lastPage()
            ]
        ]);
    }

    public function markAsRead($id)
    {
        if (!auth()->user()->is_admin) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied'
            ], 403);
        }

        $notification = Notification::findOrFail($id);
        $notification->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Marked as read'
        ]);
    }

    public function markAllAsRead()
    {
        if (!auth()->user()->is_admin) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied'
            ], 403);
        }

        Notification::where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read'
        ]);
    }

    public function getUnreadCount()
    {
        if (!auth()->user()->is_admin) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied'
            ], 403);
        }

        $count = Notification::where('is_read', false)->count();

        return response()->json([
            'success' => true,
            'count' => $count
        ]);
    }

    public function destroy($id)
    {
        if (!auth()->user()->is_admin) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied'
            ], 403);
        }

        $notification = Notification::findOrFail($id);
        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notification deleted'
        ]);
    }
}
