import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { IoCart, IoHeartOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import useCart from "../../../hooks/client/useCart";
import Cookies from "js-cookie";
import { useState } from "react";
import { formatVNCurrency } from "../../../common/formatVNCurrency";
import useWishlist from "../../../hooks/client/useWhishList";
import toast from "react-hot-toast";
import { addToCart } from "../../../services/client/cart";

const ProductItemSkeleton = () => {
  return (
    <div className="col-span-1 border border-[#F6F7F8] rounded-lg group overflow-hidden shadow-sm">
      <div className="relative w-full h-[280px]">
        <div className="w-full h-full bg-gray-200 animate-pulse" />
        <div className="absolute top-2 left-2 h-6 w-12 bg-gray-200 animate-pulse rounded-md" />
      </div>
      <div className="mt-2 px-2">
        <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4 mx-auto" />
      </div>
      <div className="flex justify-center mt-1">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((index) => (
            <div
              key={index}
              className="w-4 h-4 bg-gray-200 animate-pulse rounded"
            />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 mt-1 mb-3">
        <div className="h-6 bg-gray-200 animate-pulse rounded w-24" />
        <div className="h-4 bg-gray-200 animate-pulse rounded w-20" />
        <div className="h-4 bg-gray-200 animate-pulse rounded w-12" />
      </div>
    </div>
  );
};

const ProductItems = ({
  product,
  isLoading,
}: {
  product: any;
  isLoading: boolean;
}) => {
  const accessToken = Cookies.get("access_token");
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalCheckLogin, setModalCheckLogin] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const { handleAddToCart } = useCart();
  const { handleAddToWishlist } = useWishlist();

  if (isLoading) {
    return <ProductItemSkeleton />;
  }

  const handleAddToCartDetail = async (
    variantId: number,
    size: string,
    colorId: number,
    quantity: number
  ) => {
    try {
      const response = await addToCart({
        product_variant_id: variantId,
        size: size,
        color_id: colorId,
        quantity: quantity
      });
      
      if (response) {
        toast.success("Product added to cart successfully!");
      }
    } catch (error) {
      toast.error("Failed to add product to cart");
      console.error("Error adding to cart:", error);
    }
  };

  const addCart = () => {
    if (selectedSize && selectedColor) {
      const variants = parseVariants(product?.variants);
      const selectedVariant = variants.find(
        (variant: any) => variant.color === selectedColor
      );

      if (selectedVariant) {
        const selectedSizeObj = selectedVariant.sizes.find(
          (sizeObj: any) => sizeObj.size === selectedSize
        );

        if (selectedSizeObj && selectedSizeObj.quantity > 0) {
          const productVariantId = selectedSizeObj.product_variant_id;
          const quantity = 1;

          handleAddToCartDetail(
            productVariantId,
            selectedSize,
            selectedColor,
            quantity
          );

          setShowModal(false);
          setSelectedSize(null);
          setSelectedColor(null);
        } else {
          toast.error("Size hoặc sản phẩm không khả dụng.");
        }
      } else {
        toast.error("Không tìm thấy màu được chọn.");
      }
    } else {
      toast.error("Hãy chọn kích thước và màu trước khi thêm vào giỏ hàng.");
    }
  };

  const handleCheckAdd = () => {
    if (!accessToken) {
      setModalCheckLogin(true);
      setShowModal(false);
      return;
    }
    setShowModal(true);
  };

  const parseVariants = (variants: string | any[]) => {
    try {
      return Array.isArray(variants) ? variants : JSON.parse(variants);
    } catch (error) {
      console.error("Error parsing variants:", error);
      return [];
    }
  };

  const getVariantsForColor = (color: string) => {
    if (!product?.variants) return [];

    const parsedVariants = parseVariants(product.variants);
    return parsedVariants
      .filter((variant: any) => variant.color === color)
      .flatMap((variant: any) => variant.sizes || []);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalCheckLogin(false);
  };

  const handleLoginNow = () => {
    navigate("/signin");
    closeModal();
  };

  const RatingStars = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          <span key={index}>
            {index < Math.floor(rating) ? (
              <AiFillStar className="text-yellow-400 text-xs" />
            ) : (
              <AiOutlineStar className="text-yellow-400 text-xs" />
            )}
          </span>
        ))}
      </div>
    );
  };

  return (
    <>
      <div
        key={product.id}
        className="col-span-1 border border-[#F6F7F8] rounded-lg group overflow-hidden shadow-sm transition-shadow duration-300 hover:shadow-lg"
      >
        <div className="relative w-full h-[280px] overflow-hidden">
          <img
            className="w-full h-full object-cover transition-transform duration-300 transform group-hover:scale-105"
            src={product.thumbnail}
            alt={product.name}
          />

          <p className="absolute top-2 right-2 text-white bg-red-600 text-xs font-semibold px-2 py-1 rounded-full z-10">
            {Math.round(
              ((Number(product.price) - Number(product.promotional_price)) /
                Number(product.price)) *
                100
            )}
            %
          </p>
          <div className="absolute hidden group-hover:flex w-full h-full top-0 left-0 bg-opacity-70 bg-gray-50 justify-center items-center gap-8 z-10">
            <IoHeartOutline
              onClick={() => handleAddToWishlist(product.id)}
              className="cursor-pointer p-4 bg-white rounded-full shadow-md hover:bg-gray-200 transition"
              size={52}
              color="#40BFFF"
            />
            <IoCart
              onClick={() => handleCheckAdd()}
              className="cursor-pointer p-4 bg-white rounded-full shadow-md hover:bg-gray-200 transition"
              size={52}
              color="#40BFFF"
            />
          </div>
        </div>
        <Link to={`/products/${product.id}`}>
          <p className="text-center text-[#223263] text-lg font-semibold mt-2 px-2 hover:text-primary transition">
            {product.name}
          </p>
        </Link>
        <div className="flex flex-row items-center justify-center gap-1 mt-1">
          <RatingStars rating={product.rating_count} />
        </div>
        <div className="flex items-center justify-center gap-2 mt-1 mb-3">
          <p className="text-primary text-lg font-semibold">
            {formatVNCurrency(Number(product.promotional_price))}
          </p>
          <p className="text-[#9098B1] text-sm font-medium line-through">
            {formatVNCurrency(Number(product.price))}
          </p>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="modal modal-open">
            <div className="modal-box relative">
              <h3 className="font-bold text-xl text-blue-500">
                {product.name}
              </h3>
              <p className="mt-2">Select size and color:</p>
              <div className="flex flex-col gap-6 mt-4">
                <div>
                  <h4 className="text-lg font-semibold mb-2">Size:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedColor &&
                      [...new Set(
                        getVariantsForColor(selectedColor).map((variant: any) => variant.size)
                      )]
                        .sort((a, b) => a - b)
                        .map((size: string) => {
                          const variant = getVariantsForColor(selectedColor).find(
                            (v: any) => v.size === size
                          );
                          const isSizeAvailable = variant?.quantity > 0;
                          const isSelected = selectedSize === size;

                          return (
                            <button
                              key={size}
                              className={`px-8 py-2 text-center text-sm font-medium border rounded-md transition ${
                                isSelected
                                  ? "border-theme-color-primary ring-2 ring-theme-color-primary"
                                  : "bg-white text-gray-700 border-gray-300"
                              } ${
                                !isSizeAvailable
                                  ? "cursor-not-allowed opacity-50 line-through"
                                  : "hover:border-theme-color-primary"
                              }`}
                              onClick={() => {
                                if (isSizeAvailable) {
                                  setSelectedSize(size);
                                }
                              }}
                              disabled={!isSizeAvailable}
                            >
                              {size}
                            </button>
                          );
                        })}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">Color:</h4>
                  <div className="flex flex-wrap gap-2">
                    {parseVariants(product.variants)
                      .map((variant: any) => variant.color)
                      .filter(
                        (value: string, index: number, self: string[]) =>
                          self.indexOf(value) === index
                      )
                      .map((color: string) => {
                        const isSelected = selectedColor === color;
                        return (
                          <button
                            key={color}
                            className={`px-6 py-2 border rounded-md hover:border-theme-color-primary focus:outline-none focus:ring-2 focus:ring-theme-color-primary flex items-center gap-2 ${
                              isSelected
                                ? "bg-theme-color-primary outline-none ring-2"
                                : ""
                            }`}
                            onClick={() => setSelectedColor(color)}
                          >
                            {color}
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-4">
                <button
                  className="btn bg-gray-300 text-black"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  className="btn bg-blue-500 text-white"
                  onClick={addCart}
                  disabled={!selectedSize || !selectedColor}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalCheckLogin && (
        <div className="fixed inset-0 z-50 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="modal modal-open">
            <div className="modal-box relative">
              <h2 className="text-2xl font-semibold text-center mb-4">
                Please log in to continue adding items to your cart.
              </h2>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleLoginNow}
                  className="btn bg-blue-500 text-white hover:bg-blue-600"
                >
                  Login Now
                </button>
                <button
                  onClick={closeModal}
                  className="btn bg-gray-300 text-black hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductItems;
