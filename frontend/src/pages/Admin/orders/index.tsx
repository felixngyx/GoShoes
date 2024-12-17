import { useState, useEffect } from 'react';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Copy, Download } from 'lucide-react';
import { parse, unparse } from 'papaparse';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

interface OrderItem {
    quantity: number;
    price: string;
    subtotal: number;
    product: {
        name: string;
        thumbnail: string;
    };
    variant: {
        size: string | null;
        color: string | null;
    } | null;
}

interface OrderData {
    id: number;
    sku: string;
    status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded' | 'expired' | 'shipping' | 'failed';
    created_at: string;
    total: string;
    customer: {
        avt: string;
        name: string;
        email: string;
    };
    shipping: {
        shipping_detail: string | {
            name: string;
            phone_number: string;
            address: string;
            address_detail: string;
            is_default: boolean;
        };
    };
    payment: {
        method: string;
        status: string;
        url: string;
    };
    items: OrderItem[];
}
interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface ApiResponse {
    success: boolean;
    data: OrderData[];
    pagination: Pagination;
}

interface PaginationState {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
}


// Create axios instance with default config
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
});

api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const LoadingAnimation = () => {
    return (
        <div className="w-full h-64 flex items-center justify-center">
            <div className="space-y-4 text-center">
                {/* Logo animation */}
                <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 border-4 border-purple-200 dark:border-purple-900/50 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-purple-600 dark:border-purple-400 rounded-full 
                        border-t-transparent animate-spin"></div>
                </div>

                {/* Text animation */}
                <div className="text-lg font-medium text-gray-700 dark:text-gray-200">
                    <div className="inline-block">
                        Đang tải đơn hàng
                        <span className="animate-bounce inline-block">.</span>
                        <span className="animate-bounce inline-block" style={{ animationDelay: '0.2s' }}>.</span>
                        <span className="animate-bounce inline-block" style={{ animationDelay: '0.4s' }}>.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function OrderDashboard() {
    const navigate = useNavigate();
    const [allOrders, setAllOrders] = useState<OrderData[]>([]); // Lưu trữ tất cả orders
    const [displayedOrders, setDisplayedOrders] = useState<OrderData[]>([]); // Orders được hiển thị sau khi filter/sort
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{
        key: keyof OrderData | 'customer.name';
        direction: 'asc' | 'desc';
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginationState>({
        currentPage: 1,
        lastPage: 1,
        perPage: 10,
        total: 0
    });

    // Fetch tất cả orders
    useEffect(() => {
        const fetchAllOrders = async () => {
            try {
                setLoading(true);
                // Fetch page đầu tiên để lấy tổng số trang
                const firstPageResponse = await api.get<ApiResponse>('/orders/all?page=1');
                const totalPages = firstPageResponse.data.pagination.last_page;

                // Fetch tất cả các trang
                const promises = [];
                for (let page = 1;page <= totalPages;page++) {
                    promises.push(api.get<ApiResponse>(`/orders/all?page=${page}`));
                }

                const responses = await Promise.all(promises);
                const allOrdersData = responses.flatMap(response => response.data.data);

                setAllOrders(allOrdersData);
                updateDisplayedOrders(allOrdersData, searchTerm, sortConfig, 1);
            } catch (err) {
                handleError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllOrders();
    }, []);

    // Hàm xử lý lỗi
    const handleError = (err: any) => {
        if (axios.isAxiosError(err)) {
            if (err.response) {
                setError(`Server error: ${err.response.data.message || 'Unknown error'}`);
            } else if (err.request) {
                setError('No response from server. Please check your connection.');
            } else {
                setError(`Request error: ${err.message}`);
            }
        } else {
            setError('An unexpected error occurred');
        }
    };

    // Hàm cập nhật orders hiển thị
    const updateDisplayedOrders = (
        orders: OrderData[],
        search: string,
        sort: typeof sortConfig,
        page: number
    ) => {
        // Lọc theo search term
        let filtered = orders.filter(order => {
            const searchString = search.toLowerCase();
            const orderDate = new Date(order.created_at).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });

            return (
                order.sku.toLowerCase().includes(searchString) ||
                order.customer.name.toLowerCase().includes(searchString) ||
                order.customer.email.toLowerCase().includes(searchString) ||
                order.status.toLowerCase().includes(searchString) ||
                order.items.some(item => item.product.name.toLowerCase().includes(searchString)) ||
                orderDate.includes(searchString) ||  // Tìm theo định dạng dd/mm/yyyy
                order.created_at.split('T')[0].includes(searchString)  // Tìm theo định dạng yyyy-mm-dd
            );
        });

        // Sắp xếp nếu có
        if (sort) {
            filtered = [...filtered].sort((a, b) => {
                let valA = sort.key === 'customer.name' ? a.customer.name : a[sort.key as keyof OrderData];
                let valB = sort.key === 'customer.name' ? b.customer.name : b[sort.key as keyof OrderData];

                if (valA < valB) return sort.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sort.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        // Cập nhật pagination
        const totalItems = filtered.length;
        const lastPage = Math.ceil(totalItems / pagination.perPage);
        const currentPage = Math.min(page, lastPage);

        // Phân trang
        const start = (currentPage - 1) * pagination.perPage;
        const end = start + pagination.perPage;
        const paginatedOrders = filtered.slice(start, end);

        setDisplayedOrders(paginatedOrders);
        setPagination({
            currentPage,
            lastPage,
            perPage: pagination.perPage,
            total: totalItems
        });
    };

    // Handle search
    useEffect(() => {
        updateDisplayedOrders(allOrders, searchTerm, sortConfig, 1);
    }, [searchTerm]);

    // Handle sort
    const handleSort = (key: keyof OrderData | 'customer.name') => {
        const direction: 'asc' | 'desc' =
            sortConfig && sortConfig.key === key && sortConfig.direction === 'asc'
                ? 'desc'
                : 'asc';
        const newSortConfig = { key, direction };
        setSortConfig(newSortConfig);
        updateDisplayedOrders(allOrders, searchTerm, newSortConfig, pagination.currentPage);
    };

    // Handle page change
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.lastPage) {
            updateDisplayedOrders(allOrders, searchTerm, sortConfig, newPage);
        }
    };

    // Export to CSV với tất cả dữ liệu đã được filter
    const handleExportToCSV = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        const filteredOrders = allOrders.filter(order => {
            const searchString = searchTerm.toLowerCase();
            const orderDate = new Date(order.created_at).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });

            return (
                order.sku.toLowerCase().includes(searchString) ||
                order.customer.name.toLowerCase().includes(searchString) ||
                order.customer.email.toLowerCase().includes(searchString) ||
                order.status.toLowerCase().includes(searchString) ||
                order.items.some(item => item.product.name.toLowerCase().includes(searchString)) ||
                orderDate.includes(searchString) ||  // Tìm theo định dạng dd/mm/yyyy
                order.created_at.split('T')[0].includes(searchString)  // Tìm theo định dạng yyyy-mm-dd
            );
        });

        // Tạo dữ liệu thống kê
        const statistics = {
            totalOrders: filteredOrders.length,
            totalRevenue: filteredOrders.reduce((sum, order) => sum + Number(order.total), 0),
            ordersByStatus: filteredOrders.reduce((acc, order) => {
                acc[order.status] = (acc[order.status] || 0) + 1;
                return acc;
            }, {} as Record<string, number>),
            averageOrderValue: filteredOrders.reduce((sum, order) => sum + Number(order.total), 0) / filteredOrders.length,
        };

        // Sheet đơn hàng chi tiết
        const ordersData = filteredOrders.map((order) => ({
            'Order ID': order.id,
            'SKU': order.sku,
            'Order Date': new Date(order.created_at).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            'Status': order.status.toUpperCase(),
            'Customer Name': order.customer.name,
            'Customer Email': order.customer.email,
            'Shipping Address': order.shipping?.shipping_detail ?
                (() => {
                    try {
                        const shippingDetail = typeof order.shipping.shipping_detail === 'string'
                            ? JSON.parse(order.shipping.shipping_detail)
                            : order.shipping.shipping_detail;
                        return `${shippingDetail.address}, ${shippingDetail.address_detail}`;
                    } catch (e) {
                        return 'N/A';
                    }
                })() :
                'N/A',
            'Phone Number': order.shipping?.shipping_detail ?
                (() => {
                    try {
                        const shippingDetail = JSON.parse(order.shipping.shipping_detail);
                        return shippingDetail.phone_number;
                    } catch (e) {
                        return 'N/A';
                    }
                })() :
                'N/A',
            'Total Amount': new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(Number(order.total)),
            'Products': order.items.map(item =>
                `${item.quantity}x ${item.product.name} (${item.variant?.size || 'N/A'}, ${item.variant?.color || 'N/A'})`
            ).join(' | '),
            'Payment Method': order.payment?.method || 'N/A',
            'Payment Status': order.payment?.status || 'N/A'
        }));

        // Sheet thống kê
        const statisticsData = [
            {
                'Metric': 'Total Orders',
                'Value': statistics.totalOrders
            },
            {
                'Metric': 'Total Revenue',
                'Value': new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                }).format(statistics.totalRevenue)
            },
            {
                'Metric': 'Average Order Value',
                'Value': new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                }).format(statistics.averageOrderValue)
            },
            { 'Metric': '', 'Value': '' }, // Dòng trống
            { 'Metric': 'Orders by Status', 'Value': '' },
            ...Object.entries(statistics.ordersByStatus).map(([status, count]) => ({
                'Metric': status.charAt(0).toUpperCase() + status.slice(1),
                'Value': count
            }))
        ];

        // Tạo workbook với nhiều sheet
        const workbook = {
            Orders: ordersData,
            Statistics: statisticsData
        };

        // Xuất file với nhiều sheet
        const csvString = Object.entries(workbook).map(([sheetName, data]) => (
            `${sheetName}\n${unparse(data, {
                header: true,
                quotes: true,
                delimiter: ',',
            })}\n\n`
        )).join('');

        // Thêm BOM để Excel hiển thị đúng tiếng Việt
        const BOM = '\uFEFF';
        const csvWithBOM = BOM + csvString;

        const currentDate = new Date().toLocaleDateString('en-GB').split('/').join('-');

        const blob = new Blob([csvWithBOM], {
            type: 'text/csv;charset=utf-8;'
        });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `Orders_Report_${currentDate}.csv`);
        link.click();
    };

    const getStatusColor = (status: OrderData['status']) => {
        const colors = {
            pending: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
            processing: 'bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
            completed: 'bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-200',
            cancelled: 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-200',
            refunded: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
            expired: 'bg-purple-200 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200',
            shipping: 'bg-indigo-200 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200',
            failed: 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-200',
        };
        return colors[status];
    };

    const handleOrderClick = (orderId: number) => {
        navigate(`/admin/orders/detail/${orderId}`);
    };

    if (loading) {
        return (
            <div className="w-full max-w-10xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
                <LoadingAnimation />
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-64 flex items-center justify-center">
                <div className="text-red-600 dark:text-red-400 text-center">
                    <p className="font-semibold mb-2">Lỗi tải đơn hàng</p>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-10xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 bg-white/60 dark:bg-gray-800/60">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex">Danh sách đơn hàng
                        <Download
                            className='ml-4 mt-1 cursor-pointer hover:text-purple-600'
                            size={25}
                            onClick={handleExportToCSV}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleExportToCSV(e);
                                }
                            }}
                            tabIndex={0}
                        />
                    </h1>
                    <div className="relative w-72">
                        <input
                            type="search"
                            placeholder="Tìm kiếm đơn hàng..."
                            className="w-full px-4 py-2 rounded-full bg-white/70 dark:bg-gray-700/70 border 
                       dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 
                       dark:focus:ring-purple-400 text-gray-800 dark:text-gray-200 
                       placeholder-gray-500 dark:placeholder-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />

                        <Search className="absolute right-3 top-2.5 text-gray-400 dark:text-gray-500" size={20} />

                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700">
                                <th onClick={() => handleSort('id')} className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-200 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400">
                                    <div className="flex items-center gap-2">
                                        ID
                                        <ArrowUpDown size={16} />
                                    </div>
                                </th>
                                <th onClick={() => handleSort('sku')} className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-200 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400">
                                    <div className="flex items-center gap-2">
                                        SKU
                                        <ArrowUpDown size={16} />
                                    </div>
                                </th>
                                <th onClick={() => handleSort('customer.name')} className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-200 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400">
                                    <div className="flex items-center gap-2">
                                        Khách hàng
                                        <ArrowUpDown size={16} />
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">
                                    Sản phẩm
                                </th>
                                <th onClick={() => handleSort('status')} className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-200 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400">
                                    <div className="flex items-center gap-2">
                                        Trạng thái
                                        <ArrowUpDown size={16} />
                                    </div>
                                </th>
                                <th onClick={() => handleSort('total')} className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-200 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400">
                                    <div className="flex items-center gap-2">
                                        Tổng cộng
                                        <ArrowUpDown size={16} />
                                    </div>
                                </th>
                                <th onClick={() => handleSort('created_at')} className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-200 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400">
                                    <div className="flex items-center gap-2">
                                        Ngày tạo
                                        <ArrowUpDown size={16} />
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedOrders.map((order) => (
                                <tr
                                    key={order.id}
                                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    onClick={() => handleOrderClick(order.id)}
                                >
                                    <td className="px-6 py-4 text-gray-800 dark:text-gray-200 flex items-center">
                                        {order.id}
                                    </td>
                                    <td className="px-6 py-4 text-gray-800 dark:text-gray-200 ">{order.sku}
                                        <Copy
                                            className="px-1 py-1 bg-gray-200 dark:bg-gray-600 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigator.clipboard.writeText(order.sku);
                                                alert("SKU đã được sao chép vào clipboard!");
                                            }}
                                        >
                                        </Copy>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={order.customer.avt}
                                                alt={order.customer.name}
                                                className="w-9 h-9 rounded-full"
                                            />
                                            <div>
                                                <p className="font-medium text-gray-800 dark:text-gray-200">{order.customer.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{order.customer.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            {order.items.slice(0, 2).map((item, index) => (
                                                <div key={index} className="text-sm text-gray-600 dark:text-gray-300">
                                                    {item.quantity}x {item.product.name}
                                                </div>
                                            ))}
                                            {order.items.length > 2 && (
                                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                                    ...
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                                            {(() => {
                                                const statusMap: Record<string, string> = {
                                                    Shipping: 'Đang giao hàng',
                                                    Processing: 'Đang xử lý',
                                                    Completed: 'Hoàn thành',
                                                    Cancelled: 'Đã hủy',
                                                    Refunded: 'Đã hoàn tiền',
                                                    Expired: 'Hết hạn',
                                                    Failed: 'Thất bại',
                                                    Pending: 'Chờ xử lý'
                                                };
                                                const status = order.status.charAt(0).toUpperCase() + order.status.slice(1);
                                                return statusMap[status] || status;
                                            })()}

                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">
                                        {new Intl.NumberFormat('de-DE', { style: 'decimal' }).format(Number(order.total))}đ
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">
                                        {new Date(order.created_at).toLocaleDateString('vi-VN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Hiển thị từ {((pagination.currentPage - 1) * pagination.perPage) + 1} đến{' '}
                        {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} trong tổng số{' '}
                        {pagination.total} mục
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 
                                     hover:bg-gray-100 dark:hover:bg-gray-700 
                                     disabled:opacity-50 disabled:cursor-not-allowed
                                     text-gray-600 dark:text-gray-400"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        {/* Page numbers */}
                        <div className="flex items-center gap-1">
                            {[...Array(pagination.lastPage)].map((_, idx) => {
                                const pageNumber = idx + 1;
                                const isActive = pageNumber === pagination.currentPage;

                                return (
                                    <button
                                        key={pageNumber}
                                        onClick={() => handlePageChange(pageNumber)}
                                        className={`px-3 py-1 rounded-lg border 
                                                  ${isActive
                                                ? 'bg-purple-600 text-white border-purple-600'
                                                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.lastPage}
                            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 
                                     hover:bg-gray-100 dark:hover:bg-gray-700 
                                     disabled:opacity-50 disabled:cursor-not-allowed
                                     text-gray-600 dark:text-gray-400"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>

    );
}