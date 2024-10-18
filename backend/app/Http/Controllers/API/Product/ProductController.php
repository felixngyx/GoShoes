<?php

namespace App\Http\Controllers\APi\Product;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(){

    }

    
    public function store(Request $request)
    {
        // Validate request input
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric',
            'stock_quantity' => 'required|integer|min:1',
            'promotional_price' => 'nullable|numeric|min:0',
            'status' => 'required|in:public,unpublic,hidden',
            'sku' => 'required|string|unique:products,sku',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'hagtag' => 'nullable|string',
            'category_ids' => 'required|', // Array of category IDs
            'category_ids.*' => 'exists:categories,id',
            'variants' => 'required|array',
            'variants.*.color_id' => 'required|exists:variant_colors,id',
            'variants.*.size_id' => 'required|exists:variant_sizes,id',
            'variants.*.quantity' => 'required|integer|min:1',
            'variants.*.image_variant' => 'required|image|mimes:jpeg,png,jpg', // Image validation
            'images' => 'sometimes|array', // Optional product images
            'images.*' => 'image|mimes:jpeg,png,jpg' // Image validation
        ]);

        $thumbnailPath = null;
        if ($request->hasFile('thumbnail')) {
            $thumbnail = $request->file('thumbnail');
            $thumbnailName = time() . '_' . $thumbnail->getClientOriginalName();
            $thumbnailPath = $thumbnail->storeAs('products', $thumbnailName, 'public');
        }

        // Create product
        $product = Product::create([
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'stock_quantity' => $request->stock_quantity,
            'promotional_price' => $request->promotional_price,
            'status' => $request->status,
            'sku' => Str::uuid(), // Generate unique SKU
            'thumbnail' => $thumbnailPath,
            'hagtag' => $request->hagtag,
        ]);

        // Gán danh mục cho sản phẩm
        $product->categories()->sync($request->category_ids);

        // Save product variants
        foreach ($request->variants as $key => $variantData) {
            // Handle image for variant
            if ($request->hasFile("variants.$key.image_variant")) {
                $imagePath = $request->file("variants.$key.image_variant")->store('product_variants', 'public');
            } else {
                $imagePath = null; // Handle case where image is not provided
            }
        
            // Create product variant
            ProductVariant::create([
                'product_id' => $product->id,
                'color_id' => $variantData['color_id'],
                'size_id' => $variantData['size_id'],
                'quantity' => $variantData['quantity'],
                'image_variant' => $imagePath, // Ensure this line is uncommented
            ]);
        }

        // Save product images (if provided)
        if ($request->has('images')) {
            foreach ($request->file('images') as $image) {
                $imagePath = $image->store('product_images', 'public');

                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $imagePath,
                ]);
            }
        }

        // Return success response
        return response()->json([
            'message' => 'Sản phẩm đã được thêm thành công!',
            'product' => $product
        ], 201);
    }
}
