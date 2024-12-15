import { WishlistItem } from "./../../types/client/whishlist";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getWishlist,
  addProductToWishlist,
  deleteProductFromWishlist,
} from "./../../services/client/whishlist";
import Cookies from "js-cookie";

const useWishlist = () => {
  const queryClient = useQueryClient();
  const [wishlistItemsWithSelected, setWishlistItemsWithSelected] = useState<
    WishlistItem[]
  >([]);
  const [error, setError] = useState("");
  const token = Cookies.get("access_token");

  // Fetch dữ liệu wishlist
  const { data: wishlistItems = [], isLoading } = useQuery<WishlistItem[]>({
    queryKey: ["WISHLIST"],
    queryFn: async () => {
      if (!token) {
        throw new Error("Access token not found");
      }
      return getWishlist();
    },
    enabled: !!Cookies.get("access_token"),
  });

  useEffect(() => {
    if (wishlistItems.length) {
      if (Array.isArray(wishlistItems[0])) {
        const products = wishlistItems[0].map((item) => item.product);
        setWishlistItemsWithSelected(products);
      } else {
        // Handle error if it's not an array
        setError("Invalid data format received for wishlist items.");
      }
    }
  }, [wishlistItems]);

  // Mutation để thêm sản phẩm vào wishlist
  const { mutate: addToWishlistMutation } = useMutation({
    mutationFn: addProductToWishlist,
    onSuccess: (data: any) => {
      toast.success("Sản phẩm đã được thêm vào danh sách yêu thích.");
      queryClient.invalidateQueries({
        queryKey: ["WISHLIST"],
      });
    },
    onError: () => {
      toast.error("Bạn cần đăng nhập để sử dụng chức năng.");
    },
  });

  // Hàm xử lý thêm sản phẩm vào wishlist
  const handleAddToWishlist = (productId: number) => {
    if (!productId) {
      toast.error("Invalid product information.");
      return;
    }
    addToWishlistMutation({ product_id: productId });
  };

  // Mutation để xóa sản phẩm khỏi wishlist
  const { mutate: deleteFromWishlistMutation } = useMutation({
    mutationFn: deleteProductFromWishlist,
    onSuccess: () => {
      toast.success("The product has been removed from your wishlist.");
      queryClient.invalidateQueries({ queryKey: ["WISHLIST"] });
    },
    onError: (error) => {
      console.error("Error removing product from wishlist:", error);
      toast.error(
        "Có lỗi xảy ra khi xóa sản phẩm khỏi danh sách yêu thích."
      );
    },
  });

  // Hàm xử lý xóa sản phẩm khỏi wishlist
  const handleDeleteFromWishlist = (productId: number) => {
    const confirm = window.confirm(
      "Bạn có chắc chắn muốn xóa sản phẩm này khỏi danh sách yêu thích?"
    );

    if (confirm) {
      deleteFromWishlistMutation(productId);

      setWishlistItemsWithSelected((prevItems) => {
        const updatedItems = prevItems.filter((item) => item.id !== productId);
        return updatedItems;
      });

      // Nếu có hành động redux khác, có thể dispatch ở đây
      // dispatch(removeFromWishlist(productId));
    }
  };

  return {
    wishlistItemsWithSelected,
    isLoading,
    error,
    wishlistItems,
    handleAddToWishlist,
    handleDeleteFromWishlist,
  };
};

export default useWishlist;
