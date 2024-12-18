import { useLocation, useNavigate } from "react-router-dom";
import AddressComponent from "../User/Address/Address";
import { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { useShipping } from "../../../hooks/client/useShipping";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

import PageTitle from "../../../components/admin/PageTitle";

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
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [discountCode, setDiscountCode] = useState("");
  const [discountInfo, setDiscountInfo] = useState<any>(null);
  const [isCheckingDiscount, setIsCheckingDiscount] = useState(false);
  const [hasOrdered, setHasOrdered] = useState(false);
  const [showAddressSelection, setShowAddressSelection] = useState(false);

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
            quantity: Number(buyNowProduct.quantity),
            thumbnail: buyNowProduct.thumbnail,
            variant: {
              id: buyNowProduct.variant?.id,
              size: {
                size: buyNowProduct.variant?.size?.size,
                size_name: buyNowProduct.variant?.size?.size,
              },
              color: {
                color_id: buyNowProduct.variant?.color?.color_id,
                color_name: buyNowProduct.variant?.color?.color,
              },
            },
            total: buyNowProduct.price * Number(buyNowProduct.quantity),
          },
        ],
        subtotal: buyNowProduct.price * Number(buyNowProduct.quantity),
        total: buyNowProduct.price * Number(buyNowProduct.quantity),
      };
    } else if (cartItems?.length > 0) {
      return {
        items: cartItems.map((item) => ({
          ...item,
          price: Number(item.price),
          total: Number(item.price) * item.quantity,
        })),
        subtotal: cartOrderSummary?.subtotal || 0,
        total: cartOrderSummary?.total || 0,
      };
    } else if (buyAgainItems?.length > 0) {
      return {
        items: buyAgainItems.map((item: any) => {
          return {
            id: item.id,
            name: item.name,
            price: Number(item.price),
            quantity: item.quantity,
            thumbnail: item.thumbnail,
            total: item.total,
            product_variant: {
              variant_id: item.product_variant?.variant_id,
              size: item.product_variant?.size,
              color: item.product_variant?.color,
              size_id: item.product_variant?.size_id,
              color_id: item.product_variant?.color_id,
            },
            variant: {
              id: item.product_variant?.variant_id,
              size: {
                size: item.product_variant?.size_id,
                size_name: item.product_variant?.size,
              },
              color: {
                color_id: item.product_variant?.color_id,
                color_name: item.product_variant?.color,
              },
            },
          };
        }),
        subtotal: buyAgainItems.reduce(
          (sum: number, item) => sum + item.total,
          0
        ),
        total: buyAgainItems.reduce((sum: number, item) => sum + item.total, 0),
      };
    } else {
      return {
        items: [],
        subtotal: 0,
        total: 0,
      };
    }
  }, [buyNowProduct, cartItems, cartOrderSummary, buyAgainItems]);

  // Khởi tạo quantities từ orderDetails
  useEffect(() => {
    if (!orderDetails?.items?.length) return;

    const initialQuantities = orderDetails.items.reduce(
      (acc, item) => ({
        ...acc,
        [item.variant?.id || item.id]: item.quantity,
      }),
      {}
    );

    const hasChanged = Object.keys(initialQuantities).some(
      (key) => quantities[key] !== initialQuantities[key]
    );

    if (hasChanged) {
      setQuantities(initialQuantities);
    }
  }, [orderDetails.items]);

  // Thêm state để quản lý orderDetails
  const [orderState, setOrderState] = useState(orderDetails);

  // Tạo title từ orderDetails
  const pageTitle = useMemo(() => {
    if (orderState.items.length === 1) {
      return `Checkout | ${orderState.items[0].name}`;
    } else if (orderState.items.length > 1) {
      return `Checkout | ${orderState.items[0].name} and ${orderState.items.length - 1
        } other items`;
    }
    return "Checkout";
  }, [orderState.items]);

  // Cập nhật hàm handleQuantityChange
  const handleQuantityChange = async (
    variantId: number,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;
  
    let newSubtotal = 0;
  
    const updatedItems = orderState.items.map((item) => {
      if (item.variant?.id === variantId || item.id === variantId) {
        const updatedTotal = item.price * newQuantity;
        newSubtotal += updatedTotal;
        return {
          ...item,
          quantity: newQuantity,
          total: updatedTotal,
        };
      }
      newSubtotal += item.total;
      return item;
    });
  
    setOrderState((prev) => ({
      ...prev,
      items: updatedItems,
      subtotal: newSubtotal,
      total: newSubtotal,
    }));
  
    setQuantities((prev) => ({
      ...prev,
      [variantId]: newQuantity,
    }));
  
    if (discountCode && discountInfo) {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/discounts/apply`,
          {
            code: discountCode,
            total_amount: newSubtotal,
            product_ids: orderState.items.map(
              (item) => item.id || item.product_id
            ),
          },
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("access_token")}`,
            },
          }
        );
  
        if (response.data.status) {
          setDiscountInfo(response.data.data);
        }
      } catch (error) {
        console.error("Failed to update discount:", error);
      }
    }
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
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Di chuyển defaultAddress ra ngoài thành một memo riêng
  const defaultAddress = useMemo(() => {
    if (!Array.isArray(address) || address.length === 0) return null;
    return address.find((item: any) => item.is_default) || null;
  }, [address]);

  // Bỏ useEffect polling và thêm hàm kiểm tra giá
  const checkPriceAndStock = async () => {
    try {
      const checkPromises = orderState.items.map(async (item) => {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/products/${item.id || item.product_id}`
        );
        return response.data.data;
      });

      const currentProducts = await Promise.all(checkPromises);

      let hasChanges = false;
      const updatedItems = orderState.items.map((item, index) => {
        const currentProduct = currentProducts[index];
        const currentPrice = Number(currentProduct.promotional_price || currentProduct.price);
        const itemPrice = Number(item.price);

        if (Math.abs(currentPrice - itemPrice) > 0.01) {
          hasChanges = true;
          return {
            ...item,
            price: currentProduct.price,
            promotional_price: currentProduct.promotional_price,
            total: item.quantity * (currentProduct.promotional_price || currentProduct.price)
          };
        }
        return item;
      });

      return { hasChanges, updatedItems };
    } catch (error) {
      console.error("Error checking prices:", error);
      throw error;
    }
  };

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      setHasOrdered(true);

      if (!defaultAddress || !defaultAddress.id) {
        toast.error("Please select a shipping address");
        setHasOrdered(false);
        setIsLoading(false);
        return;
      }

      // Kiểm tra giá trước khi đặt hàng
      const { hasChanges, updatedItems } = await checkPriceAndStock();

      if (hasChanges) {
        const willContinue = window.confirm(
          "Giá của một số sản phẩm đã thay đổi. Bạn có muốn tiếp tục đặt hàng với giá mới không?"
        );

        if (willContinue) {
          // Cập nhật state với giá mới
          setOrderState(prev => ({
            ...prev,
            items: updatedItems,
            subtotal: updatedItems.reduce((sum, item) => sum + item.total, 0)
          }));

          toast.info("Prices have been updated. Please review your order.", {
            duration: 5000,
          });
          setIsLoading(false);
          setHasOrdered(false);
          return;
        } else {
          navigate('/cart');
          return;
        }
      }

      // Tiếp tục xử lý đặt hàng nếu giá không thay đổi hoặc người dùng đồng ý với giá mới
      const requestData = {
        items: orderState.items.map((item) => ({
          product_id: Number(item.id || item.product_id),
          quantity: Number(item.quantity),
          ...((item.variant?.id || item.product_variant?.variant_id) && {
            variant_id: Number(item.variant?.id || item.product_variant?.variant_id),
          }),
        })),
        shipping_id: Number(defaultAddress.id),
        payment_method_id: Number(paymentMethod),
        ...(discountInfo?.discount_info?.code && {
          discount_code: discountInfo.discount_info.code,
        }),
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/orders`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        if (paymentMethod === 1) {
          // ZaloPay
          const finalAmount = orderState.subtotal - calculateDiscount();
          if (finalAmount > 0 && response.data.payment_url) {
            const willRedirect = window.confirm(
              "Đơn hàng của bạn đã được tạo. Bạn có muốn chuyển đến trang thanh toán không?"
            );

            if (willRedirect) {
              window.location.href = response.data.payment_url;
            } else {
              toast.success("Đơn hàng của bạn đã được tạo");
              navigate("/account/my-order", {
                replace: true,
                state: {
                  message: "Order created! Please complete payment within 24 hours.",
                },
              });
            }
          }
        } else {
          // COD
          toast.success("Đăt hàng thành công!");
          navigate("/account/my-order", {
            replace: true,
            state: { message: "Đặt hàng thành công" },
          });
        }
      }
    } catch (error: any) {
      setHasOrdered(false);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Có lỗi xảy ra khi đặt hàng");
      }
      console.error("Order error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sửa lại hàm handleConfirmOrder
  const handleConfirmOrder = () => {
    if (!isTermsAccepted) {
      alert("Please accept the terms and conditions");
      return;
    }

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
          product_ids: orderState.items.map(
            (item) => item.id || item.product_id
          ),
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("access_token")}`,
          },
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
    setDiscountCode("");
    setDiscountInfo(null);
  };

  // Sửa lại phần hiển th discount
  const calculateDiscount = () => {
    if (discountInfo?.discount_info) {
      const percent = parseFloat(discountInfo.discount_info.percent);
      const subtotal = orderState.subtotal;
      // Tính toán số tiền giảm dựa trên phần trăm và tổng tiền hiện tại
      const discountAmount = (subtotal * percent) / 100;
      return discountAmount;
    }
    return 0;
  };

  // Kiểm tra địa chỉ mặc định khi component mount
  useEffect(() => {
    if (!isLoadingAddress) {
      if (!Array.isArray(address) || address.length === 0) {
        // Nếu không có địa chỉ nào
        setShowAddressForm(true);
        toast("Please add a shipping address to continue", {
          duration: 5000,
          position: "top-right",
          icon: "⚠️",
          style: {
            background: "#FEF3C7",
            color: "#92400E",
            border: "1px solid #F59E0B",
          },
        });
      } else if (!address.some((item: any) => item.is_default)) {
        // Nếu có địa chỉ nhưng không có địa chỉ mặc định
        setShowAddressSelection(true);
        toast("Please select a default shipping address to continue", {
          duration: 5000,
          position: "top-right",
          icon: "⚠️",
          style: {
            background: "#FEF3C7",
            color: "#92400E",
            border: "1px solid #F59E0B",
          },
        });
      }
    }
  }, [address, isLoadingAddress]);

  // Thêm component hiển thị chọn địa chỉ mặc định
  const AddressSelectionModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <h2 className="text-xl font-semibold mb-4">Chọn Địa Chỉ Mặc Định</h2>
          <p className="text-gray-600 mb-4">
            Vui lòng chọn địa chỉ giao hàng mặc định để tiếp tục đặt hàng.
          </p>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {address.map((item: any, index: number) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:border-blue-500 cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{item.shipping_detail.name}</p>
                    <p className="text-gray-600">
                      (+84) {item.shipping_detail.phone_number}
                    </p>
                    <p className="text-gray-600">
                      {item.shipping_detail.address_detail}
                    </p>
                    <p className="text-gray-600">
                      {item.shipping_detail.address}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await axios.put(
                          `${import.meta.env.VITE_API_URL}/shipping/${item.id}`,
                          {
                            name: item.shipping_detail.name,
                            phone_number: item.shipping_detail.phone_number,
                            address: item.shipping_detail.address,
                            address_detail: item.shipping_detail.address_detail,
                            is_default: true,
                          },
                          {
                            headers: {
                              Authorization: `Bearer ${Cookies.get(
                                "access_token"
                              )}`,
                            },
                          }
                        );
                        toast.success("Cập nhật địa chỉ mặc định thành công");
                        setShowAddressSelection(false);
                        window.location.reload();
                      } catch (error) {
                        toast.error("Cập nhật địa chỉ mặc định thất bại");
                      }
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Đặt làm mặc định
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end gap-4">
            <button
              onClick={() => setShowAddressForm(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Thêm Địa Chỉ Mới
            </button>
          </div>
        </div>
      </div>
    );
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

  // Component hiển thị form thêm địa chỉ
  const AddressFormModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <h2 className="text-xl font-semibold mb-4">Thêm Địa Chỉ Mới</h2>
          <p className="text-gray-600 mb-4">
            Vui lòng thêm địa chỉ giao hàng để tiếp tục đặt hàng.
          </p>

          {/* Thêm component AddressForm của bạn vào ở đây */}
          <AddressComponent onSuccess={handleAddressAdded} />

          {/* Nút đóng form nếu có địa chỉ khác */}
          {address && address.length > 0 && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowAddressForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Hủy
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto lg:px-0 sm:px-6 mb-6">
      {/* Thêm PageTitle component */}
      <PageTitle title={pageTitle} />

      {/* Chỉ hiện modal khi không đang loading v thỏa điều kiện */}
      {!isLoadingAddress && showAddressForm && <AddressFormModal />}
      {!isLoadingAddress && showAddressSelection && !showAddressForm && (
        <AddressSelectionModal />
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Left Section - Order Details */}
        <div className="md:col-span-7">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Chi tiết đơn hàng</h2>

            {/* Hiển thị danh sách sản phẩm */}
            <div className="space-y-4">
              {orderState.items.map((item: any) => (
                <div
                  key={item.variant?.id || item.id}
                  className="flex gap-4 border-b pb-4"
                >
                  <img
                    src={item.thumbnail}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    {(item.variant || item.product_variant) && (
                      <p className="text-sm text-gray-500">
                        Kích thước:{" "}
                        {item.variant?.size?.size_name ||
                          item.variant?.size?.size ||
                          item.product_variant?.size}
                        <br />
                        Màu sắc:{" "}
                        {item.variant?.color?.color_name ||
                          item.variant?.color?.color ||
                          item.product_variant?.color}
                      </p>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.variant?.id || item.id,
                              quantities[item.variant?.id || item.id] - 1
                            )
                          }
                          className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">
                          {quantities[item.variant?.id || item.id]}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.variant?.id || item.id,
                              quantities[item.variant?.id || item.id] + 1
                            )
                          }
                          className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-medium">
                        {formatVND(
                          item.price * quantities[item.variant?.id || item.id]
                        )}
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
                  placeholder="Nhập mã giảm giá"
                  disabled={isCheckingDiscount || discountInfo}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                {discountInfo ? (
                  <button
                    onClick={handleRemoveDiscount}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
                  >
                    Xóa
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
                      "Áp dụng"
                    )}
                  </button>
                )}
              </div>

              {/* Hiển thị thông tin giảm giá */}
              {discountInfo && (
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Mã: {discountInfo.discount_info.code}</p>
                  <p>Giảm giá: {discountInfo.discount_info.percent}%</p>
                  <p>
                    Hạn sử dụng:{" "}
                    {new Date(
                      discountInfo.discount_info.valid_to
                    ).toLocaleDateString()}
                  </p>
                  <p>
                    Số lần sử dụng còn lại: {discountInfo.discount_info.remaining_uses}
                  </p>
                </div>
              )}

              <div className="mt-6 space-y-2">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span>{formatVND(orderState.subtotal)}</span>
                </div>

                {discountInfo && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      Giảm giá ({discountInfo.discount_info.percent}%)
                    </span>
                    <span>-{formatVND(calculateDiscount())}</span>
                  </div>
                )}

                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Tổng cộng</span>
                  <span>
                    {formatVND(orderState.subtotal - calculateDiscount())}
                  </span>
                </div>
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
                    Thay đổi
                  </button>
                </div>
                <div className="inline-block border-2 border-blue-500 text-xs p-[0.15rem] text-blue-400">
                  mặc định
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
            <div className="w-full p-3">
              <label
                htmlFor="cod"
                className="flex items-center cursor-pointer mb-4"
              >
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
                  <span className="font-semibold">Thanh toán khi nhận hàng</span>
                  <p className="text-sm text-gray-500">
                    Thanh toán bằng tiền mặt khi nhận hàng
                  </p>
                </div>
              </label>

              <label
                htmlFor="zalopay"
                className="flex items-center cursor-pointer"
              >
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
            <h3 className="font-semibold text-lg mb-4">Tóm tắt đơn hàng</h3>

            <div className="space-y-4">
              <div className="border-b pb-4">
                <h4 className="font-medium mb-2">Địa chỉ giao hàng</h4>
                <p className="text-gray-600">
                  {
                    address.find((item: any) => item.is_default)
                      ?.shipping_detail.name
                  }
                  <br />
                  {
                    address.find((item: any) => item.is_default)
                      ?.shipping_detail.phone_number
                  }
                  <br />
                  {
                    address.find((item: any) => item.is_default)
                      ?.shipping_detail.address_detail
                  }
                  <br />
                  {
                    address.find((item: any) => item.is_default)
                      ?.shipping_detail.address
                  }
                </p>
              </div>

              <div className="border-b pb-4">
                <h4 className="font-medium mb-2">Phương thức thanh toán</h4>
                <p className="text-gray-600">
                  {paymentMethod === 1 ? "ZaloPay" : "Thanh toán khi nhận hàng"}
                </p>
              </div>

              <div className="border-b pb-4">
                <h4 className="font-medium mb-2">Sản phẩm</h4>
                {orderState.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm text-gray-600 mb-2"
                  >
                    <span>
                      {item.quantity}x {item.name}
                      {(item.variant || item.product_variant) && (
                        <span className="text-gray-500">
                          {" "}
                          (
                          {[
                            item.variant?.color?.color_name ||
                            item.product_variant?.color,
                            item.variant?.size?.size_name ||
                            item.product_variant?.size,
                          ]
                            .filter(Boolean)
                            .join("/")}
                          )
                        </span>
                      )}
                    </span>
                    <span>{formatVND(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span>{formatVND(orderState.subtotal)}</span>
                </div>

                {discountInfo && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      Giảm giá ({discountInfo.discount_info.percent}%)
                    </span>
                    <span>-{formatVND(calculateDiscount())}</span>
                  </div>
                )}

                <div className="flex justify-between font-semibold text-lg pt-2">
                  <span>Tổng cộng</span>
                  <span>
                    {formatVND(orderState.subtotal - calculateDiscount())}
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
                  Tôi đồng ý với{" "}
                  <a href="#" className="text-indigo-500 hover:text-indigo-600">
                    Điều khoản và Điều kiện
                  </a>{" "}
                  và xác nhận rằng tất cả thông tin trên là chính xác
                </span>
              </label>
            </div>
          </div>
          <div>
            <button
              onClick={handleConfirmOrder}
              disabled={isLoading || !isTermsAccepted}
              className={`block w-full max-w-xs mx-auto ${isLoading || !isTermsAccepted
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-500 hover:bg-indigo-700"
                } focus:bg-indigo-700 text-white rounded-lg px-3 py-2 font-semibold relative`}
            >
              {isLoading ? (
                <>
                  <span className="opacity-0">ĐẶT HÀNG</span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </>
              ) : (
                "ĐẶT HÀNG"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
