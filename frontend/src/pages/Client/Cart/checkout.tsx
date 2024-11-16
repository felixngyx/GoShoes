import { useLocation } from "react-router-dom";
import AddressComponent from "../User/Address/Address";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useShipping } from "../../../hooks/client/useShipping";

const CheckoutPage = () => {
  const location = useLocation();

  // Lấy thông tin từ state
  const buyNowProduct = location.state?.productInfo;
  const cartItems = location.state?.cartItems;
  const cartOrderSummary = location.state?.orderSummary;

  // Tính toán thông tin đơn hàng
  const orderDetails = buyNowProduct
    ? {
        // Trường hợp mua ngay
        items: [
          {
            id: buyNowProduct.id,
            name: buyNowProduct.name,
            price: buyNowProduct.price,
            quantity: buyNowProduct.quantity,
            thumbnail: buyNowProduct.thumbnail,
            variant: buyNowProduct.variant,
            total: buyNowProduct.total,
          },
        ],
        subtotal: buyNowProduct.total,
        total: buyNowProduct.total,
      }
    : {
        // Trường hợp mua từ giỏ hàng
        items: cartItems || [],
        subtotal: cartOrderSummary?.subtotal || 0,
        total: cartOrderSummary?.total || 0,
      };

  const { address } = useShipping();

  const [showPopup, setShowPopup] = useState(false);

  const handleTogglePopup = () => {
    setShowPopup(!showPopup);
  };

  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showPopup]);
  return (
    <div className="max-w-7xl mx-auto lg:px-0 sm:px-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Left Section - Order Details */}
        <div className="md:col-span-7">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Order Details</h2>

            {/* Hiển thị danh sách sản phẩm */}
            <div className="space-y-4">
              {orderDetails.items.map((item: any) => (
                <div key={item.id} className="flex gap-4 border-b pb-4">
                  <img
                    src={item.thumbnail || item.product_variant?.image_variant}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      Size: {item.size || item.product_variant?.size.size}
                      <br />
                      Color: {item.color || item.product_variant?.color.color}
                    </p>
                    <div className="flex justify-between mt-2">
                      <span>Quantity: {item.quantity}</span>
                      <span className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${orderDetails.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total</span>
                <span>${orderDetails.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Payment Details */}

        <div className="md:col-span-5">
          {address
            .filter((item: any) => item.is_default)
            .map((item: any, index: number) => (
              <div
                key={index}
                className="w-full mx-auto rounded-lg bg-white border border-gray-200 p-3 text-gray-800 font-light mb-6 relative"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold">
                      {item.shipping_detail.name}
                    </span>{" "}
                    |{" "}
                    <span className="text-gray-600 font-semibold">
                      (+84) {item.shipping_detail.phone_number}
                    </span>
                    <div className="text-gray-500 space-x-3">
                      <p className="">{item.shipping_detail.address_detail}</p>
                    </div>
                    <div className="text-gray-500 space-x-3">
                      <p className="">{item.shipping_detail.address}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleTogglePopup}
                    className="absolute top-3 right-3 text-blue-500 hover:text-blue-400"
                  >
                    Change
                  </button>
                </div>
                <div className="inline-block border-2 border-blue-500 text-xs p-[0.15rem] text-blue-400">
                  default
                </div>

                {showPopup && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-5 max-w-lg w-full relative">
                      <button
                        onClick={handleTogglePopup}
                        className="absolute top-8 right-6 text-gray-500 hover:text-red-500"
                      >
                        <X />
                      </button>
                      <AddressComponent />
                    </div>
                  </div>
                )}
              </div>
            ))}

          <div className="w-full mx-auto rounded-lg bg-white border border-gray-200 text-gray-800 font-light mb-6">
            <div className="w-full p-3 border-b border-gray-200">
              <div className="mb-5">
                <label
                  htmlFor="type1"
                  className="flex items-center cursor-pointer"
                >
                  <input
                    type="radio"
                    className="form-radio h-5 w-5 text-indigo-500"
                    name="type"
                    id="type1"
                    defaultChecked
                  />
                  <img
                    src="https://leadershipmemphis.org/wp-content/uploads/2020/08/780370.png"
                    className="h-6 ml-3"
                  />
                </label>
              </div>
              <div>
                <div className="mb-3">
                  <label className="text-gray-600 font-semibold text-sm mb-2 ml-1">
                    Name on card
                  </label>
                  <div>
                    <input
                      className="w-full px-3 py-2 mb-1 border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 transition-colors"
                      placeholder="John Smith"
                      type="text"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="text-gray-600 font-semibold text-sm mb-2 ml-1">
                    Card number
                  </label>
                  <div>
                    <input
                      className="w-full px-3 py-2 mb-1 border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 transition-colors"
                      placeholder="0000 0000 0000 0000"
                      type="text"
                    />
                  </div>
                </div>
                <div className="mb-3 -mx-2 flex items-end">
                  <div className="px-2 w-1/4">
                    <label className="text-gray-600 font-semibold text-sm mb-2 ml-1">
                      Expiration date
                    </label>
                    <div>
                      <select className="form-select w-full px-3 py-2 mb-1 border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer">
                        <option value="01">01 - January</option>
                        <option value="02">02 - February</option>
                        <option value="03">03 - March</option>
                        <option value="04">04 - April</option>
                        <option value="05">05 - May</option>
                        <option value="06">06 - June</option>
                        <option value="07">07 - July</option>
                        <option value="08">08 - August</option>
                        <option value="09">09 - September</option>
                        <option value="10">10 - October</option>
                        <option value="11">11 - November</option>
                        <option value="12">12 - December</option>
                      </select>
                    </div>
                  </div>
                  <div className="px-2 w-1/4">
                    <select className="form-select w-full px-3 py-2 mb-1 border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer">
                      <option value={2020}>2020</option>
                      <option value={2021}>2021</option>
                      <option value={2022}>2022</option>
                      <option value={2023}>2023</option>
                      <option value={2024}>2024</option>
                      <option value={2025}>2025</option>
                      <option value={2026}>2026</option>
                      <option value={2027}>2027</option>
                      <option value={2028}>2028</option>
                      <option value={2029}>2029</option>
                    </select>
                  </div>
                  <div className="px-2 w-1/4">
                    <label className="text-gray-600 font-semibold text-sm mb-2 ml-1">
                      Security code
                    </label>
                    <div>
                      <input
                        className="w-full px-3 py-2 mb-1 border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 transition-colors"
                        placeholder="12"
                        type="text"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full p-3">
              <label
                htmlFor="type2"
                className="flex items-center cursor-pointer"
              >
                <input
                  type="radio"
                  className="form-radio h-5 w-5 text-indigo-500"
                  name="type"
                  id="type2"
                />
                <img
                  src="https://simg.zalopay.com.vn/zlp-website/assets/new_logo_6c5db2d21b.svg"
                  width={80}
                  className="ml-3"
                />
              </label>
            </div>
          </div>
          <div>
            <button className="block w-full max-w-xs mx-auto bg-indigo-500 hover:bg-indigo-700 focus:bg-indigo-700 text-white rounded-lg px-3 py-2 font-semibold">
              <i className="mdi mdi-lock-outline mr-1" /> PAY NOW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
