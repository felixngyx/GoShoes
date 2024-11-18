import { useLocation, useNavigate } from "react-router-dom";
import AddressComponent from "../User/Address/Address";
import { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { useShipping } from "../../../hooks/client/useShipping";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { address, isLoading: isLoadingAddress } = useShipping();
  
  const [showPopup, setShowPopup] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [showOrderConfirm, setShowOrderConfirm] = useState(false);
  const [quantities, setQuantities] = useState<{[key: string]: number}>({});
  const [discountCode, setDiscountCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState<any>(null);
  const [isCheckingDiscount, setIsCheckingDiscount] = useState(false);
  const [hasOrdered, setHasOrdered] = useState(false);
  
  const buyNowProduct = location.state?.productInfo;
  const cartItems = location.state?.cartItems;
  const cartOrderSummary = location.state?.orderSummary;
  const buyAgainItems = location.state?.items;
  
  const [buyNowState, setBuyNowState] = useState(buyNowProduct);
  
  // Tính toán thông tin đơn hàng
  const orderDetails = useMemo(() => {
    if (buyNowProduct) {
      return {
        items: [
          {
            id: buyNowProduct.id,
            name: buyNowProduct.name,
            price: buyNowProduct.price,
            quantity: buyNowProduct.quantity,
            thumbnail: buyNowProduct.thumbnail,
            variant: buyNowProduct.variant,
            total: buyNowProduct.total,
            size: buyNowProduct.variant?.size?.size,
            color: buyNowProduct.variant?.color?.color
          },
        ],
        subtotal: buyNowProduct.total,
        total: buyNowProduct.total,
      };
    } else if (cartItems?.length > 0) {
      return {
        items: cartItems.map(item => ({
          ...item,
          price: Number(item.price),
          total: Number(item.price) * item.quantity
        })),
        subtotal: cartOrderSummary?.subtotal || 0,
        total: cartOrderSummary?.total || 0
      };
    } else {
      return {
        items: [],
        subtotal: 0,
        total: 0
      };
    }
  }, [buyNowProduct, cartItems, cartOrderSummary]);

  console.log(address);

  // Khởi tạo quantities từ orderDetails
  useEffect(() => {
    if (!orderDetails?.items?.length) return;
    
    const initialQuantities = orderDetails.items.reduce((acc, item) => ({
      ...acc,
      [item.id]: item.quantity
    }), {});
    
    // Kiểm tra nếu quantities đã thay đổi
    const hasChanged = Object.keys(initialQuantities).some(
      key => quantities[key] !== initialQuantities[key]
    );
    
    if (hasChanged) {
      setQuantities(initialQuantities);
    }
  }, [orderDetails.items]); // Chỉ phụ thuộc vào items

  // Thêm state để quản lý orderDetails
  const [orderState, setOrderState] = useState(orderDetails);

  // Cập nhật hàm handleQuantityChange
  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    // Xử lý cho trường hợp mua ngay
    if (buyNowState) {
      const newTotal = buyNowState.price * newQuantity;
      setBuyNowState(prev => ({
        ...prev,
        quantity: newQuantity,
        total: newTotal
      }));

      setOrderState(prev => ({
        ...prev,
        items: [{
          ...prev.items[0],
          quantity: newQuantity,
          total: newTotal
        }],
        subtotal: newTotal,
        total: newTotal
      }));

      setQuantities(prev => ({
        ...prev,
        [itemId]: newQuantity
      }));
      return;
    }

    // Xử lý cho trường hợp giỏ hàng
    const updatedItems = orderState.items.map(item => {
      if (item.id === itemId) {
        const updatedTotal = item.price * newQuantity;
        return {
          ...item,
          quantity: newQuantity,
          total: updatedTotal
        };
      }
      return item;
    });

    const newSubtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);

    setQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity
    }));

    setOrderState(prev => ({
      ...prev,
      items: updatedItems,
      subtotal: newSubtotal,
      total: newSubtotal
    }));
  };

  const handleTogglePopup = () => {
    setShowPopup(!showPopup);
  };

  useEffect(() => {
    document.body.style.overflow = showPopup ? "hidden" : "auto";
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

  // Di chuyển defaultAddress ra ngoài thành một memo riêng
  const defaultAddress = useMemo(() => {
    if (!Array.isArray(address) || address.length === 0) return null;
    return address.find((item: any) => item.is_default) || null;
  }, [address]);

  // Cập nhật hàm handleCheckout
  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      setHasOrdered(true);
      
      const shipping_id = defaultAddress?.id;

      if (!shipping_id) {
        toast.error("Please select a shipping address");
        setHasOrdered(false);
        return;
      }

      const items = orderState.items.map((item: any) => ({
        product_id: item.id || item.product_id,
        quantity: item.quantity,
        variant_id: item.variant?.id || item.product_variant?.id
      }));

      // Tạo checkoutData mà không có discount_code mặc định
      const checkoutData = {
        items,
        shipping_id,
        payment_method_id: paymentMethod,
      };

      // Chỉ thêm discount_code nếu đã áp dụng mã giảm giá thành công
      if (discountInfo?.discount_info?.code) {
        checkoutData.discount_code = discountInfo.discount_info.code;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/orders`, 
        checkoutData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('access_token')}`
          }
        }
      );

      // Xử lý response thành công
      if (paymentMethod === 1) {
        if (response.data.payment_url) {
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

    } catch (error: any) {
      setHasOrdered(false);
      setIsLoading(false);

      // Xử lý lỗi từ backend
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        
        // Kiểm tra nếu là lỗi về số lượng tồn kho
        if (errorMessage.includes("không đủ") || errorMessage.includes("còn")) {
          // Định dạng lại thông báo lỗi từ backend
          const productName = errorMessage.match(/'([^']+)'/)?.[1] || 'Product';
          const availableQty = errorMessage.match(/\d+/)?.[0] || '0';
          
          // Tìm sản phẩm trong orderState
          const requestedItem = orderState.items.find(
            item => item.name === productName || item.product?.name === productName
          );
          
          // Lấy thông tin về size và color
          const size = requestedItem?.size || 
                       requestedItem?.variant?.size?.size || 
                       requestedItem?.product_variant?.size?.size;
          const color = requestedItem?.color || 
                        requestedItem?.variant?.color?.color || 
                        requestedItem?.product_variant?.color?.color;
          
          // Tạo thông báo với thông tin chi tiết về variant
          const variantInfo = size && color ? ` (${color}/${size})` : '';
          const message = `${productName}${variantInfo} is out of stock`;
            
          toast.error(message, {
            position: "top-right",
            duration: 5000
          });
        } else if (errorMessage.includes("hết hàng")) {
          // Xử lý trường hợp sản phẩm hết hàng
          const productName = errorMessage.match(/'([^']+)'/)?.[1] || 'Product';
          const requestedItem = orderState.items.find(
            item => item.name === productName || item.product?.name === productName
          );
          
          // Lấy thông tin về size và color
          const size = requestedItem?.size || 
                       requestedItem?.variant?.size?.size || 
                       requestedItem?.product_variant?.size?.size;
          const color = requestedItem?.color || 
                        requestedItem?.variant?.color?.color || 
                        requestedItem?.product_variant?.color?.color;
          
          // Tạo thông báo với thông tin chi tiết về variant
          const variantInfo = size && color ? ` (${color}/${size})` : '';
          const message = `${productName}${variantInfo} is out of stock`;
            
          toast.error(message, {
            position: "top-right",
            duration: 5000
          });
        } else {
          // Các lỗi khác
          toast.error(errorMessage, {
            position: "top-right",
            duration: 3000
          });
        }
      } else {
        // Thông báo lỗi mặc định
        toast.error("Something went wrong. Please try again later.", {
          position: "top-right", 
          duration: 3000
        });
      }
      console.error("Order error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmOrder = () => {
    if (!isTermsAccepted) {
      alert("Please accept the terms and conditions");
      return;
    }

    // Không cần check discount code nữa, chỉ cần gọi handleCheckout
    handleCheckout();
  };

  // Sửa lại hàm handleCheckDiscount
  const handleCheckDiscount = async () => {
    // Nếu không có mã giảm giá, return luôn không cần thông báo lỗi
    if (!discountCode.trim()) {
      return;
    }

    try {
      setIsCheckingDiscount(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/discounts/apply`,
        {
          code: discountCode,
          total_amount: orderState.subtotal,
          product_ids: orderState.items.map(item => item.id || item.product_id)
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('access_token')}`
          }
        }
      );

      if (response.data.status) {
        setDiscountInfo(response.data.data);
        toast.success("Discount code applied successfully!");
      }

    } catch (error: any) {
      setDiscountInfo(null);
      // Chỉ hiển thị thông báo lỗi khi người dùng thực sự nhập mã
      if (discountCode.trim()) {
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Failed to apply discount code");
        }
      }
    } finally {
      setIsCheckingDiscount(false);
    }
  };

  // Thêm hàm remove discount
  const handleRemoveDiscount = () => {
    setDiscountCode('');
    setDiscountInfo(null);
  };

  // Thêm loading state
  if (isLoadingAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Thêm callback để xử lý sau khi thêm địa chỉ thành công
  const handleAddressAdded = () => {
    setShowAddressForm(false); // Đóng form thêm địa chỉ
    window.location.reload(); // Refresh lại trang để lấy địa chỉ mới
  };

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
                      Size: {item.size || item.variant?.size?.size || item.product_variant?.size?.size}
                      <br />
                      Color: {item.color || item.variant?.color?.color || item.product_variant?.color?.color}
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
              <div className="flex gap-2">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="Enter discount code"
                  disabled={isCheckingDiscount || discountInfo}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                {discountInfo ? (
                  <button
                    onClick={handleRemoveDiscount}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={handleCheckDiscount}
                    disabled={isCheckingDiscount}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 disabled:bg-blue-400"
                  >
                    {isCheckingDiscount ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Apply'
                    )}
                  </button>
                )}
              </div>

              {/* Hiển thị thông tin giảm giá */}
              {discountInfo && (
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Code: {discountInfo.discount_info.code}</p>
                  <p>Discount: {discountInfo.discount_info.percent}%</p>
                  <p>Valid until: {new Date(discountInfo.discount_info.valid_to).toLocaleDateString()}</p>
                  <p>Uses remaining: {discountInfo.discount_info.remaining_uses}</p>
                </div>
              )}

              <div className="mt-6 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatVND(orderState.subtotal)}</span>
                </div>
                
                {discountInfo && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatVND(discountInfo.discount_amount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>
                    {formatVND(discountInfo ? discountInfo.final_amount : orderState.total)}
                  </span>
                </div>
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
                        <AddressComponent onAddressAdded={handleAddressAdded} />
                      </div>
                    </div>
                  )}
                </div>
              ))
          ) : (
            <div className="w-full mx-auto rounded-lg bg-white border border-gray-200 p-3 text-gray-800 font-light mb-6">
              <p className="text-center">Không có địa chỉ mặc định</p>
              <button
                onClick={() => setShowAddressForm(true)}
                className="w-full mt-2 text-blue-500 hover:text-blue-400"
              >
                Thêm địa chỉ mới
              </button>
            </div>
          )}

          {/* Form thêm địa chỉ mới */}
          {showAddressForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-5 max-w-lg w-full relative">
                <button
                  onClick={() => setShowAddressForm(false)}
                  className="absolute top-8 right-6 text-gray-500 hover:text-red-500"
                >
                  <X />
                </button>
                <AddressComponent 
                  isPopup={true} 
                  onAddressAdded={handleAddressAdded}
                />
              </div>
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
                    <span>
                      {item.quantity}x {item.name}
                      {(item.size || item.color) && (
                        <span className="text-gray-500">
                          {' '}
                          ({[item.color, item.size].filter(Boolean).join('/')})
                        </span>
                      )}
                    </span>
                    <span>{formatVND(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatVND(orderState.subtotal)}</span>
                </div>

                {discountInfo && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discountInfo.discount_info.percent}%)</span>
                    <span>-{formatVND(discountInfo.discount_amount)}</span>
                  </div>
                )}

                <div className="flex justify-between font-semibold text-lg pt-2">
                  <span>Total</span>
                  <span>
                    {formatVND(discountInfo ? discountInfo.final_amount : orderState.total)}
                  </span>
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
