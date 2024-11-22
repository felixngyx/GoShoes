import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { IoCart, IoHeartOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import useCart from "../../hooks/client/useCart";
import { getAllProducts } from "../../services/client/product";
import { IProduct } from "../../types/client/products/products";
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
      const variant = selectedProduct?.variants.find(
        (v: any) => v.size === selectedSize && v.color === selectedColor
      );
      if (variant) {
        const productVariantId = variant.id;
        const quantity = 1;
        handleAddToCart(productVariantId, quantity);
        setSelectedProduct(null);
      }
    }
  };

  const uniqueSizes = products?.flatMap((product: any) =>
    product.variants
      ? product.variants
          .filter((variant: any) => variant.size && variant.color)
          .map((variant: any) => ({
            size: variant.size,
            color: variant.color,
            quantity: variant.quantity,
          }))
      : []
  );

  const uniqueSizesWithoutDuplicates = uniqueSizes?.length
    ? [...new Map(uniqueSizes.map((item: any) => [item.size, item])).values()]
    : [];

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
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
          className="col-span-1 border border-[#F6F7F8] rounded-lg group overflow-hidden shadow-sm transition-shadow duration-300 hover:shadow-lg"
        >
          <div className="relative w-full h-[280px] overflow-hidden">
            <img
              className="w-full h-full object-cover transition-transform duration-300 transform group-hover:scale-105"
              src={product.thumbnail}
              alt={product.name}
            />
            <div className="absolute hidden group-hover:flex w-full h-full top-0 left-0 bg-opacity-70 bg-gray-50 justify-center items-center gap-8 z-10">
              <IoHeartOutline
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
            <div className="absolute top-2 left-2 text-white font-semibold bg-red-500 px-2 rounded-md text-sm shadow-md">
              HOT
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
              {product.promotional_price} ₫
            </p>
            <p className="text-[#9098B1] text-sm font-medium line-through">
              {product.price} ₫
            </p>
            <p className="text-[#E71D36] text-sm font-semibold">-10%</p>
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
              <p className="mt-2">Select size and color:</p>
              <div className="flex flex-col gap-6 mt-4">
                {/* Size selection */}
                <div>
                  <h4 className="text-lg font-semibold mb-2">Size:</h4>
                  <div className="flex flex-wrap gap-2">
                    {uniqueSizesWithoutDuplicates?.map((sizeInfo: any) => {
                      const sizeVariant = products
                        ?.find((product: any) =>
                          product.variants?.some(
                            (variant: any) =>
                              variant.size === sizeInfo.size &&
                              variant.color === selectedColor
                          )
                        )
                        ?.variants?.find(
                          (variant: any) =>
                            variant.size === sizeInfo.size &&
                            variant.color === selectedColor
                        );

                      // Kiểm tra xem variant có tồn tại và có quantity hay không
                      const isSelected = selectedSize === sizeInfo.size;
                      const isDisabled = sizeVariant?.quantity === 0;

                      return (
                        <button
                          key={sizeInfo.size}
                          onClick={() =>
                            !isDisabled && handleSizeChange(sizeInfo.size)
                          }
                          className={`px-8 py-2 text-center text-sm font-medium border rounded-md ${
                            isSelected
                              ? "border-theme-color-primary ring-2 ring-theme-color-primary"
                              : "bg-white text-gray-700 border-gray-300"
                          } ${
                            isDisabled
                              ? "cursor-not-allowed opacity-50 line-through"
                              : "focus:outline-none focus:ring-2 focus:ring-theme-color-primary"
                          }`}
                          disabled={isDisabled}
                        >
                          {sizeInfo.size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color selection */}
                <div>
                  <h4 className="text-lg font-semibold mb-2">Color:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct?.variants
                      .map((variant) => variant.color)
                      .filter(
                        (value, index, self) => self.indexOf(value) === index
                      ) // Get unique colors
                      .map((color) => {
                        const isSelected = selectedColor === color;
                        return (
                          <button
                            key={color}
                            className={`px-6 py-2 border rounded-md hover:border-theme-color-primary focus:outline-none focus:ring-2 focus:ring-theme-color-primary flex items-center gap-2 ${
                              isSelected
                                ? "bg-theme-color-primary outline-none ring-2"
                                : ""
                            }`}
                            onClick={() => handleColorSelect(color)}
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

      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="modal modal-open">
            <div className="modal-box relative">
              <h2 className="text-2xl font-semibold text-center mb-4">
                You need to login
              </h2>
              <p className="text-center mb-4">
                Please login to add items to your cart.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  className="btn bg-blue-500 text-white"
                  onClick={handleLoginNow}
                >
                  Login Now
                </button>
                <button
                  className="btn bg-gray-300 text-black"
                  onClick={closeModal}
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

export default ProductCard;
