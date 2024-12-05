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
import { addToCart } from "../../services/client/cart";

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

  const parseVariants = (variantsStr: string) => {
    try {
      return JSON.parse(variantsStr);
    } catch (error) {
      return [];
    }
  };

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
    if (!selectedProduct) return;

    const parsedVariants = parseVariants(selectedProduct.variants);
    const selectedVariant = parsedVariants.find(
      variant => variant.color_id === selectedColor
    );

    if (selectedVariant) {
      const selectedSizeVariant = selectedVariant.sizes.find(
        size => size.size === selectedSize
      );

      if (selectedSizeVariant) {
        handleAddToCartDetail(
          selectedSizeVariant.product_variant_id,
          selectedSize,
          selectedColor,
          1
        );
        setSelectedProduct(null);
        setSelectedSize(null);
        setSelectedColor(null);
      } else {
        toast.error("Size or product is not available.");
      }
    } else {
      toast.error("Selected color not found.");
    }
  };

  const getVariantsForColor = (colorId: number) => {
    if (!selectedProduct) return [];
    
    const variants = parseVariants(selectedProduct.variants);
    const colorVariant = variants.find(
      variant => variant.color_id === colorId
    );
    
    return colorVariant?.sizes || [];
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
                onClick={() => handleCheckAdd(product)}
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
                <div>
                  <h4 className="text-lg font-semibold mb-2">Color:</h4>
                  <div className="flex flex-wrap gap-2">
                    {parseVariants(selectedProduct.variants).map((variant) => (
                      <button
                        key={variant.color_id}
                        className={`px-6 py-2 border rounded-md hover:border-theme-color-primary ${
                          selectedColor === variant.color_id ? 'bg-blue-500 text-white' : ''
                        }`}
                        onClick={() => {
                          setSelectedColor(variant.color_id);
                          setSelectedSize(null);
                        }}
                      >
                        {variant.color}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedColor && (
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold mb-2">Size:</h4>
                    <div className="flex flex-wrap gap-2">
                      {getVariantsForColor(selectedColor)
                        .sort((a, b) => Number(a.size) - Number(b.size))
                        .map((sizeVariant) => {
                          const isSelected = selectedSize === sizeVariant.size;
                          const isSizeAvailable = sizeVariant.quantity > 0;

                          return (
                            <button
                              key={sizeVariant.product_variant_id}
                              className={`px-6 py-2 border rounded-md ${
                                isSelected ? 'bg-blue-500 text-white' : ''
                              } ${!isSizeAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                              onClick={() => isSizeAvailable && setSelectedSize(sizeVariant.size)}
                              disabled={!isSizeAvailable}
                            >
                              {sizeVariant.size}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-4">
                <button
                  className="btn bg-gray-300 text-black"
                  onClick={() => {
                    setSelectedProduct(null);
                    setSelectedSize(null);
                    setSelectedColor(null);
                  }}
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
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="modal modal-open">
            <div className="modal-box relative">
              <h3 className="font-bold text-xl">You need to sign in</h3>
              <p className="mt-2">Please sign in to add items to your cart.</p>
              <div className="mt-4 flex justify-end gap-4">
                <button
                  className="btn bg-gray-300 text-black"
                  onClick={closeModal}
                >
                  Close
                </button>
                <button
                  className="btn bg-blue-500 text-white"
                  onClick={handleLoginNow}
                >
                  Login Now
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
