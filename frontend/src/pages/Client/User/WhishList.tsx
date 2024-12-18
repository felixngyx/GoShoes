import { Link } from 'react-router-dom'
import useWishlist from '../../../hooks/client/useWhishList'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import RelatedProduct from '../ProductList/RelatedProduct'

export default function Wishlist() {
  const {
    wishlistItemsWithSelected,
    isLoading,
    error,
    handleDeleteFromWishlist,
  } = useWishlist()

  if (isLoading) {
    return <div className="text-center py-8">Đang tải...</div>
  }

  const handleDelete = (itemId: number) => {
    try {
      handleDeleteFromWishlist(itemId)
    } catch (error) {
      toast.error('Xóa sản phẩm khỏi danh sách yêu thích thất bại!')
    }
  }

  const formatScheduledDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Ngày không hợp lệ'
    }
    return format(date, 'MM/dd/yyyy')
  }

  return (
    <div className="Wishlist-all col-span-9 space-y-8 p-4 md:p-8">
      <h2 className="title-wishlist text-[#40BFFF] font-semibold text-xl md:text-2xl">
        Danh sách yêu thích
      </h2>
      <div className="wishlist-list rounded-xl w-full border border-gray-200 shadow-lg overflow-hidden">
        <div className="main-data p-4 md:p-8 bg-gray-50 rounded-3xl w-full overflow-x-auto">
          <table className="table-auto w-full min-w-[640px]">
            <thead>
              <tr className="text-left">
                <th className="font-medium text-base md:text-lg leading-8 text-gray-600 p-2 md:p-4">Sản phẩm</th>
                <th className="font-medium text-base md:text-lg leading-8 text-gray-600 p-2 md:p-4 text-center">Giá</th>
              </tr>
            </thead>
            <tbody>
              {wishlistItemsWithSelected.length > 0 ? (
                wishlistItemsWithSelected.map((item) => (
                  <tr key={item.id} className="border-t border-gray-200">
                    <td className="p-2 md:p-4">
                      <div className="flex items-center space-x-4">
                        <Link to={`/products/${item.id}`}>
                          <img
                            src={item.thumbnail}
                            alt={item.name}
                            className="w-16 h-16 md:w-24 md:h-24 rounded-xl object-cover"
                          />
                        </Link>
                        <div>
                          <h5 className="font-manrope font-semibold text-sm md:text-base text-black mb-1">
                            {item.name}
                          </h5>
                          <p className="added-time text-xs md:text-sm text-[#5C5F6A]">
                            Thêm vào: {formatScheduledDate(item.created_at)}
                          </p>
                          <button
                            className="font-semibold text-xs md:text-sm mt-1 text-[#5C5F6A] hover:text-red-500"
                            onClick={() => handleDelete(item.id)}
                          >
                            Xóa sản phẩm
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="text-center text-[#0E1422] text-sm md:text-base font-semibold p-2 md:p-4">
                      {item.price ? `${new Intl.NumberFormat().format(parseFloat(item.price))} ₫` : 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-8 md:py-12">
                    <h3 className="text-lg md:text-xl font-semibold mb-2">Danh sách yêu thích của bạn trống</h3>
                    <p className="text-gray-500 text-sm md:text-base">
                      Duyệt qua các sản phẩm và thêm vào danh sách yêu thích
                    </p>
                    <Link
                      to="/products"
                      className="btn btn-primary mt-4 px-6 py-3 text-white rounded-lg border-2 border-transparent bg-[#40BFFF] hover:bg-white hover:text-[#40BFFF] hover:border-[#40BFFF] shadow-md transition duration-300 ease-in-out"
                    >
                      Duyệt sản phẩm
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Gọi RelatedProduct và truyền id và productId
        {wishlistItemsWithSelected.map((item) => (
          <RelatedProduct key={item.id} id={item.id} productId={item.id} />
        ))} */}
      </div>
    </div>
  )
}
