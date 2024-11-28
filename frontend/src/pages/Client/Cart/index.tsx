/* eslint-disable */
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import {
  FiCreditCard,
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiTrash2,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import useCart from "../../../hooks/client/useCart";
import toast from "react-hot-toast";
import { removeFromCart } from "../../../hooks/client/cartSlice";
import { useDispatch } from "react-redux";

const CartSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto lg:px-0 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>

              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex items-center space-x-4 p-6 rounded-lg bg-gray-50 mb-4"
                >
                  <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>

                  <div className="w-32 h-32 bg-gray-200 rounded animate-pulse"></div>

                  <div className="flex-1">
                    <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="flex items-center space-x-2 mt-4">
                      <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-20">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-6"></div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="h-12 w-full bg-gray-200 rounded animate-pulse mt-6"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItemsWithSelected,
    isLoading,
    error,
    orderSummary,
    allSelected,
    setCartItemsWithSelected,
    toggleSelectItem,
    toggleSelectAll,
    deleteProductFromCart,
    handleQuantityChange,
    handleDeleteFromCart,
  } = useCart();

  useEffect(() => {
    setCartItemsWithSelected((prevCartItems) => {
      const updatedItems = prevCartItems.map((item) => ({
        ...item,
        totalPrice:
          item.quantity *
          (parseFloat(item.product_variant.product.promotional_price) ||
            parseFloat(item.product_variant.product.price)),
      }));

      if (JSON.stringify(updatedItems) !== JSON.stringify(prevCartItems)) {
        return updatedItems;
      }
      return prevCartItems;
    });
  }, [cartItemsWithSelected, setCartItemsWithSelected]);

  const isAnyItemSelected = cartItemsWithSelected.some(
    (item: any) => item.selected
  );

  const dispatch = useDispatch();
  const handleDeleteAll = () => {
    // Lọc các sản phẩm đã được chọn
    const selectedItems = cartItemsWithSelected.filter(
      (item: any) => item.selected
    );

    if (selectedItems.length === 0) {
      toast.error("No items selected!");
      return;
    }

    // Hiển thị Toast với custom UI
    toast(
      (t) => (
        <div className="flex flex-col space-y-2 p-4">
          <p className="text-sm text-gray-500">
            Do you want to remove these {selectedItems.length} products from
            your cart?
          </p>
          <div className="flex justify-end space-x-2">
            <button
              className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
              onClick={() => toast.dismiss(t.id)} // Đóng toast nếu người dùng nhấn Cancel
            >
              Cancel
            </button>
            <button
              className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
              onClick={() => {
                toast.dismiss(t.id); // Đóng Toast confirm

                // Hàm xóa sản phẩm tuần tự
                const deleteNext = (index: number) => {
                  if (index >= selectedItems.length) return; // Dừng khi hết sản phẩm

                  const productVariantId =
                    selectedItems[index].product_variant.id;

                  // Gọi API để xóa sản phẩm
                  deleteProductFromCart(productVariantId);

                  setCartItemsWithSelected((prevItems) =>
                    prevItems.filter(
                      (item) => item.product_variant.id !== productVariantId
                    )
                  );

                  // Xóa khỏi Redux store
                  dispatch(removeFromCart(productVariantId));

                  // Tiếp tục xóa sản phẩm sau mỗi 500ms
                  setTimeout(() => deleteNext(index + 1), 500);
                };

                // Bắt đầu xóa từ mục đầu tiên
                deleteNext(0);
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      ),
      { id: "delete-all", duration: Infinity } // Không tự động đóng Toast
    );
  };

  const handleCheckout = () => {
    const cartItemsForCheckout = cartItemsWithSelected.map(item => ({
      id: item.product_variant.product_id,
      name: item.product_variant.product.name,
      price: Number(item.product_variant.product.promotional_price) || Number(item.product_variant.product.price),
      quantity: item.quantity,
      thumbnail: item.product_variant.image_variants.image.split(", ")[0],
      variant: {
        id: item.product_variant.id,
        size: {
          size: item.product_variant.size.size,
          size_name: item.product_variant.size.size_name || item.product_variant.size.size
        },
        color: {
          color_id: item.product_variant.color.id,
          color_name: item.product_variant.color.color_name || item.product_variant.color.color
        }
      },
      total: Number(item.product_variant.product.promotional_price) || Number(item.product_variant.product.price) * item.quantity
    }));

    navigate("/checkout", {
      state: {
        cartItems: cartItemsForCheckout,
        orderSummary: {
          subtotal: orderSummary.subtotal,
          total: orderSummary.total,
        },
      },
    });
  };

  const formatVND = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (isLoading) return <CartSkeleton />;

  return (
    <div className="max-w-7xl mx-auto lg:px-0 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">
                  Shopping Cart
                </h2>
                {cartItemsWithSelected.length > 0 && (
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        onChange={toggleSelectAll}
                        checked={allSelected}
                        className="checkbox checkbox-sm checkbox-primary rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-600">Select All</span>
                    </label>
                    {allSelected && (
                      <button
                        className="text-sm text-red-600 hover:text-red-800 transition"
                        onClick={handleDeleteAll}
                      >
                        Delete All
                      </button>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                  role="alert"
                >
                  <span className="block sm:inline">{error}</span>
                </motion.div>
              )}

              <div className="space-y-4">
                <AnimatePresence>
                  {cartItemsWithSelected.map((item: any) => {
                    // Tách mảng image_variants
                    const images =
                      item.product_variant.image_variants.image.split(", ");
                    const firstImage = images[0]; // Lấy ảnh đầu tiên

                    return (
                      <motion.div
                        key={item.product_variant.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`flex items-center space-x-4 p-6 rounded-lg ${
                          item.selected ? "bg-indigo-50" : "bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={item.selected || false}
                          onChange={() =>
                            toggleSelectItem(item.product_variant.id)
                          }
                          className="checkbox checkbox-sm checkbox-primary rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <Link
                          to={`/products/${item.product_variant.product_id}`}
                        >
                          <img
                            src={firstImage}
                            alt={item.product_variant.product.name}
                            className="w-32 h-32 object-cover rounded"
                          />
                        </Link>
                        <div className="flex-1">
                          <h3 className="text-xl font-medium text-gray-900">
                            {item.product_variant.product.name}
                          </h3>
                          <p className="text-gray-500 mt-1">
                            {item.description}
                          </p>
                          <div className="mt-2 space-y-1">
                            <span className="text-sm text-gray-600">
                              <p>Color: {item.product_variant.color.color}</p>
                              <p>Size: {item.product_variant.size.size}</p>
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mt-4">
                            <button
                              className="p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              onClick={() =>
                                handleQuantityChange(
                                  item.product_variant.id,
                                  String(item.quantity - 1)
                                )
                              }
                            >
                              <FiMinus className="w-5 h-5 text-gray-600" />
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.product_variant.id,
                                  e.target.value
                                )
                              }
                              className="w-16 text-center border-gray-300 rounded-md"
                              min="1"
                            />
                            <button
                              className="p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              onClick={() =>
                                handleQuantityChange(
                                  item.product_variant.id,
                                  String(item.quantity + 1)
                                )
                              }
                            >
                              <FiPlus className="w-5 h-5 text-gray-600" />
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-medium text-gray-900">
                            {formatVND(item.totalPrice)}
                          </p>
                          <button
                            onClick={() =>
                              handleDeleteFromCart(item.product_variant.id)
                            }
                            className="mt-4 text-red-600 hover:text-red-800 focus:outline-none focus:underline flex items-center justify-end"
                          >
                            <FiTrash2 className="w-5 h-5 mr-1" />
                            Remove
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {cartItemsWithSelected.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <FiShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-gray-500">
                    Start shopping to add items to your cart
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-20">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatVND(orderSummary.subtotal)}</span>
              </div>

              <div className="border-t border-gray-200 pt-4 flex justify-between text-gray-900 font-semibold">
                <span>Total</span>
                <span>{formatVND(orderSummary.total)}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={!isAnyItemSelected}
              className={`mt-6 w-full bg-indigo-600 text-white py-3 rounded-lg flex items-center justify-center hover:bg-indigo-700 transition duration-200 ${
                !isAnyItemSelected ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <FiCreditCard className="w-5 h-5 mr-2" />
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
