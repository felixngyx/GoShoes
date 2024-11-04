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
        // return response()->json($this->categoryService->getAllCategories(), 200);
        $page = $request->input('page', 1);
        $limit = $request->input('limit', 9);
        $orderBy = $request->input('orderBy', 'id');
        $order = $request->input('order', 'asc');
        $query = Category::select('id', 'name'); // Chỉ lấy trường id và name
        $category = $query->orderBy($orderBy, $order)
                          ->paginate($limit, ['*'], 'page', $page);
        return response()->json([
            'message' => 'Danh sách danh mục',
            'category' => $category
        ], 201);
    }

    public function show($id)
    {
        $category = $this->categoryService->getCategoryById($id);
        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }
        return response()->json($category, 200);
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
