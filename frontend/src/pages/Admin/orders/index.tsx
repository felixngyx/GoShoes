import { useState, useEffect } from 'react';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';

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
    status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded' | 'expired';
    total: string;
    customer: {
        avt: string;
        name: string;
        email: string;
    };
    shipping: {
        address: string;
        city: string;
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

// Add request interceptor for JWT token
api.interceptors.request.use(
    (config) => {
        const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL2F1dGgvbG9naW4iLCJpYXQiOjE3MzEwNTkwNDksImV4cCI6MTczMTA2MjY0OSwibmJmIjoxNzMxMDU5MDQ5LCJqdGkiOiJmN01tbWZaYW5OSm1tTlZtIiwic3ViIjoiNCIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjciLCJ0b2tlbl90eXBlIjoiYWNjZXNzIn0.XXou6U7wYF3nti9X2Tta7jtQ8ZKSb6Ev3XVbYGRfC2I';
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default function OrderDashboard() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<OrderData[]>([]);
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

    // Fetch orders from API using axios
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const { data } = await api.get<ApiResponse>(`/orders/all?page=${pagination.currentPage}`);

                if (data.success) {
                    setOrders(data.data);
                    setPagination({
                        currentPage: data.pagination.current_page,
                        lastPage: data.pagination.last_page,
                        perPage: data.pagination.per_page,
                        total: data.pagination.total
                    });
                } else {
                    throw new Error('Failed to get orders data');
                }
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    // Handle Axios specific errors
                    if (err.response) {
                        // Server responded with error status
                        setError(`Server error: ${err.response.data.message || 'Unknown error'}`);
                    } else if (err.request) {
                        // Request made but no response
                        setError('No response from server. Please check your connection.');
                    } else {
                        // Error in request configuration
                        setError(`Request error: ${err.message}`);
                    }
                } else {
                    // Handle non-Axios errors
                    setError('An unexpected error occurred');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [pagination.currentPage]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.lastPage) {
            setPagination(prev => ({ ...prev, currentPage: newPage }));
        }
    };

    // Search functionality
    const filteredOrders = orders.filter(order => {
        const searchString = searchTerm.toLowerCase();
        return (
            order.sku.toLowerCase().includes(searchString) ||
            order.customer.name.toLowerCase().includes(searchString) ||
            order.customer.email.toLowerCase().includes(searchString) ||
            order.shipping.city.toLowerCase().includes(searchString) ||
            order.status.toLowerCase().includes(searchString) ||
            order.items.some(item => item.product.name.toLowerCase().includes(searchString))
        );
    });

    // Sorting functionality
    const handleSort = (key: keyof OrderData | 'customer.name') => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });

        const sortedOrders = [...filteredOrders].sort((a, b) => {
            let valA = key === 'customer.name' ? a.customer.name : a[key as keyof OrderData];
            let valB = key === 'customer.name' ? b.customer.name : b[key as keyof OrderData];

            if (valA < valB) return direction === 'asc' ? -1 : 1;
            if (valA > valB) return direction === 'asc' ? 1 : -1;
            return 0;
        });
        setOrders(sortedOrders);
    };

    const getStatusColor = (status: OrderData['status']) => {
        const colors = {
            pending: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
            processing: 'bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
            completed: 'bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-200',
            cancelled: 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-200',
            refunded: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
            expired: 'bg-purple-200 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200'
        };
        return colors[status];
    };

    const handleOrderClick = (orderId : number) => {
        navigate(`/admin/orders/detail/${orderId}`);
    };

    if (loading) {
        return (
            <div className="w-full h-64 flex items-center justify-center">
                <div className="animate-pulse text-gray-600 dark:text-gray-300">Loading orders...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-64 flex items-center justify-center">
                <div className="text-red-600 dark:text-red-400 text-center">
                    <p className="font-semibold mb-2">Error Loading Orders</p>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 bg-white/60 dark:bg-gray-800/60">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Customer's Orders</h1>
                    <div className="relative w-72">
                        <input
                            type="search"
                            placeholder="Search orders..."
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
                                        Customer
                                        <ArrowUpDown size={16} />
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">
                                    Product
                                </th>
                                <th onClick={() => handleSort('status')} className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-200 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400">
                                    <div className="flex items-center gap-2">
                                        Status
                                        <ArrowUpDown size={16} />
                                    </div>
                                </th>
                                <th onClick={() => handleSort('total')} className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-200 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400">
                                    <div className="flex items-center gap-2">
                                        Total
                                        <ArrowUpDown size={16} />
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => (
                                <tr
                                    key={order.id}
                                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    onClick={() => handleOrderClick(order.id)}
                                >
                                    <td className="px-6 py-4 text-gray-800 dark:text-gray-200">{order.id}</td>
                                    <td className="px-6 py-4 text-gray-800 dark:text-gray-200">{order.sku}</td>
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
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">
                                        ${parseFloat(order.total).toFixed(2)}
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
                        Showing {((pagination.currentPage - 1) * pagination.perPage) + 1} to{' '}
                        {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} of{' '}
                        {pagination.total} entries
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