<?php

namespace App\Repositories;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductImage;
use App\Repositories\RepositoryInterfaces\ProductRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProductRepository extends BaseRepository implements ProductRepositoryInterface
{


    public function __construct(
        Product $product
    )
    {
        parent::__construct($product);
    }

    public function listProduct(
        array $filters = [],
        int $page = 1,
        int $perPage = 10,
        string $orderBy = 'created_at',
        string $orderDirection = 'DESC'
    )
    {
        $query = $this->getBaseQuery($filters);

        // Get total items count
        $totalItems = count(DB::select($query));

        // Add order by clause
        $query .= " ORDER BY p." . $orderBy . " " . $orderDirection;

        // Add pagination
        if ($page && $perPage) {
            $offset = ($page - 1) * $perPage;
            $query .= " LIMIT $perPage OFFSET $offset";
        }

        $products = DB::select($query);

        // Get top 6 products with most sales
        $topProducts = Product::withSum('orderItems as total_revenue', DB::raw('price * quantity'))
            ->withSum('orderItems as total_quantity', 'quantity')
            ->join('order_items', 'products.id', '=', 'order_items.product_id')
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_revenue')
            ->take(6)
            ->get([
                'products.id',
                'products.name',
                'total_revenue',
                'total_quantity'
            ]);


        // Calculate total pages
        $totalPages = ceil($totalItems / $perPage);

        return [
            'products' => $products,
            'total_pages' => $totalPages,
            'current_page' => $page,
            'total_items' => $totalItems,
            'top_products' => $topProducts,
        ];
    }

    public function createProduct(array $data)
    {
        return Product::create($data);
    }

    public function syncCategories(Product $product, array $categoryIds)
    {
        $product->categories()->sync($categoryIds);
    }

    public function createProductVariant(array $variantData)
    {
        return ProductVariant::create($variantData);
    }

    public function createProductImage(array $imageData)
    {
        return ProductImage::create($imageData);
    }
    public function findProductForDeletion(string $id)
    {
        return Product::find($id);
    }
    public function findProductWithRelations(string $id)
    {
        $product = Product::where('is_deleted', false)
            ->with(['variants.color', 'variants.size', 'images', 'categories', 'brand'])
            ->find($id);

        if (!$product) {
            return null;
        }

        // Transform main product data
        $transformedProduct = [
            'id' => $product->id,
            'name' => $product->name,
            'description' => $product->description,
            'price' => (float) $product->price,
            'promotional_price' => (float) $product->promotional_price,
            'stock_quantity' => $product->stock_quantity,
            'sku' => $product->sku,
            'hagtag' => $product->hagtag,
            'brand_id' => $product->brand_id,
            // 'brand' => $product->brand->name,
            'rating_count' => $product->rating_count,
            'status' => $product->status,
            'thumbnail' => $product->thumbnail,
            'images' => $product->images->map(function ($image) {
                return [
                    'id' => $image->id,
                    'image_path' => $image->image_path
                ];
            }),
            'category_ids' => $product->categories->pluck('id')->toArray(),
            // 'categories' => $product->categories->map(function ($category) {
            //     return [
            //         'id' => $category->id,
            //         'name' => $category->name
            //     ];
            // }),
            'variants' => $product->variants->map(function ($variant) {
                return [
                    'variant_id' => $variant->id,
                    'size_id' => $variant->size_id,
                    'color_id' => $variant->color_id,
                    // 'size' => (int) $variant->size->size,
                    // 'color' => $variant->color->color,
                    'quantity' => $variant->quantity,
                    // 'image_variant' => $variant->image_variant
                ];
            })->toArray()
        ];

        // Get related products (assuming they're products in the same category)
        $relatedProducts = Product::whereHas('categories', function ($query) use ($product) {
            $query->whereIn('categories.id', $product->categories->pluck('id'));
        })
            ->where('id', '!=', $product->id)
            ->where('is_deleted', false)
            ->limit(8)
            ->get()
            ->map(function ($relatedProduct) {
                return [
                    'id' => $relatedProduct->id,
                    'name' => $relatedProduct->name,
                    'price' => (float) $relatedProduct->price,
                    'promotional_price' => (float) $relatedProduct->promotional_price,
                    'rating_count' => $relatedProduct->rating_count,
                    'stock_quantity' => $relatedProduct->stock_quantity,
                    'categories' => $relatedProduct->categories->pluck('name')->toArray(),
                    'status' => $relatedProduct->status,
                    'thumbnail' => $relatedProduct->thumbnail,
                    'images' => $relatedProduct->images->pluck('image_path')->toArray(),
                    'variants' => $relatedProduct->variants->map(function ($variant) {
                        return [
                            'size' => (int) $variant->size->size,
                            'color' => $variant->color->color,
                            'quantity' => $variant->quantity,
                            // 'image_variant' => $variant->image_variant
                        ];
                    })->toArray()
                ];
            });

        return [
            'product' => $transformedProduct,
            'relatedProducts' => $relatedProducts
        ];
    }
    public function findProductWithRelationsClient(string $id){
        $product = Product::where('is_deleted', false)
            ->with(['variants.color', 'variants.size', 'images', 'categories:id,name', 'brand'])
            ->find($id);

        if (!$product) {
            return null;
        }
        $relatedProducts = Product::whereHas('categories', function ($query) use ($product) {
            $query->whereIn('categories.id', $product->categories->pluck('id'));
        })
            ->where('id', '!=', $product->id)
            ->where('is_deleted', false)
            ->limit(8)

            ->get();


        return [
            'product' => $product,
            'relatedProducts' => $relatedProducts
        ];
    }

    public function softDeleteProduct(Product $product)
    {
        return $product->update(['is_deleted' => 1]);
    }
    public function restoreProduct(Product $product)
    {
        return $product->update(['is_deleted' => 0]);
    }

    public function find($id)
    {
        $results = $this->listProduct(['id' => $id]);
        return $results['products'][0] ?? null;
    }

    public function checkStockProductVariant($id)
    {
        return ProductVariant::find($id);

    }

    private function getBaseQuery($filters = [])
    {
        $query = "
                WITH distinct_variants AS (
                SELECT DISTINCT
                    pv.product_id,
                    pv.color_id,
                    pv.id AS product_variant_id,
                    pv.size_id,
                    vs.size,
                    pv.quantity,
                    vc.color,
                    iv.image
                FROM product_variants pv
                LEFT JOIN variant_colors vc ON pv.color_id = vc.id
                LEFT JOIN variant_sizes vs ON pv.size_id = vs.id
                LEFT JOIN image_variants iv ON pv.product_id = iv.product_id
                    AND pv.color_id = iv.color_id
            ),
            variant_info AS (
                SELECT
                    dv.product_id,
                    dv.color_id,
                    dv.color,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'product_variant_id', dv.product_variant_id,
                            'size_id', dv.size_id,
                            'size', dv.size,
                            'quantity', dv.quantity
                        )
                    ) AS sizes,
                    MAX(dv.image) AS image, -- Chọn 1 hình đại diện
                    SUM(dv.quantity) AS total_quantity
                FROM distinct_variants dv
                GROUP BY dv.product_id, dv.color_id, dv.color
            ),
            category_info AS (
                SELECT
                    pc.product_id,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'name', c.name,
                            'parent_id', c.parent_id,
                            'description', c.description,
                            'slug', c.slug,
                            'id', c.id
                        )
                    ) AS categories
                FROM product_category pc
                LEFT JOIN categories c ON pc.category_id = c.id
                GROUP BY pc.product_id
            )
            SELECT
                p.*,
                p.description,
                b.name AS brand_name,
                COALESCE(
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'color_id', vi.color_id,
                            'color', vi.color,
                            'sizes', vi.sizes,
                            'image', vi.image,
                            'total_quantity', vi.total_quantity
                        )
                    ),
                    JSON_ARRAY()
                ) AS variants,
                ci.categories
            FROM products p
            LEFT JOIN variant_info vi ON p.id = vi.product_id
            LEFT JOIN category_info ci ON p.id = ci.product_id
            LEFT JOIN brands b ON p.brand_id = b.id
            LEFT JOIN product_category pc ON p.id = pc.product_id
            WHERE 1 = 1
    ";

        // Thêm các điều kiện lọc
        if (!empty($filters['id'])) {
            $query .= " AND p.id = " . intval($filters['id']);
        }
        if (!empty($filters['brand_id'])) {
            $query .= " AND p.brand_id = " . intval($filters['brand_id']);
        }
        if (!empty($filters['name'])) {
            $query .= " AND p.name LIKE '%" . $filters['name'] . "%'";
        }
        if (!empty($filters['price_from'])) {
            $query .= " AND p.price >= " . floatval($filters['price_from']);
        }
        if (!empty($filters['price_to'])) {
            $query .= " AND p.price <= " . floatval($filters['price_to']);
        }
        if (isset($filters['status'])) {
            $query .= " AND p.status = '" . $filters['status'] . "'";
        }
        if (!empty($filters['category_id'])) {
            $query .= " AND pc.category_id = " . intval($filters['category_id']);
        }
        if (!empty($filters['color_id'])) {
            $query .= " AND vi.color_id = " . intval($filters['color_id']);
        }
        if (!empty($filters['size_id'])) {
            $query .= " AND JSON_CONTAINS(vi.sizes, JSON_OBJECT('size_id', " . intval($filters['size_id']) . "))";
        }
        if (!empty($filters['hagtag'])) {
            $query .= " AND p.hagtag LIKE '%" . $filters['hagtag'] . "%'";
        }
        if (!empty($filters['is_deleted'])) {
            $query .= " AND p.is_deleted = " . boolval($filters['is_deleted']);
        }

        $query .= " GROUP BY p.id, b.name, ci.categories";
        return $query;
    }

}

    // $variantDetails = $product->variants->map(function ($variant) {
        //     return [
        //         'id' => $variant->id,
        //         'quantity' => $variant->quantity,
        //         'image_variant' => $variant->image_variant, // Lấy ảnh biến thể
        //         'color_id' => $variant->color_id,
        //         'size_id' => $variant->size_id,
        //         'colorDetails' => $variant->color, // Lấy tên màu sắc
        //         'size' => $variant->size, // Lấy tên kích thước
        //     ];
        // });
        // $brandName = $product->brand ? $product->brand->name : null;

        // $categoryNames = $product->categories->pluck('name')->toArray();
   // 'variantDetails' => $variantDetails,
            // 'brandName' => $brandName,
            // 'categoryNames' => $categoryNames, // Lấy tên danh mục sản phẩm
               // return Product::with(['variants', 'images', 'categories' , 'brand'])->find($id);
        // Truy vấn sản phẩm cùng với các quan hệ
