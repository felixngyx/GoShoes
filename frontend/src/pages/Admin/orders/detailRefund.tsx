import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Package, User, ShoppingCart, CheckCircle, XCircle } from 'lucide-react';

interface RefundDetail {
  id: number;
  order_id: number;
  user_id: number;
  reason: string;
  images: string[] | null;
  status: string;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  order: {
    id: number;
    total: string;
    original_total: string;
    status: string;
    sku: string;
    items: Array<{
      quantity: number;
      price: string;
      product: {
        name: string;
        thumbnail: string;
      };
      variant: {
        id: number;
        size_id: number;
        color_id: number;
      };
    }>;
    payment: {
      status: string;
      method_id: number;
    };
    user: {
      name: string;
      email: string;
      phone: string | null;
    };
  };
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

const formatToVND = (price: string) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(parseFloat(price));
};

const RefundDetail = () => {
  const { id } = useParams();
  const [refund, setRefund] = useState<RefundDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRefundDetail = async () => {
      try {
        const token = Cookies.get('access_token');
        const response = await axiosInstance.get(`/refunds/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.status) {
          setRefund(response.data.refund_request);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchRefundDetail();
  }, [id]);

  const handleApprove = async () => {
    try {
      const token = Cookies.get('access_token');
      const body = {
        id: refund?.id,
        order_id: refund?.order_id,
      };

      await axiosInstance.post(`/refunds/approve`, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      // Refresh data after approval
      window.location.reload();
    } catch (err) {
      console.error('Error approving refund:', err);
    }
  };

  const handleDecline = async () => {
    try {
      const body = {
        id: refund?.id,
        order_id: refund?.order_id,
      };
      const token = Cookies.get('access_token');
      await axiosInstance.post(`/refunds/deny`, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      window.location.reload();
    } catch (err) {
      console.error('Error declining refund:', err);
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi khi tải chi tiết hoàn tiền: {error.message}</div>;
  if (!refund) return <div>Không tìm thấy yêu cầu hoàn tiền</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Chi Tiết Yêu Cầu Hoàn Tiền</h1>

        {/* Nút Hành Động */}
        {refund?.status === 'pending' && (
          <div className="flex gap-4">
            <button
              onClick={handleApprove}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <CheckCircle className="w-5 h-5" />
              Chấp Nhận
            </button>
            <button
              onClick={handleDecline}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <XCircle className="w-5 h-5" />
              Từ Chối
            </button>
          </div>
        )}
      </div>

      {/* Thông Tin Hoàn Tiền */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
          <Package className="w-5 h-5" /> Thông Tin Hoàn Tiền
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400">Mã Hoàn Tiền: {refund?.id}</p>
            <p className="text-gray-400">
              Trạng Thái:
              <span className={`ml-2 px-2 py-1 rounded text-white ${refund?.status === 'pending'
                  ? 'bg-yellow-500'
                  : refund?.status === 'approved'
                    ? 'bg-green-500'
                    : 'bg-red-500'
                }`}>
                {refund?.status}
              </span>
            </p>
            <p className="text-gray-400">Lý Do: {refund?.reason}</p>
          </div>
          <div>
            <p className="text-gray-400">Ngày Tạo: {new Date(refund?.created_at || '').toLocaleString()}</p>
            <p className="text-gray-400">Ngày Cập Nhật: {new Date(refund?.updated_at || '').toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Thông Tin Đơn Hàng */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" /> Thông Tin Đơn Hàng
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400">Mã Đơn Hàng: {refund?.order.id}</p>
            <p className="text-gray-400">SKU: {refund?.order.sku}</p>
            <p className="text-gray-400">Trạng Thái: {refund?.order.status}</p>
          </div>
          <div>
            <p className="text-gray-400">Tổng Cộng: {formatToVND(refund?.order.total)}</p>
            <p className="text-gray-400">Tổng Gốc: {formatToVND(refund?.order.original_total)}</p>
          </div>
        </div>
      </div>

      {/* Sản Phẩm Trong Đơn Hàng */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Sản Phẩm Trong Đơn Hàng</h2>
        <div className="space-y-4">
          {refund?.order.items.map((item, index) => (
            <div key={index} className="flex items-center gap-4 border-b border-gray-700 pb-4">
              <img src={item.product.thumbnail} alt={item.product.name} className="w-16 h-16 object-cover rounded" />
              <div>
                <p className="text-white">{item.product.name}</p>
                <p className="text-gray-400">Số Lượng: {item.quantity}</p>
                <p className="text-gray-400">Giá: {formatToVND(item.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hình Ảnh */}
      {refund?.images && refund.images.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Hình Ảnh</h2>
          <div className="grid grid-cols-3 gap-4">
            {refund.images.map((image, index) => (
              <img key={index} src={image} alt={`Hình ảnh hoàn tiền ${index + 1}`} className="w-full h-48 object-cover rounded" />
            ))}
          </div>
        </div>
      )}

      {/* Thông Tin Khách Hàng */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
          <User className="w-5 h-5" /> Thông Tin Khách Hàng
        </h2>
        <div>
          <p className="text-gray-400">Tên: {refund?.order.user.name}</p>
          <p className="text-gray-400">Email: {refund?.order.user.email}</p>
          <p className="text-gray-400">Số Điện Thoại: {refund?.order.user.phone || 'N/A'}</p>
        </div>
      </div>

    </div>
  );
};

export default RefundDetail;