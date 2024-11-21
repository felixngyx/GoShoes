import { Link } from 'react-router-dom';
import useWishlist from '../../../hooks/client/useWhishList';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import useCart from '../../../hooks/client/useCart'; // Import useCart hook

export default function Wishlist() {
  // Lấy dữ liệu từ hook useCart
  const { handleAddToCart } = useCart();

  const {
    wishlistItemsWithSelected,
    isLoading,
    error,
    handleDeleteFromWishlist,
  } = useWishlist();

  // Hiển thị trạng thái loading nếu đang tải dữ liệu
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Hàm xử lý thêm sản phẩm vào giỏ hàng từ wishlist
  const handleAddProductToCart = (item: any) => {
    if (!item?.id) { // Kiểm tra nếu không có product_id
      toast.error('Product ID is missing!');
      return;
    }
    const productId = item.id; // Chỉ lấy product_id
    const quantity = 1; // Bạn có thể thay đổi số lượng theo ý muốn
    handleAddToCart(productId, quantity); // Thêm vào giỏ hàng với product_id
  };


  // Hàm xử lý xóa sản phẩm khỏi danh sách yêu thích
  const handleDelete = (itemId: number) => {
    try {
      handleDeleteFromWishlist(itemId);
      toast.success('Product removed from wishlist!');
    } catch (error) {
      toast.error('Failed to remove product from wishlist!');
    }
  };

  // Hàm định dạng ngày tháng
  const formatScheduledDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return format(date, 'MM/dd/yyyy');
  };

  return (
    <div className="Wishlist-all col-span-9 space-y-8">
      <div className="title-wishlist text-[#4182F9] font-semibold text-[16px]">
        Wishlist
      </div>

      <div className="wishlist-list rounded-xl w-full border border-gray-200 shadow-lg">
        <div className="main-data p-8 sm:p-14 bg-gray-50 rounded-3xl w-full">
          <div className="overflow-x-auto">
            <table className="table-auto w-full">
              <thead>
                <tr>
                  <th className="font-medium text-lg leading-8 text-gray-600 text-left">
                    Product
                  </th>
                  <th className="font-medium text-lg leading-8 text-gray-600 text-center">
                    Price
                  </th>
                  <th className="font-medium text-lg leading-8 text-gray-600 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {wishlistItemsWithSelected.length > 0 ? (
                  wishlistItemsWithSelected.map((item) => (
                    <tr key={item.id}>
                      <td className="flex items-center space-x-4 p-4">
                        <img
                          src={item.thumbnail}
                          alt={item.name}
                          className="w-26 h-16 rounded-xl object-cover"
                        />
                        <div className="pl-4">
                          <h5 className="font-manrope font-semibold text-sm text-black mb-1 whitespace-nowrap">
                            {item.name}
                          </h5>
                          <p className="added-time text-xs text-[#5C5F6A]">
                            Added on: {formatScheduledDate(item.scheduled_at)}
                          </p>
                          <button
                            className="font-semibold text-sm mt-1 text-[#5C5F6A] hover:text-red-500"
                            onClick={() => handleDelete(item.id)}
                          >
                            Remove Item
                          </button>
                        </div>
                      </td>
                      <td className="text-center text-[#0E1422] text-sm font-semibold p-4">
                        {item.price ? `${new Intl.NumberFormat().format(parseFloat(item.price))} ₫` : 'N/A'}
                      </td>
                      <td className="text-center space-y-2">
                        <button
                          className="btn btn-sm bg-[#4182F9] text-white hover:bg-blue-700"
                          onClick={() => handleAddProductToCart(item)}
                        >
                          Add to cart
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center py-12">
                      <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
                      <p className="text-gray-500">
                        Browse our products and add items to your wishlist
                      </p>
                      <Link to="/products" className="btn btn-primary mt-4">
                        Browse Products
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
