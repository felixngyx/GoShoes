import { Heart, ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAllProducts } from "../../../services/client/product";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { IProduct } from "../../../types/client/products/products";

const ProductCardList = () => {
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["PRODUCT_KEY"],
    queryFn: () => getAllProducts(1, 8),
  });

  const productList = response?.data || [];

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

  if (isLoading) {
    return <p>Loading....</p>;
  }
  if (isError) {
    return <p>Error.......</p>;
  }
  // Kiểm tra loại dữ liệu
  if (!Array.isArray(productList)) {
    console.warn("Expected productList to be an array but got:", productList);
    return <p>No products found.</p>;
  }

  return (
    <>
      {productList?.map((product: IProduct, index: number) => (
        <div className="flex flex-row gap-5">
          <div key={index} className="w-1/3">
            <img
              className="w-[650px] h-[300px] object-cover"
              src={product.thumbnail}
              alt={product.name}
            />
          </div>
          <div className="w-2/3">
            <div className="flex flex-col justify-between items-start h-full gap-2 p-2">
              <h3 className="text-2xl font-semibold">{product.name}</h3>
              <div className="flex flex-row gap-2 items-center">
                <div className="rating flex flex-row items-center gap-1">
                  <RatingStars rating={product.rating_count} />
                </div>
                <p className="text-sm text-[#C1C8CE]">12 reviews</p>
              </div>
              <hr className="w-2/3" />
              <div className="flex flex-row gap-2 items-center">
                <p className="text-xl font-semibold text-[#40BFFF]">
                  ${product.promotional_price}
                </p>
                <p className="text-sm line-through text-[#C1C8CE]">
                  ${product.price}
                </p>
                <p className="text-sm text-[#FF4242] font-semibold">-6% Off</p>
              </div>
              <p>{product.description}</p>
              <div className="flex flex-row gap-2">
                <button className="btn bg-[#ebf6ff] rounded-sm text-[#40BFFF] hover:bg-[#40BFFF] hover:text-[#fff] px-10 flex flex-row gap-2 items-center">
                  <ShoppingCart /> Add to cart
                </button>
                <button className="btn bg-[#ebf6ff] rounded-sm text-[#40BFFF] hover:bg-[#40BFFF] hover:text-[#fff] flex flex-row gap-2 items-center">
                  <Heart />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default ProductCardList;
