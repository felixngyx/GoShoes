<?php

namespace App\Http\Controllers\API\Statistical;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatisticalController extends Controller
{
    public function getTodayRevenue()
    {
        $todayRevenue = Order::whereDate('created_at', Carbon::today())->sum('total');
        return response()->json(['today_revenue' => $todayRevenue]);
    }
    public function getMonthlyRevenue()
    {
        $monthlyRevenue = Order::selectRaw('MONTH(created_at) as month, SUM(total) as revenue')
            ->groupBy('month')
            ->get();
        return response()->json(['monthly_revenue' => $monthlyRevenue]);
    }


    public function getTopRevenueProducts()
    {
        $topProducts = Product::withSum('orderItems as total_revenue', DB::raw('price * quantity'))
                          ->join('order_items', 'products.id', '=', 'order_items.product_id')
                          ->groupBy('products.id')
                          ->orderByDesc('total_revenue')
                          ->take(5)
                          ->get();

    return response()->json(['top_products' => $topProducts]);
    }
}
