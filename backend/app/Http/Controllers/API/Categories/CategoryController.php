<?php

namespace App\Http\Controllers\API\Categories;

use App\Http\Controllers\Controller;
use App\Http\Requests\Category\CategoryRequest;
use App\Models\Category;
use App\Repositories\RepositoryInterfaces\CategoryRepositoryInterface;
use App\Services\ServiceInterfaces\Category\CategoryServiceInterface;
use Doctrine\DBAL\Driver\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Str;   

class CategoryController extends Controller
{
    protected $categoryService;

    public function __construct(CategoryServiceInterface $categoryService)
    {
        $this->categoryService = $categoryService;
    }

    public function index(Request $request)
    {
        $page = $request->input('page', 1);
        $limit = $request->input('limit', null);
        $orderBy = $request->input('orderBy', 'id');
        $order = $request->input('order', 'asc');
    
        // Sử dụng withCount để lấy số lượng sản phẩm
        $categories = Category::select('id', 'name')
                              ->withCount('products') // Thêm số lượng sản phẩm
                              ->orderBy($orderBy, $order)
                              ->paginate($limit, ['*'], 'page', $page);
    
        return response()->json([
            'message' => 'Danh sách danh mục',
            'categories' => $categories
        ], 200); // Đổi từ 201 sang 200 nếu không có tạo mới
    }

    public function show($id)
{
    $category = $this->categoryService->getCategoryById($id);
    if (!$category) {
        return response()->json(['message' => 'Category not found'], 404);
    }

    $result = [
        'id' => $category->id,
        'name' => $category->name
    ];

    return response()->json([
        'message' => 'Category detail',
        'category' => $result
    ], 200);
}

    public function store(CategoryRequest $request)
    {
        $category = $this->categoryService->createCategory($request->all());
        return response()->json($category, 201);
    }

    public function update(CategoryRequest $request, $id)
    {
        $category = $this->categoryService->updateCategory($request->all(), $id);
        return response()->json($category, 200);
    }

    public function destroy($id)
    {
        $this->categoryService->deleteCategory($id);
        return response()->json(['message' => 'Category deleted'], 200);
    }
}
