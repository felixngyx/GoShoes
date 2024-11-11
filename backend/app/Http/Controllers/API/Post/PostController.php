<?php

namespace App\Http\Controllers\API\Post;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Services\Post\PostService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class PostController extends Controller
{
    protected $postService;
    public function __construct(PostService $postService)
    {
        $this->postService = $postService;
        // $this->middleware('auth'); 
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $posts = $this->postService->getAllPosts();

            if ($posts->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Không có bài viết nào.',
                    'posts' => []
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Lấy danh sách bài viết thành công.',
                'posts' => $posts
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể lấy danh sách bài viết.',
                'error' => $e->getMessage()
            ], 500);
        }
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
    public function store(StorePostRequest $request)
    {
        $data = $request->validated();
        if (!auth()->check()) {
            return response()->json([
                'success' => false,
                'message' => 'Người dùng chưa đăng nhập.',
            ], 401);
        }
        $data['author_id'] = Auth::id();
        Log::info($data);
        try {


            $post = $this->postService->createPost($data);
            return response()->json([
                'success' => true,
                'message' => 'Bài viết đã được tạo thành công.',
                'data' => $post
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể tạo bài viết.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $post = $this->postService->getPostById($id);
            if ($post) {
                return response()->json([
                    'success' => true,
                    'post' => $post
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy bài viết.'
                ], 404);
            }
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể lấy bài viết.',
                'error' => $e->getMessage()
            ], 500);
        }
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
    public function update(UpdatePostRequest  $request, string $id)
    {
        $data = $request->validated();

        $post = $this->postService->updatePost($id, $data);

        if ($post) {
            return response()->json([
                'success' => true,
                'message' => 'Cập nhật bài viết thành công.',
                'data' => $post,
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy bài viết hoặc cập nhật thất bại.',
            ], 404);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $result = $this->postService->deletePost($id);

            if ($result) {
                return response()->json([
                    'success' => true,
                    'message' => 'Bài viết đã được xóa thành công.'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy bài viết.',
                ], 404);
            }
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa bài viết.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function destroyMultiple(Request $request)
    {
        $ids = $request->input('ids');
        $result = $this->postService->deleteMultiplePosts($ids);
        return response()->json([
            'success' => true,
            'message' => count($ids) . ' bài viết đã được xóa thành công.'
        ]);
    }
}
