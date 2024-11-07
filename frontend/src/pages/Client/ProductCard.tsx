import { useQuery } from "@tanstack/react-query";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { IoCart, IoHeartOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { getAllProducts } from "../../services/client/product";
import { IProduct } from "../../types/client/products/products";

const ProductCard = () => {
  const {
    data: products,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["PRODUCT_KEY"],
    queryFn: () => getAllProducts(1, 8),
  });

  const RatingStars = ({ rating }: { rating: number }) => (
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

  if (isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  if (isError) {
    return <p>Error loading products. Please try again.</p>;
  }

  // Ensure products is an array before mapping
  if (!Array.isArray(products)) {
    return <p>No products available.</p>;
  }

  return (
    <>
      {products.map((product: IProduct) => (
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
    </>
  );
};

export default ProductCard;
