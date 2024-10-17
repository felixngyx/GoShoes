<?php

namespace App\Http\Controllers\API\Categories;

use App\Http\Controllers\Controller;
use App\Repositories\RepositoryInterfaces\CategoryRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    protected $categoryRepository;

    public function __construct(CategoryRepositoryInterface $categoryRepository)
    {
        $this->categoryRepository = $categoryRepository;
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|integer',
            'description' => 'nullable|string',
            'slug' => 'string|max:255',
        ]);
    

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }
        $category = $this->categoryRepository->create($data);

        return response()->json([
            'message' => 'Category created successfully!',
            'data' => $category
        ], 201);
    }
 
    public function index()
    {
        $categories = $this->categoryRepository->all();

        return response()->json([
            'data' => $categories
        ], 200);
    }

    public function show($id)
    {
        $category = $this->categoryRepository->findById($id);

        if (!$category) {
            return response()->json([
                'message' => 'Category not found'
            ], 404);
        }

        return response()->json([
            'data' => $category
        ], 200);
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|integer',
            'description' => 'nullable|string',
            'slug' => 'string|max:255',
        ]);

        $category = $this->categoryRepository->update($data, $id);

        if (!$category) {
            return response()->json([
                'message' => 'Category not found'
            ], 404);
        }

        return response()->json([
            'message' => 'Category updated successfully!',
            'data' => $category
        ], 200);
    }

    public function destroy($id)
    {
        $category = $this->categoryRepository->delete($id);

        if (!$category) {
            
        }

        return response()->json([
            'message' => 'Category deleted successfully!'
        ], 200);
    }
}
