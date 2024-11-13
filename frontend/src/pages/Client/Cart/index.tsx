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
import { Link } from "react-router-dom";
import useCart from "../../../hooks/client/useCart";

const Cart = () => {
  const {
    cartItemsWithSelected,
    isLoading,
    error,
    orderSummary,
    cartItems,
    setCartItemsWithSelected,
    toggleSelectItem,
    toggleSelectAll,
    handleQuantityChange,
    onDelete,
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

  if (isLoading) return <p>Đang tải...</p>;

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
                {cartItems.length > 0 && (
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={
                          cartItems.length > 0 &&
                          cartItems.every((item: any) => item.selected)
                        }
                        onChange={toggleSelectAll}
                        className="checkbox checkbox-sm checkbox-primary rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-600">Select All</span>
                    </label>
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
                  {cartItemsWithSelected.map((item: any) => (
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
                      <Link to={`/products/${item.product_variant.product_id}`}>
                        <img
                          src={item.product_variant.image_variant}
                          className="w-32 h-32 object-cover rounded"
                        />
                      </Link>
                      <div className="flex-1">
                        <h3 className="text-xl font-medium text-gray-900">
                          {item.product_variant.product.name}
                        </h3>
                        <p className="text-gray-500 mt-1">{item.description}</p>
                        <div className="mt-2 space-y-1">
                          <span className="text-sm text-gray-600">
                            <p>Color: {item.product_variant.color.color}</p>
                            <p>Size: {item.product_variant.size.size}</p>
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-4">
                          <button className="p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <FiMinus
                              onClick={() =>
                                handleQuantityChange(
                                  item.product_variant.id,
                                  String(item.quantity - 1)
                                )
                              }
                              className="w-5 h-5 text-gray-600"
                            />
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
                          <button className="p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <FiPlus
                              onClick={() =>
                                handleQuantityChange(
                                  item.product_variant.id,
                                  String(item.quantity + 1)
                                )
                              }
                              className="w-5 h-5 text-gray-600"
                            />
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-medium text-gray-900">
                          ${item.totalPrice}
                        </p>
                        <button
                          onClick={() => onDelete(item.product_variant.id)}
                          className="mt-4 text-red-600 hover:text-red-800 focus:outline-none focus:underline flex items-center justify-end"
                        >
                          <FiTrash2 className="w-5 h-5 mr-1" />
                          Remove
                        </button>
                      </div>
                    </motion.div>
                  ))}
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
                <span>${orderSummary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>${orderSummary.shipping.toFixed(2)}</span>
              </div>

              <div className="border-t border-gray-200 pt-4 flex justify-between text-gray-900 font-semibold">
                <span>Total</span>
                <span>${orderSummary.total.toFixed(2)}</span>
              </div>
            </div>
            <Link
              to={isAnyItemSelected ? "/checkout" : "#"} // Nếu không có sản phẩm nào được chọn, không điều hướng
              className={`mt-6 w-full bg-indigo-600 text-white py-3 rounded-lg flex items-center justify-center hover:bg-indigo-700 transition duration-200 ${
                !isAnyItemSelected ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <FiCreditCard className="w-5 h-5 mr-2" />
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
