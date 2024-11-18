import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useDebouncedCallback } from "use-debounce";
import {
  addToCart,
  CartParams,
  deleteCartItem,
  getListCart,
  updateCartQuantity,
} from "../../services/client/cart";
import { CartItem } from "../../types/client/cart";
import { removeFromCart } from "./cartSlice";
import Cookies from "js-cookie";

const useCart = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [cartItemsWithSelected, setCartItemsWithSelected] = useState<
    CartItem[]
  >([]);

  const token = Cookies.get("access_token");

  const { data: cartItems = [], isLoading } = useQuery<CartItem[]>({
    queryKey: ["CART"],
    queryFn: async () => {
      if (!token) {
        throw new Error("Access token not found"); // Hoặc xử lý khác
      }
      return getListCart();
    },
    enabled: !!Cookies.get("access_token"), // Không chạy query nếu không có `access_token`
  });

  const totalQuantity = token
    ? cartItems.reduce((total, item: any) => total + item.quantity, 0)
    : 0; // Nếu không có token, totalQuantity = 0
  const addToCartMutation = useMutation({
    mutationFn: addToCart,
    onSuccess: (data: any) => {
      toast.success(data.message);
      queryClient.invalidateQueries({
        queryKey: ["CART"],
      });
    },
    onError: () => {
      toast.error("You need to log in to be able to add to cart.");
    },
  });

  const handleAddToCartDetail = (
    productVariantId: number,
    selectedSize: string,
    selectedColor: string,
    quantity: number
  ) => {
    if (!selectedSize || !selectedColor || quantity < 1) {
      toast.error(
        "Vui lòng chọn đầy đủ kích thước, màu sắc và số lượng sản phẩm."
      );
      return;
    }

    const params: CartParams = {
      product_variant_id: productVariantId,
      quantity,
    };

    addToCartMutation.mutate(params);
  };

  const { mutate: addProductToCart } = useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      toast.success("Product added successfully");
      queryClient.invalidateQueries({ queryKey: ["CART"] }); // Làm mới dữ liệu giỏ hàng sau khi thêm
    },
    onError: () => {
      toast.error("You need to log in to be able to add to cart.");
    },
  });

  const handleAddToCart = (productVariantId: number, quantity: number) => {
    // Gọi API để thêm sản phẩm vào giỏ hàng
    addProductToCart({ product_variant_id: productVariantId, quantity });
  };

  useEffect(() => {
    if (cartItems.length) {
      const updatedCartItems = cartItems.map((item) => ({
        ...item,
        select: false,
      }));
      setCartItemsWithSelected(updatedCartItems);
    }
  }, [cartItems]);

  const toggleSelectItem = (id: number) => {
    setCartItemsWithSelected((prevItems) => {
      const updatedItems = prevItems.map((item: any) =>
        item.product_variant.id === id
          ? { ...item, selected: !item.selected }
          : item
      );
      return updatedItems;
    });
  };

  const toggleSelectAll = () => {
    const allSelected = cartItemsWithSelected.every(
      (item: any) => item.selected
    );
    setCartItemsWithSelected((prevItems) => {
      const updatedItems = prevItems.map((item) => ({
        ...item,
        selected: !allSelected,
      }));
      return updatedItems;
    });
  };

  const handleQuantityChange = (
    productVariantId: number,
    newQuantity: string
  ) => {
    const quantity = parseInt(newQuantity, 10);
    if (quantity > 0) {
      setCartItemsWithSelected((prevCartItems) =>
        prevCartItems.map((item) =>
          item.product_variant.id === productVariantId
            ? {
                ...item,
                quantity,
                totalPrice:
                  quantity *
                  (parseFloat(item.product_variant.product.promotional_price) ||
                    parseFloat(item.product_variant.product.price)),
              }
            : item
        )
      );
      debouncedUpdateQuantity(productVariantId, quantity);
    }
  };

  const { mutate: deleteProductFromCart } = useMutation({
    mutationFn: deleteCartItem,
    onSuccess: () => {
      toast.success("Sản phẩm đã được xóa khỏi giỏ hàng.");
      queryClient.invalidateQueries({ queryKey: ["CART"] }); // Làm mới dữ liệu giỏ hàng sau khi xóa
    },
    onError: (error) => {
      console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
      toast.error("Xóa sản phẩm khỏi giỏ hàng thất bại. Vui lòng thử lại.");
    },
  });

  // Hàm xử lý xóa sản phẩm khỏi giỏ hàng
  const handleDeleteFromCart = (productVariantId: number) => {
    const confirm = window.confirm(
      "Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?"
    );

    if (confirm) {
      // Gọi API để xóa sản phẩm
      deleteProductFromCart(productVariantId);

      setCartItemsWithSelected((prevItems) => {
        const updatedItems = prevItems.filter(
          (item) => item.product_variant.id !== productVariantId
        );
        return updatedItems;
      });

      dispatch(removeFromCart(productVariantId));
    }
  };

  // Hàm debounce cho updateQuantity API
  const debouncedUpdateQuantity = useDebouncedCallback(
    (productVariantId: number, quantity: number) => {
      updateCartQuantity({
        product_variant_id: productVariantId,
        quantity,
      })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["CART"] });
        })
        .catch((error) => {
          console.error("Error updating quantity:", error);
          setError("Failed to update quantity. Please try again.");
        });
    },
    500
  );

  const selectedCount = cartItemsWithSelected.filter(
    (item: any) => item.selected
  ).length;

  const orderSummary = useMemo(() => {
    const subtotal = cartItemsWithSelected
      .filter((item: any) => item.selected)
      .reduce(
        (acc, item) =>
          acc +
          item.quantity *
            (parseFloat(item.product_variant.product.promotional_price) ||
              parseFloat(item.product_variant.product.price)),
        0
      );

    const shipping = cartItemsWithSelected.some((item: any) => item.selected)
      ? 5.0
      : 0.0;

    return {
      subtotal,
      shipping,
      total: subtotal + shipping,
    };
  }, [cartItemsWithSelected]);

  orderSummary.total = orderSummary.subtotal + orderSummary.shipping;

  return {
    cartItemsWithSelected,
    isLoading,
    error,
    selectedCount,
    orderSummary,
    cartItems,
    totalQuantity,
    handleAddToCart,
    handleAddToCartDetail,
    setCartItemsWithSelected,
    toggleSelectItem,
    toggleSelectAll,
    handleQuantityChange,
    handleDeleteFromCart,
  };
};

export default useCart;
