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

const useCart = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [cartItemsWithSelected, setCartItemsWithSelected] = useState<
    CartItem[]
  >([]);

  const { data: cartItems = [], isLoading } = useQuery<CartItem[]>({
    queryKey: ["CART"],
    queryFn: () => getListCart(),
  });

  const totalQuantity = cartItems.reduce(
    (total, item: any) => total + item.quantity,
    0
  );
  const addToCartMutation = useMutation({
    mutationFn: addToCart,
    onSuccess: (data: any) => {
      toast.success(data.message);
      queryClient.invalidateQueries({
        queryKey: ["CART"],
      });
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
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
    onError: (error) => {
      console.error("Error adding product to cart:", error);
      setError("Failed to add product to cart. Please try again.");
    },
  });

  const handleAddToCart = (productVariantId: number, quantity: number) => {
    // Gọi API để thêm sản phẩm vào giỏ hàng
    addProductToCart({ product_variant_id: productVariantId, quantity });
  };

  useEffect(() => {
    if (cartItems) {
      const updatedCartItems = cartItems.map((item) => ({
        ...item,
        select: false,
      }));
      setCartItemsWithSelected(updatedCartItems);
    }
  }, [cartItems]);

  const toggleSelectItem = (id: number) => {
    const updatedItems = cartItemsWithSelected.map((item: any) =>
      item.product_variant.id === id
        ? { ...item, selected: !item.selected }
        : item
    );
    setCartItemsWithSelected(updatedItems);
  };

  const toggleSelectAll = () => {
    const allSelected = cartItemsWithSelected.every(
      (item: any) => item.selected
    );
    const updatedItems = cartItemsWithSelected.map((item) => ({
      ...item,
      selected: !allSelected,
    }));
    setCartItemsWithSelected(updatedItems);
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
    500 // Thời gian debounce là 500ms
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
