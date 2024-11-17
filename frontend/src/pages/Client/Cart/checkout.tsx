import { useLocation, useNavigate } from "react-router-dom";
import AddressComponent from "../User/Address/Address";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useShipping } from "../../../hooks/client/useShipping";
import axios from "axios";
import Cookies from "js-cookie";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

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

  const { address, isLoading: isLoadingAddress } = useShipping();

  console.log(address);

  const [showPopup, setShowPopup] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(2); // Default to COD (id: 2)
  const [isLoading, setIsLoading] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [showOrderConfirm, setShowOrderConfirm] = useState(false);

  // Thêm state để quản lý số lượng
  const [quantities, setQuantities] = useState<{[key: string]: number}>({});

  // Khởi tạo quantities từ orderDetails
  useEffect(() => {
    const initialQuantities = orderDetails.items.reduce((acc, item) => ({
      ...acc,
      [item.id]: item.quantity
    }), {});
    setQuantities(initialQuantities);
  }, [orderDetails.items]);

  // Thêm state để quản lý orderDetails
  const [orderState, setOrderState] = useState(orderDetails);

  // Cập nhật hàm handleQuantityChange
  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    // Cập nhật lại tổng tiền
    const updatedItems = orderState.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity: newQuantity, // Sử dụng newQuantity trực tiếp
          total: item.price * newQuantity
        };
      }
      return item;
    });

    // Tính tổng tiền dựa trên newQuantity cho item hiện tại
    const newSubtotal = updatedItems.reduce((sum, item) => {
      if (item.id === itemId) {
        return sum + (item.price * newQuantity);
      }
      return sum + (item.price * item.quantity);
    }, 0);

    // Cập nhật cả hai state
    setQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity
    }));

    setOrderState({
      ...orderState,
      items: updatedItems,
      subtotal: newSubtotal,
      total: newSubtotal
    });
  };

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

  // Thêm hàm format tiền VND
  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Thêm state để lưu trạng thái đã thanh toán
  const [hasOrdered, setHasOrdered] = useState(false);

  // Cập nhật hàm handleCheckout
  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      setHasOrdered(true); // Đánh dấu đã thanh toán

      const defaultAddress = address.find((item: any) => item.is_default);
      const shipping_id = defaultAddress?.id;

      if (!shipping_id) {
        alert("Please select a shipping address");
        return;
      }

      const items = orderState.items.map((item: any) => ({
        product_id: item.id || item.product_id,
        quantity: item.quantity,
        variant_id: item.variant?.id || item.product_variant?.id
      }));

      const checkoutData = {
        items,
        shipping_id,
        payment_method_id: paymentMethod
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/orders`, 
        checkoutData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('access_token')}`
          }
        }
      );

      if (paymentMethod === 1) {
        if (response.data.payment_url) {
          // Lưu trạng thái vào sessionStorage trước khi redirect
          sessionStorage.setItem('hasOrdered', 'true');
          window.location.href = response.data.payment_url;
        } else {
          throw new Error("Payment URL not found");
        }
      } else {
        navigate("/account/orders", { 
          replace: true,
          state: { message: "Order placed successfully!" }
        });
      }

    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to place order. Please try again.");
      setHasOrdered(false); // Reset trạng thái nếu có lỗi
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmOrder = () => {
    if (!isTermsAccepted) {
      alert("Please accept the terms and conditions");
      return;
    }
    handleCheckout();
  };

  // Cập nhật useEffect kiểm tra redirect
  useEffect(() => {
    // Kiểm tra nếu đã thanh toán (từ sessionStorage)
    const orderStatus = sessionStorage.getItem('hasOrdered');
    
    if (orderStatus === 'true') {
      // Xóa trạng thái và redirect
      sessionStorage.removeItem('hasOrdered');
      navigate("/account/my-order", { replace: true });
      return;
    }

    // Kiểm tra điều kiện redirect thông thường
    if (!location.state?.productInfo && !location.state?.cartItems) {
      navigate('/', { replace: true });
    }
  }, [location.state, navigate]);

  // Thêm kiểm tra trong return
  if (!location.state?.productInfo && !location.state?.cartItems) {
    return null; // Tránh render component khi đang redirect
  }

  // Thêm loading state
  if (isLoadingAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto lg:px-0 sm:px-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Left Section - Order Details */}
        <div className="md:col-span-7">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Order Details</h2>

            {/* Hiển thị danh sách sản phẩm */}
            <div className="space-y-4">
              {orderState.items.map((item: any) => (
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
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleQuantityChange(item.id, quantities[item.id] - 1)}
                          className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{quantities[item.id]}</span>
                        <button 
                          onClick={() => handleQuantityChange(item.id, quantities[item.id] + 1)}
                          className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-medium">
                        {formatVND(item.price * quantities[item.id])}
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
                <span>{formatVND(orderState.subtotal)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total</span>
                <span>{formatVND(orderState.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Payment Details */}

        <div className="md:col-span-5">
          {address && address.length > 0 ? (
            address
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
              ))
          ) : (
            <div className="w-full mx-auto rounded-lg bg-white border border-gray-200 p-3 text-gray-800 font-light mb-6">
              <p className="text-center">Không có địa chỉ mặc định</p>
              <button
                onClick={handleTogglePopup}
                className="w-full mt-2 text-blue-500 hover:text-blue-400"
              >
                Thêm địa chỉ mới
              </button>
            </div>
          )}

          <div className="w-full mx-auto rounded-lg bg-white border border-gray-200 text-gray-800 font-light mb-6">
            <div className="w-full p-3">
              <label htmlFor="cod" className="flex items-center cursor-pointer mb-4">
                <input
                  type="radio"
                  className="form-radio h-5 w-5 text-indigo-500"
                  name="paymentMethod"
                  id="cod"
                  value={2}
                  checked={paymentMethod === 2}
                  onChange={(e) => setPaymentMethod(Number(e.target.value))}
                  defaultChecked
                />
                <div className="ml-3">
                  <span className="font-semibold">Cash On Delivery</span>
                  <p className="text-sm text-gray-500">Pay with cash upon delivery</p>
                </div>
              </label>

              <label htmlFor="zalopay" className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  className="form-radio h-5 w-5 text-indigo-500"
                  name="paymentMethod"
                  id="zalopay"
                  value={1}
                  checked={paymentMethod === 1}
                  onChange={(e) => setPaymentMethod(Number(e.target.value))}
                />
                <img
                  src="https://simg.zalopay.com.vn/zlp-website/assets/new_logo_6c5db2d21b.svg"
                  width={80}
                  className="ml-3"
                />
              </label>
            </div>
          </div>
          <div className="w-full mx-auto rounded-lg bg-white border border-gray-200 p-6 mb-6">
            <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
            
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h4 className="font-medium mb-2">Delivery Address</h4>
                <p className="text-gray-600">
                  {address.find((item: any) => item.is_default)?.shipping_detail.name}<br />
                  {address.find((item: any) => item.is_default)?.shipping_detail.phone_number}<br />
                  {address.find((item: any) => item.is_default)?.shipping_detail.address_detail}<br />
                  {address.find((item: any) => item.is_default)?.shipping_detail.address}
                </p>
              </div>

              <div className="border-b pb-4">
                <h4 className="font-medium mb-2">Payment Method</h4>
                <p className="text-gray-600">
                  {paymentMethod === 1 ? 'ZaloPay' : 'Cash On Delivery'}
                </p>
              </div>

              <div className="border-b pb-4">
                <h4 className="font-medium mb-2">Order Items</h4>
                {orderState.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{item.quantity}x {item.name}</span>
                    <span>{formatVND(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatVND(orderState.subtotal)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2">
                  <span>Total</span>
                  <span>{formatVND(orderState.total)}</span>
                </div>
              </div>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="mt-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTermsAccepted}
                  onChange={(e) => setIsTermsAccepted(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-indigo-500"
                />
                <span className="text-sm text-gray-600">
                  I agree to the <a href="#" className="text-indigo-500 hover:text-indigo-600">Terms and Conditions</a> and confirm that all the information above is correct
                </span>
              </label>
            </div>
          </div>
          <div>
            <button 
              onClick={handleConfirmOrder}
              disabled={isLoading || !isTermsAccepted}
              className={`block w-full max-w-xs mx-auto ${
                isLoading || !isTermsAccepted
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-500 hover:bg-indigo-700'
              } focus:bg-indigo-700 text-white rounded-lg px-3 py-2 font-semibold relative`}
            >
              {isLoading ? (
                <>
                  <span className="opacity-0">PLACE ORDER</span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </>
              ) : (
                'PLACE ORDER'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
