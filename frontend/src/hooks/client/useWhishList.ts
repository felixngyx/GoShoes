import { WishlistItem } from './../../types/client/whishlist';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getWishlist,
  addProductToWishlist,
  deleteProductFromWishlist,
} from './../../services/client/whishlist';

const useWishlist = () => {
  const queryClient = useQueryClient();
  const [wishlistItemsWithSelected, setWishlistItemsWithSelected] = useState<WishlistItem[]>([]);
  const [error, setError] = useState('');

  // Fetch dữ liệu wishlist
  const { data: wishlistItems = [], isLoading } = useQuery<WishlistItem[]>({
    queryKey: ['WISHLIST'],
    queryFn: () => getWishlist(),
  });

  useEffect(() => {
    if (wishlistItems.length) {
      if (Array.isArray(wishlistItems[0])) {
        const products = wishlistItems[0].map(item => item.product);
        setWishlistItemsWithSelected(products);
      } else {
        // Handle error if it's not an array
        setError('Invalid data format received for wishlist items.');
      }
    }
  }, [wishlistItems]);

  // Mutation để thêm sản phẩm vào wishlist
  const { mutate: addToWishlistMutation } = useMutation({
    mutationFn: addProductToWishlist,
    onSuccess: (data: any) => {
      toast.success('The product has been added to your wishlist.');
      queryClient.invalidateQueries({
        queryKey: ['WISHLIST'],
      });
    },
    onError: () => {
      toast.error('You need to log in to add to your wishlist.');
    },
  });

  // Hàm xử lý thêm sản phẩm vào wishlist
  const handleAddToWishlist = (productId: number) => {
    if (!productId) {
      toast.error('Invalid product information.');
      return;
    }
    addToWishlistMutation({ product_id: productId });
  };

  // Mutation để xóa sản phẩm khỏi wishlist
  const { mutate: deleteFromWishlistMutation } = useMutation({
    mutationFn: deleteProductFromWishlist,
    onSuccess: () => {
      toast.success('The product has been removed from your wishlist.');
      queryClient.invalidateQueries({ queryKey: ['WISHLIST'] });
    },
    onError: (error) => {
      console.error('Error removing product from wishlist:', error);
      toast.error('Failed to remove product from your wishlist. Please try again.');
    },
  });

  // Hàm xử lý xóa sản phẩm khỏi wishlist
  const handleDeleteFromWishlist = (productId: number) => {
    const confirm = window.confirm(
      'Are you sure you want to remove this product from your wishlist?'
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
