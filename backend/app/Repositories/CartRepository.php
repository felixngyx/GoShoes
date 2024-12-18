<?php

namespace App\Repositories;

use App\Models\Cart;
use App\Repositories\RepositoryInterfaces\CartRepositoryInterface;
use Illuminate\Support\Facades\DB;

class CartRepository extends BaseRepository implements CartRepositoryInterface
{
    public function __construct(
        Cart $cart
    )
    {
        parent::__construct($cart);
    }

    public function findByUserIdAndProductVariantId(int $userId, int $productVariantId)
    {
        return $this->model->where('user_id', $userId)->where('product_variant_id', $productVariantId)->first();
    }

    public function getAllByUserId(int $userId)
    {
        return DB::select("
            SELECT
                JSON_ARRAYAGG(
                   JSON_OBJECT(
                       'quantity', c.quantity,
                       'product_variant', JSON_OBJECT(
                           'id', pv.id,
                           'product_id', pv.product_id,
                           'size_id', pv.size_id,
                           'color_id', pv.color_id,
                           'quantity', pv.quantity,
                           'created_at', pv.created_at,
                           'updated_at', pv.updated_at,
                           'product', JSON_OBJECT(
                               'id', p.id,
                               'brand_id', p.brand_id,
                               'name', p.name,
                               'description', p.description,
                               'price', p.price,
                               'stock_quantity', p.stock_quantity,
                               'promotional_price', p.promotional_price,
                               'status', p.status,
                               'sku', p.sku,
                               'is_deleted', p.is_deleted,
                               'rating_count', p.rating_count,
                               'slug', p.slug,
                               'thumbnail', p.thumbnail,
                               'hagtag', p.hagtag
                           ),
                           'color', JSON_OBJECT(
                               'id', vc.id,
                               'color', vc.color,
                               'link_image', iv.image
                           ),
                           'size', JSON_OBJECT(
                               'id', vs.id,
                               'size', vs.size
                           ),
                           'image_variants', JSON_OBJECT(
                               'image', iv.image
                           )
                       )
                   )
               ) AS result
        FROM cart AS c
        JOIN product_variants AS pv ON c.product_variant_id = pv.id
        JOIN products AS p ON pv.product_id = p.id
        JOIN variant_colors AS vc ON pv.color_id = vc.id
        JOIN variant_sizes AS vs ON pv.size_id = vs.id
        LEFT JOIN image_variants AS iv ON iv.product_id = pv.product_id AND iv.color_id = pv.color_id
        WHERE c.user_id = ? AND p.is_deleted = false;
        ", [$userId]);
    }

}
