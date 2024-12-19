import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useState } from "react";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { IoCart, IoHeartOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import useCart from "../../hooks/client/useCart";
import useWishlist from "../../hooks/client/useWhishList";
import { getAllProducts } from "../../services/client/product";
import { IProduct } from "../../types/client/products/products";
import toast from "react-hot-toast";
import { formatVNCurrency } from "../../common/formatVNCurrency";

const ProductCardSkeleton = () => {
  return (
    <>
      {Array(8)
        .fill(null)
        .map((_, index) => (
          <div
            key={index}
            className="col-span-1 border border-[#F6F7F8] rounded-lg overflow-hidden shadow-sm"
          >
            {/* Phần ảnh */}
            <div className="relative w-full h-[280px] bg-gray-200 animate-pulse" />

            {/* Phần tên sản phẩm */}
            <div className="px-2 mt-2">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4 mx-auto" />
            </div>

            {/* Phần rating */}
            <div className="flex justify-center mt-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
            </div>

            {/* Phần giá */}
            <div className="flex items-center justify-center gap-2 mt-1 mb-3">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-20" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-10" />
            </div>
          </div>
        ))}
    </>
  );
};
const ProductCard = () => {
  const accessToken = Cookies.get("access_token");
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const { handleAddToCart } = useCart();
  const [showModal, setShowModal] = useState(false);
  const { handleAddToWishlist } = useWishlist();

  const {
    data: products,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["PRODUCT_KEY"],
    queryFn: () => getAllProducts(1, 8),
  });

  const handleCheckAdd = (product: IProduct) => {
    if (!accessToken) {
      setShowModal(true);
      return;
    }
    setSelectedProduct(product);
  };

  const addCart = () => {
    if (selectedSize && selectedColor) {
      const variants = parseVariants(selectedProduct?.variants || []);
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

          handleAddToCart(productVariantId, quantity);
          setSelectedProduct(null);
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

  const parseVariants = (variants: string | any[]) => {
    try {
      return Array.isArray(variants) ? variants : JSON.parse(variants);
    } catch (error) {
      console.error("Error parsing variants:", error);
      return [];
    }
  };

  const getVariantsForColor = (color: string) => {
    if (!selectedProduct) return [];

    const sizes = parseVariants(selectedProduct.variants)
      .filter((variant: any) => variant.color === color)
      .flatMap((variant: any) => variant.sizes);

    const uniqueSizes = Array.from(new Set(sizes.map((s: any) => s.size))).map(
      (size) => {
        return sizes.find((s: any) => s.size === size);
      }
    );

    return uniqueSizes;
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setSelectedSize(null);
    setSelectedColor(null);
    setShowModal(false);
  };

  const handleLoginNow = () => {
    navigate("/signin");
    closeModal();
  };

  if (isLoading) {
    return <ProductCardSkeleton />;
  }

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

  if (isError) {
    return <p>Error loading products. Please try again.</p>;
  }

  return (
    <>
      {products?.map((product: IProduct) => (
        <div
          key={product.id}
          className="col-span-1 border border-[#F6F7F8] rounded-lg group overflow-hidden shadow-sm transition-shadow duration-300 hover:shadow-lg flex flex-col justify-between pb-4"
        >
          <div className="relative overflow-hidden">
            <img
              className="w-full h-[150px] sm:h-[200px] lg:h-[280px] object-cover transition-transform duration-300 transform group-hover:scale-105"
              src={product.thumbnail}
              alt={product.name}
            />
            {product.promotional_price > 0 && (
              <p className="absolute top-2 right-2 text-white bg-red-600 text-xs font-semibold px-2 py-1 rounded-full z-10">
                {Math.round(
                  ((Number(product.price) - Number(product.promotional_price)) /
                    Number(product.price)) *
                    100
                )}
                %
              </p>
            )}
            <div className="absolute hidden group-hover:flex w-full h-full top-0 left-0 bg-opacity-70 bg-gray-50 justify-center items-center gap-8 z-10">
              <IoHeartOutline
                onClick={() => handleAddToWishlist(product.id)}
                className="cursor-pointer p-4 bg-white rounded-full shadow-md hover:bg-gray-200 transition"
                size={52}
                color="#40BFFF"
              />
              <IoCart
                onClick={() => handleCheckAdd(product)}
                className="cursor-pointer p-4 bg-white rounded-full shadow-md hover:bg-gray-200 transition"
                size={52}
                color="#40BFFF"
              />
            </div>
          </div>

          <Link to={`/products/${product.id}`}>
            <p className="text-center text-[#223263] text-sm md:text-base font-semibold mt-2 px-2 hover:text-primary transition">
              {product.name}
            </p>
          </Link>

          <div className="flex flex-row items-center justify-center gap-1 mt-1">
            <RatingStars rating={product.rating_count} />
          </div>
          <div className="flex items-center justify-center gap-2">
            {product.promotional_price && product.promotional_price > 0 ? (
              <>
                <p className="text-primary text-xs md:text-sm font-semibold">
                  {formatVNCurrency(Number(product.promotional_price))}
                </p>
                <p className="text-[#9098B1] text-xs md:text-sm font-medium line-through">
                  {formatVNCurrency(Number(product.price))}
                </p>
              </>
            ) : (
              <p className="text-primary text-xs md:text-sm font-semibold">
                {formatVNCurrency(Number(product.price))}
              </p>
            )}
          </div>
        </div>
      ))}

      {selectedProduct && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="modal modal-open">
            <div className="modal-box relative">
              <h3 className="font-bold text-xl text-blue-500">
                {selectedProduct.name}
              </h3>
              <p className="mt-2">Chọn kích thước và màu sắc:</p>
              <div className="flex flex-col gap-6 mt-4">
                <div>
                  <h4 className="text-lg font-semibold mb-2">Màu sắc:</h4>
                  <div className="flex flex-wrap gap-2">
                    {parseVariants(selectedProduct.variants)
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

                <div>
                  <h4 className="text-lg font-semibold mb-2">Kích thước:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedColor &&
                      getVariantsForColor(selectedColor)
                        .sort((a: any, b: any) => a.size - b.size)
                        .map((variant: any) => {
                          const isSizeAvailable = variant.quantity > 0;
                          const isSelected = selectedSize === variant.size;

                          return (
                            <button
                              key={variant.size}
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
                                  setSelectedSize(variant.size);
                                }
                              }}
                              disabled={!isSizeAvailable}
                            >
                              {variant.size}
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
                  Hủy
                </button>
                <button
                  className="btn bg-blue-500 text-white"
                  onClick={addCart}
                  disabled={!selectedSize || !selectedColor}
                >
                  Thêm vào giỏ hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="modal modal-open">
            <div className="modal-box relative">
              <h3 className="font-bold text-xl">Bạn cần đăng nhập</h3>
              <p className="mt-2">
                Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng của bạn.
              </p>
              <div className="mt-4 flex justify-end gap-4">
                <button
                  className="btn bg-gray-300 text-black"
                  onClick={closeModal}
                >
                  Đóng
                </button>
                <button
                  className="btn bg-blue-500 text-white"
                  onClick={handleLoginNow}
                >
                  Đăng nhập ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
