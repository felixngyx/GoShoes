<?php

namespace App\Http\Controllers\API\Statistical;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
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

    public function getMonthlyRevenue(Request $request)
    {
        // Tính các thống kê theo filter
        $query = Order::query();
        switch ($request->filter) {
            case 'today':
                $todayRevenue = Order::whereDate('created_at', Carbon::today())->sum('total');
                $totalRevenue = $todayRevenue;
                $totalOrders = Order::whereDate('created_at', Carbon::today())->count();
                break;

            case 'monthly':
                $todayRevenue = Order::whereDate('created_at', Carbon::today())->sum('total');
                $totalRevenue = Order::whereYear('created_at', Carbon::now()->year)
                    ->whereMonth('created_at', Carbon::now()->month)
                    ->sum('total');
                $totalOrders = Order::whereYear('created_at', Carbon::now()->year)
                    ->whereMonth('created_at', Carbon::now()->month)
                    ->count();
                break;

            case 'yearly':
                $todayRevenue = Order::whereDate('created_at', Carbon::today())->sum('total');
                $totalRevenue = Order::whereYear('created_at', Carbon::now()->year)->sum('total');
                $totalOrders = Order::whereYear('created_at', Carbon::now()->year)->count();
                break;

            default:
                $todayRevenue = Order::whereDate('created_at', Carbon::today())->sum('total');
                $totalRevenue = Order::sum('total');
                $totalOrders = Order::count();
        }

        $totalProducts = Product::count();
        $totalUsers = User::count();

        // Xử lý thống kê chi tiết theo filter
        $query = Order::query();

        switch ($request->filter) {
            case 'today':
                $query->whereDate('created_at', Carbon::today())
                    ->selectRaw('DATE_FORMAT(created_at, "%H:00") as hour, SUM(total) as revenue')
                    ->groupBy('hour')
                    ->orderBy('hour');
                break;

            case 'monthly':
                $query->whereYear('created_at', Carbon::now()->year)
                    ->whereMonth('created_at', Carbon::now()->month)
                    ->selectRaw('DATE(created_at) as date, SUM(total) as revenue')
                    ->groupBy('date')
                    ->orderBy('date');
                break;

            case 'yearly':
                $query->whereYear('created_at', Carbon::now()->year)
                    ->selectRaw('MONTH(created_at) as month, SUM(total) as revenue')
                    ->groupBy('month')
                    ->orderBy('month');
                break;

            default:
                $query->selectRaw('MONTH(created_at) as month, YEAR(created_at) as year, SUM(total) as revenue')
                    ->groupBy('year', 'month')
                    ->orderBy('year', 'desc')
                    ->orderBy('month', 'desc');
        }

        $revenue = $query->get();

        // Đảm bảo luôn có dữ liệu trả về
        if ($revenue->isEmpty()) {
            switch ($request->filter) {
                case 'today':
                    $revenue = [['hour' => Carbon::now()->format('H:00'), 'revenue' => 0]];
                    break;
                case 'monthly':
                    $revenue = [['date' => Carbon::now()->format('Y-m-d'), 'revenue' => 0]];
                    break;
                case 'yearly':
                    $revenue = [['month' => Carbon::now()->month, 'revenue' => 0]];
                    break;
                default:
                    $revenue = [[
                        'month' => Carbon::now()->month,
                        'year' => Carbon::now()->year,
                        'revenue' => 0
                    ]];
            }
        }

        // Trả về cả thống kê tổng quan và chi tiết
        return response()->json([
            'overview' => [
                'today_revenue' => $todayRevenue ?: 0,
                'total_revenue' => $totalRevenue ?: 0,
                'total_products' => $totalProducts,
                'total_users' => $totalUsers,
                'total_orders' => $totalOrders
            ],
            'revenue' => $revenue
        ]);
    }

    public function getTopRevenueProducts()
    {
        $topProducts = Product::withSum('orderItems as total_revenue', DB::raw('price * quantity'))
            ->join('order_items', 'products.id', '=', 'order_items.product_id')
            ->groupBy('products.id', 'products.name') // Thêm products.name vào group by
            ->orderByDesc('total_revenue')
            ->take(5)
            ->get(['products.id', 'products.name', 'total_revenue']); // Chỉ lấy các trường cần thiết

        // Thêm thông tin tổng số sản phẩm và người dùng
        $totalProducts = Product::count();
        $totalUsers = User::count();

        return response()->json([
            'top_products' => $topProducts,
            'total_products' => $totalProducts,
            'total_users' => $totalUsers
        ]);
    }
}
