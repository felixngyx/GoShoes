import { useSearchParams, Link } from 'react-router-dom';
import { XCircleIcon } from '@heroicons/react/24/solid';

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const message = searchParams.get('message');

  return (
    <div className="flex flex-col justify-center items-center px-4 pt-20 pb-20">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Payment Failed
        </h2>
        <p className="text-gray-600 mb-8">
          {message || "Sorry, your payment could not be processed."}
        </p>
        <div className="space-y-4">
          <Link
            to="/account/my-order"
            className="block w-full bg-gray-200 text-gray-800 rounded-md px-4 py-2 hover:bg-gray-300"
          >
            View My Orders
          </Link>
          <Link
            to="/"
            className="block w-full border border-gray-300 text-gray-600 rounded-md px-4 py-2 hover:bg-gray-50"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed; 