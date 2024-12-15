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
import { checkStock } from "../../services/client/product";
import Swal from "sweetalert2";

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

  const totalQuantity =
    token && Array.isArray(cartItems)
      ? cartItems.reduce((total, item: any) => total + item.quantity, 0)
      : 0;
  const addToCartMutation = useMutation({
    mutationFn: addToCart,
    onSuccess: (data: any) => {
      toast.success(data.message);
      queryClient.invalidateQueries({
        queryKey: ["CART"],
      });
    },
    onError: () => {
      toast.error("Bạn cần đăng nhập để có thể mua hàng.");
    },
  });

  const handleAddToCartDetail = async (
    productVariantId: number,
    selectedSize: string,
    selectedColor: string,
    quantity: number
  ) => {
    if (!selectedSize || !selectedColor || quantity < 1) {
      toast.error(
        "Please select size, color and quantity before adding to cart."
      );
      return;
    }

    // Kiểm tra sản phẩm đã tồn tại trong giỏ hàng chưa
    const existingItem = cartItems.find(
      (item) => item.product_variant.id === productVariantId
    );

    if (existingItem) {
      // Kiểm tra số lượng tồn kho
      const stockQuantity = await checkStock(productVariantId);
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > stockQuantity) {
        toast.error(`Số lượng tối đa có được là ${stockQuantity}`);
        return;
      }

      // Cập nhật số lượng mới
      const params: CartParams = {
        product_variant_id: productVariantId,
        quantity: newQuantity,
      };

      try {
        await updateCartQuantity(params);
        queryClient.invalidateQueries({ queryKey: ["CART"] });
        toast.success("Cập nhật số lượng giỏ hàng thành công");
      } catch (error) {
        toast.error("Không thể cập nhật số lượng giỏ hàng");
      }
    } else {
      // Thêm mới vào giỏ hàng
      const params: CartParams = {
        product_variant_id: productVariantId,
        quantity,
      };
      addToCartMutation.mutate(params);
    }
  };

  const { mutate: addProductToCart } = useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      toast.success("Đã thêm sản phẩm thành công");
      queryClient.invalidateQueries({ queryKey: ["CART"] }); // Làm mới dữ liệu giỏ hàng sau khi thêm
    },
    onError: () => {
      toast.error("Bạn cần đăng nhập để có thể thêm vào giỏ hàng.");
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

  // Kiểm tra xem tất cả các mục đã được chọn hay chưa
  const allSelected = cartItemsWithSelected.every((item: any) => item.selected);

  const handleQuantityChange = async (
    productVariantId: number,
    newQuantity: string
  ) => {
    const quantity = parseInt(newQuantity, 10);

    if (quantity > 0) {
      // Kiểm tra số lượng sản phẩm trong kho
      const stockQuantity = await checkStock(productVariantId);

      // Nếu số lượng sản phẩm trong giỏ hàng vượt quá số lượng trong kho, hiện thông báo
      if (quantity > stockQuantity) {
        toast.error(`Số lượng tối đa có được là ${stockQuantity}.`, {});
      }

      // Đảm bảo số lượng cập nhật không vượt quá số lượng trong kho
      const updatedQuantity =
        quantity > stockQuantity ? stockQuantity : quantity;

      // Cập nhật giỏ hàng
      setCartItemsWithSelected((prevCartItems) =>
        prevCartItems.map((item) =>
          item.product_variant.id === productVariantId
            ? {
                ...item,
                quantity: updatedQuantity,
                totalPrice:
                  updatedQuantity *
                  (parseFloat(item.product_variant.product.promotional_price) ||
                    parseFloat(item.product_variant.product.price)),
              }
            : item
        )
      );

      // Gửi yêu cầu cập nhật số lượng sản phẩm trong giỏ hàng
      debouncedUpdateQuantity(productVariantId, updatedQuantity);
    }
  };

  const { mutate: deleteProductFromCart } = useMutation({
    mutationFn: deleteCartItem,
    onSuccess: () => {
      toast.success("Sản phẩm đã bị xóa khỏi giỏ hàng.");
      queryClient.invalidateQueries({ queryKey: ["CART"] });
    },
    onError: (error) => {
      console.error("Error removing product from cart:", error);
      toast.error("Không thể xóa sản phẩm khỏi giỏ hàng. Vui lòng thử lại.");
    },
  });

  // Hàm xử lý xóa sản phẩm khỏi giỏ hàng
  const handleDeleteFromCart = (productVariantId: number) => {
    Swal.fire({
      title: "Xác nhận xóa",
      text: "Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      customClass: {
        popup: "bg-white shadow rounded-lg p-4 max-w-[300px]",
        title: "text-base font-bold text-gray-800",
        htmlContainer: "text-sm text-gray-600",
        confirmButton:
          "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600",
        cancelButton:
          "bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400",
      },
      buttonsStyling: false,
      position: "top",
    }).then((result) => {
      if (result.isConfirmed) {
        // Gọi API để xóa sản phẩm
        deleteProductFromCart(productVariantId);

        // Cập nhật danh sách giỏ hàng
        setCartItemsWithSelected((prevItems) => {
          const updatedItems = prevItems.filter(
            (item) => item.product_variant.id !== productVariantId
          );
          return updatedItems;
        });

        // Dispatch action để cập nhật Redux
        dispatch(removeFromCart(productVariantId));
      }
    });
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
    allSelected,
    handleAddToCart,
    handleAddToCartDetail,
    setCartItemsWithSelected,
    toggleSelectItem,
    toggleSelectAll,
    handleQuantityChange,
    handleDeleteFromCart,
    deleteProductFromCart,
  };
};

export default useCart;
