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
import Swal from 'sweetalert2';

const useWishlist = () => {
  const queryClient = useQueryClient();
  const [wishlistItemsWithSelected, setWishlistItemsWithSelected] = useState<
    WishlistItem[]
  >([]);
  const [error, setError] = useState("");
  const token = Cookies.get("access_token");

  // Lấy dữ liệu danh sách yêu thích
  const { data: wishlistItems = [], isLoading } = useQuery<WishlistItem[]>({
    queryKey: ["WISHLIST"],
    queryFn: async () => {
      if (!token) {
        throw new Error("Không tìm thấy token truy cập");
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
        // Xử lý lỗi nếu dữ liệu không phải dạng mảng
        setError("Dữ liệu danh sách yêu thích không hợp lệ.");
      }
    }
  }, [wishlistItems]);

  // Mutation để thêm sản phẩm vào danh sách yêu thích
  const { mutate: addToWishlistMutation } = useMutation({
    mutationFn: addProductToWishlist,
    onSuccess: (data: any) => {
      toast.success("Sản phẩm đã được thêm vào danh sách yêu thích.");
      queryClient.invalidateQueries({
        queryKey: ["WISHLIST"],
      });
    },
    onError: () => {
      toast.error("Bạn cần đăng nhập để thêm vào danh sách yêu thích.");
    },
  });

  // Hàm xử lý thêm sản phẩm vào danh sách yêu thích
  const handleAddToWishlist = (productId: number) => {
    if (!productId) {
      toast.error("Thông tin sản phẩm không hợp lệ.");
      return;
    }
    addToWishlistMutation({ product_id: productId });
  };

  // Mutation để xóa sản phẩm khỏi wishlist
  const { mutate: deleteFromWishlistMutation } = useMutation({
    mutationFn: deleteProductFromWishlist,
    onSuccess: () => {
      toast.success("Sản phẩm đã được xóa khỏi danh sách yêu thích!");
      queryClient.invalidateQueries({ queryKey: ["WISHLIST"] });
    },
    onError: (error) => {
      console.error("Lỗi khi xóa sản phẩm:", error);
      toast.error("Xóa sản phẩm thất bại, vui lòng thử lại!");
    },
  });

  // Hàm xử lý xóa sản phẩm khỏi wishlist
  const handleDeleteFromWishlist = (productId: number) => {
    Swal.fire({
      title: 'Xác nhận',
      text: 'Bạn có chắc chắn muốn xóa sản phẩm này khỏi danh sách yêu thích?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Hủy',
      customClass: {
        popup: 'bg-white shadow rounded-lg p-4 max-w-[300px]', // Khung nhỏ gọn giống window.confirm
        title: 'text-base font-bold text-gray-800', // Tiêu đề nhỏ gọn
        htmlContainer: 'text-sm text-gray-600', // Nội dung nhỏ gọn
        confirmButton: 'bg-red-500 text-white px-4 py-2 rounded hover:bg-blue-600', // Nút OK
        cancelButton: 'bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400', // Nút Hủy
      },
      buttonsStyling: false, // Tắt style mặc định của SweetAlert2
    }).then((result) => {
      if (result.isConfirmed) {
        deleteFromWishlistMutation(productId);
      } else {
        toast.error('Hành động xóa đã bị hủy!');
      }
    });
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
