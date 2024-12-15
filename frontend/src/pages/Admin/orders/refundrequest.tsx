import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface RefundRequest {
  id: number;
  order_id: number;
  user_id: number;
  reason: string;
  images: string[] | null;
  status: string;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

const RefundRequests = () => {
  const navigate = useNavigate();
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      const token = Cookies.get('access_token');
      const response = await axiosInstance.get('/refunds', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.status) {
        setRefunds(response.data.refund_requests);
      }
    } catch (error) {
      toast.error('Failed to load refund requests');
    } finally {
      setLoading(false);
    }
  };

  // Filter refunds based on search
  const filteredRefunds = refunds.filter(refund =>
    refund.order_id.toString().includes(search) ||
    refund.reason.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRefunds.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRefunds.length / itemsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-500">Đang chờ</span>
          </div>
        );
      case 'approved':
        return (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-green-500">Đã duyệt</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-red-500">Đã từ chối</span>
          </div>
        );
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Yêu cầu hoàn tiền</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">Quản lý và xem xét các yêu cầu hoàn tiền của khách hàng</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo Mã đơn hàng hoặc Lý do..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-800 text-white border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Mã đơn hàng</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Mã người dùng</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Lý do</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Trạng thái</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Ngày</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {currentItems.map((refund) => (
                <tr key={refund.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-300">#{refund.order_id}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">#{refund.user_id}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {refund.reason.length > 50
                      ? `${refund.reason.substring(0, 50)}...`
                      : refund.reason}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {getStatusBadge(refund.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {new Date(refund.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => navigate(`/admin/orders/refund-request/${refund.id}`)}
                      className="flex items-center gap-2 px-3 py-1 rounded-md bg-blue-500 hover:bg-blue-600 transition-colors text-white"
                    >
                      <Eye className="w-4 h-4" />
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-800 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Hiển thị {indexOfFirstItem + 1} đến {Math.min(indexOfLastItem, filteredRefunds.length)} của {filteredRefunds.length} kết quả
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-gray-300">
                Trang {currentPage} của {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundRequests;