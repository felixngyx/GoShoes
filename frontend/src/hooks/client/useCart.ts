import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import {
  deleteCartItem,
  getListCart,
  updateCartQuantity,
} from "../../services/client/cart";
import { CartItem } from "../../types/client/cart";
import { useDispatch } from "react-redux";
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

  useEffect(() => {
    if (cartItems.length > 0 && cartItemsWithSelected.length === 0) {
      const itemsWithSelected = cartItems.map((item) => ({
        ...item,
        selected: false,
      }));
      if (
        JSON.stringify(itemsWithSelected) !==
        JSON.stringify(cartItemsWithSelected)
      ) {
        setCartItemsWithSelected(itemsWithSelected);
      }
    }
  }, [cartItems, cartItemsWithSelected]);

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

  const onDelete = async (productVariantId: number) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this item from your cart?"
    );

    if (confirm) {
      try {
        await deleteCartItem(productVariantId);

        setCartItemsWithSelected((prevItems) => {
          const updatedItems = prevItems.filter(
            (item) => item.product_variant.id !== productVariantId
          );
          return updatedItems;
        });
        dispatch(removeFromCart(productVariantId));

        // Invalidate để fetch lại dữ liệu từ server
        queryClient.invalidateQueries({
          queryKey: ["CART"],
        });
      } catch (error) {
        console.error("Failed to delete cart item:", error);
      }
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
    setCartItemsWithSelected,
    toggleSelectItem,
    toggleSelectAll,
    handleQuantityChange,
    onDelete,
  };
};

export default useCart;
