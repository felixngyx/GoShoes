import {
  AiFillStar,
  AiOutlineStar,
  AiOutlineLeft,
  AiOutlineRight,
} from "react-icons/ai";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllRelatedProducts } from "../../../services/client/product";
import { IProduct } from "../../../types/client/products/products";
import { Link } from "react-router-dom";
import { formatVNCurrency } from "../../../common/formatVNCurrency";

interface RelatedProductProps {
  id: number; // Brand ID
  productId: number; // Product ID
}

const RelatedProduct: React.FC<RelatedProductProps> = ({ id, productId }) => {
  const {
    data: relatedProducts = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["RELATED_PRODUCTS_KEY", id],
    queryFn: async () => await getAllRelatedProducts(id),
    enabled: !!id,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsToShow = 4;

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - itemsToShow, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      Math.min(prev + itemsToShow, relatedProducts.length - itemsToShow)
    );
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

  // Lọc sản phẩm để loại bỏ sản phẩm hiện tại
  const filteredProducts = relatedProducts.filter(
    (product: IProduct) => product.id !== productId
  );

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading related products</div>;

  return (
    <div className="col-span-1 md:col-span-12 mt-8 relative">
      <h3 className="text-lg mb-2 text-[#C1C8CE]">Related Products</h3>
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-700"
          style={{
            transform: `translateX(-${(currentIndex * 100) / itemsToShow}%)`,
          }}
        >
          {filteredProducts.map((product: IProduct) => (
            <div key={product.id} className="min-w-[25%] p-2">
              <div className="space-y-4 border rounded-sm">
                <div className="flex flex-col gap-2">
                  <Link to={`/products/${product.id}`}>
                    <img
                      className="h-[280px] w-full object-cover"
                      src={product.thumbnail}
                      alt={product.name}
                    />
                  </Link>

                  <div className="flex items-center justify-center gap-1 my-2">
                    <RatingStars rating={product.rating_count} />
                  </div>
                  <div className="flex items-center gap-2 justify-center mb-2">
                    <span className="text-lg text-[#40BFFF]">
                      {formatVNCurrency(product.promotional_price)} ₫
                    </span>
                    <span className="text-sm text-[#9098B1] line-through">
                      {formatVNCurrency(product.price)} ₫
                    </span>
                    <span className="text-sm font-bold text-[#FB7181]">
                      -10%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-y-0 left-0 flex items-center">
        <button
          onClick={handlePrev}
          className="bg-white rounded-full p-2 hover:bg-gray-200 transition ease-in-out duration-300"
        >
          <AiOutlineLeft />
        </button>
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center">
        <button
          onClick={handleNext}
          className="bg-white rounded-full p-2 hover:bg-gray-200 transition ease-in-out duration-300"
        >
          <AiOutlineRight />
        </button>
      </div>
    </div>
  );
};

export default RelatedProduct;
