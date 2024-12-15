import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const message = searchParams.get('message');

  return (
    <div className="flex flex-col justify-center items-center px-4 pt-20 pb-20">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Thanh toán thành công!
        </h2>
        <p className="text-gray-600 mb-8">
          {message || "Giao dịch của bạn đã được hoàn tất thành công."}
        </p>
        <div className="space-y-4">
          <Link
            to="/account/my-order"
            className="block w-full bg-indigo-600 text-white rounded-md px-4 py-2 hover:bg-indigo-700"
          >
            Xem đơn hàng của tôi
          </Link>
          <Link
            to="/"
            className="block w-full bg-gray-200 text-gray-800 rounded-md px-4 py-2 hover:bg-gray-300"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;