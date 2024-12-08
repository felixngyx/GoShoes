'use client'

import { Link } from 'react-router-dom'
import useWishlist from '../../../hooks/client/useWhishList'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import useCart from '../../../hooks/client/useCart'

export default function Wishlist() {
  const { handleAddToCart } = useCart()
  const {
    wishlistItemsWithSelected,
    isLoading,
    error,
    handleDeleteFromWishlist,
  } = useWishlist()

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  const handleAddProductToCart = (item: any) => {
    if (!item?.id) {
      toast.error('Product ID is missing!')
      return
    }
    const productId = item.id
    const quantity = 1
    handleAddToCart(productId, quantity)
  }

  const handleDelete = (itemId: number) => {
    try {
      handleDeleteFromWishlist(itemId)
      toast.success('Product removed from wishlist!')
    } catch (error) {
      toast.error('Failed to remove product from wishlist!')
    }
  }

  const formatScheduledDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }
    return format(date, 'MM/dd/yyyy')
  }

  return (
    <div className="Wishlist-all col-span-9 space-y-8 p-4 md:p-8">
      <h2 className="title-wishlist text-[#40BFFF] font-semibold text-xl md:text-2xl">
        Wishlist
      </h2>

      <div className="wishlist-list rounded-xl w-full border border-gray-200 shadow-lg overflow-hidden">
        <div className="main-data p-4 md:p-8 bg-gray-50 rounded-3xl w-full overflow-x-auto">
          <table className="table-auto w-full min-w-[640px]">
            <thead>
              <tr className="text-left">
                <th className="font-medium text-base md:text-lg leading-8 text-gray-600 p-2 md:p-4">Product</th>
                <th className="font-medium text-base md:text-lg leading-8 text-gray-600 p-2 md:p-4 text-center">Price</th>
                <th className="font-medium text-base md:text-lg leading-8 text-gray-600 p-2 md:p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {wishlistItemsWithSelected.length > 0 ? (
                wishlistItemsWithSelected.map((item) => (
                  <tr key={item.id} className="border-t border-gray-200">
                    <td className="p-2 md:p-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.thumbnail}
                          alt={item.name}
                          className="w-16 h-16 md:w-24 md:h-24 rounded-xl object-cover"
                        />
                        <div>
                          <h5 className="font-manrope font-semibold text-sm md:text-base text-black mb-1">
                            {item.name}
                          </h5>
                          <p className="added-time text-xs md:text-sm text-[#5C5F6A]">
                            Added on: {formatScheduledDate(item.scheduled_at)}
                          </p>
                          <button
                            className="font-semibold text-xs md:text-sm mt-1 text-[#5C5F6A] hover:text-red-500"
                            onClick={() => handleDelete(item.id)}
                          >
                            Remove Item
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="text-center text-[#0E1422] text-sm md:text-base font-semibold p-2 md:p-4">
                      {item.price ? `${new Intl.NumberFormat().format(parseFloat(item.price))} ₫` : 'N/A'}
                    </td>
                    <td className="text-center p-2 md:p-4">
                      <button
                        className="btn btn-sm md:btn-md bg-[#40BFFF] text-white hover:bg-[#2EA8E5] px-2 py-1 md:px-4 md:py-2 rounded transition duration-300"
                        onClick={() => handleAddProductToCart(item)}
                      >
                        Add to cart
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-8 md:py-12">
                    <h3 className="text-lg md:text-xl font-semibold mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-500 text-sm md:text-base">
                      Browse our products and add items to your wishlist
                    </p>
                    <Link to="/products" className="btn btn-primary mt-4 inline-block px-4 py-2 bg-[#40BFFF] text-white rounded hover:bg-[#2EA8E5] transition duration-300">
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
  )
}

