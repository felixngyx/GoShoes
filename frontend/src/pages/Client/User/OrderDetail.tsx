import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import OrderTracking from "./Ordertracking";
import { CircularProgress, Alert } from "@mui/material";

interface OrderItem {
  quantity: number;
  price: string;
  subtotal: number;
  product: {
    name: string;
    thumbnail: string;
  };
  variant?: {
    size: string;
    color: string;
  } | null;
}

interface OrderData {
  id: number;
  sku: string;
  status: string;
  total: string;
  created_at: string;
  customer: {
    name: string;
    email: string;
    phone: string | null;
  };
  shipping: {
    id: number;
    shipping_detail: {
      name: string;
      address: string;
      phone_number: string;
      address_detail: string;
    };
    is_default: boolean;
  };
  payment: {
    method: string;
    status: string;
    url: string;
  };
  items: OrderItem[];
}

const OrderDetail = () => {
  const { id } = useParams();

  const {
    data: order,
    isLoading,
    error,
  } = useQuery<{ success: boolean; data: OrderData }>({
    queryKey: ["order", id],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/orders/${id}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("access_token")}`,
          },
        }
      );
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <CircularProgress />
      </div>
    );
  }

  if (error || !order?.success) {
    return <Alert severity="error">Failed to load order details</Alert>;
  }

  const orderData = order.data;

  return (
    <div className="col-span-9">
      <div className="md:px-6 2xl:px-20 2xl:container 2xl:mx-auto shadow-lg border pt-9">
        <div className="flex justify-start item-start space-y-2 flex-col">
          <h1 className="text-3xl dark:text-white lg:text-4xl font-semibold leading-7 lg:leading-9 text-gray-800">
            Order #{orderData.sku}
          </h1>
          <p className="text-base dark:text-gray-300 font-medium leading-6 text-gray-600">
            {new Date(orderData.created_at).toLocaleDateString("vi-VN")}
          </p>
        </div>

        <OrderTracking
          status={orderData.status}
          paymentStatus={orderData.payment.status}
          paymentMethod={orderData.payment.method}
        />

        <div className="mt-10 flex flex-col xl:flex-row jusitfy-center items-stretch w-full space-y-4 md:space-y-6 xl:space-y-0 pb-10">
          {/* Danh sách sản phẩm */}
          <div className="flex flex-col justify-start items-start w-full space-y-4 md:space-y-6 xl:space-y-8">
            <div className="flex flex-col justify-start items-start bg-gray-50 px-4 py-4 ml--4 w-full">
              <p className="text-lg md:text-xl font-semibold leading-6 xl:leading-5 text-gray-800">
                Order Items
              </p>
              {orderData.items.map((item, index) => (
                <div
                  key={index}
                  className="mt-4 md:mt-6 flex flex-col md:flex-row justify-start items-start md:items-center md:space-x-6 xl:space-x-8 w-full"
                >
                  <div className="pb-4 md:pb-8 w-full md:w-40">
                    <img
                      className="w-full hidden md:block"
                      src={item.product.thumbnail}
                      alt={item.product.name}
                    />
                  </div>
                  <div className="border-b border-gray-200 md:flex-row flex-col flex justify-between items-start w-full pb-8 space-y-4 md:space-y-0">
                    <div className="w-full flex flex-col justify-start items-start space-y-8">
                      <h3 className="text-xl xl:text-2xl font-semibold leading-6 text-gray-800">
                        {item.product.name}
                      </h3>
                      {item.variant && (
                        <div className="flex justify-start items-start flex-col space-y-2">
                          <p className="text-sm leading-none text-gray-800">
                            <span className="text-gray-300">Size: </span>{" "}
                            {item.variant.size}
                          </p>
                          <p className="text-sm leading-none text-gray-800">
                            <span className="text-gray-300">Color: </span>{" "}
                            {item.variant.color}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between space-x-8 items-start w-full">
                      <p className="text-base xl:text-lg leading-6">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(Number(item.price))}
                      </p>
                      <p className="text-base xl:text-lg leading-6 text-gray-800">
                        x{item.quantity}
                      </p>
                      <p className="text-base xl:text-lg font-semibold leading-6 text-gray-800">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(item.subtotal)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Tổng tiền */}
            <div className="flex justify-center flex-col md:flex-row items-stretch w-full space-y-4 md:space-y-0 md:space-x-6 xl:space-x-8">
              <div className="flex flex-col px-4 py-6 md:p-6 xl:p-8 w-full bg-gray-50 space-y-6">
                <h3 className="text-xl font-semibold leading-5 text-gray-800">
                  Summary
                </h3>
                <div className="flex justify-between items-center w-full">
                  <p className="text-base font-semibold leading-4 text-gray-800">
                    Total
                  </p>
                  <p className="text-base font-semibold leading-4 text-gray-600">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(Number(orderData.total))}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Thông tin khách hàng */}
          <div className="bg-gray-50 w-full xl:w-96 flex justify-between items-center md:items-start px-4 py-6 md:p-6 xl:p-8 flex-col">
            <h3 className="text-xl font-semibold leading-5 text-gray-800">
              Customer
            </h3>
            <div className="flex flex-col md:flex-row xl:flex-col justify-start items-stretch h-full w-full md:space-x-6 lg:space-x-8 xl:space-x-0">
              <div className="flex flex-col justify-start items-start flex-shrink-0">
                <div className="flex justify-center w-full md:justify-start items-center space-x-4 py-8 border-b border-gray-200">
                  <div className="flex justify-start items-start flex-col space-y-2">
                    <p className="text-base font-semibold leading-4 text-left text-gray-800">
                      {orderData.customer.name}
                    </p>
                    <p className="text-sm leading-5 text-gray-600">
                      {orderData.customer.email || "Không có email"}
                    </p>
                  </div>
                </div>
                <div className="flex justify-center text-gray-800 md:justify-start items-center space-x-4 py-4 border-b border-gray-200 w-full">
                  <p className="text-sm leading-5">
                    Address: {JSON.parse(orderData.shipping.shipping_detail).address_detail}, {JSON.parse(orderData.shipping.shipping_detail).address}
                  </p>
                </div>
                <div className="flex justify-center text-gray-800 md:justify-start items-center space-x-4 py-4 border-b border-gray-200 w-full">
                  <p className="text-sm leading-5">
                    Phone: {orderData.shipping.shipping_detail.phone_number || "Number not available"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
