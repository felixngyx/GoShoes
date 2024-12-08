import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { IoChevronBack, IoChevronForward, IoStar } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { getProductsHomeCustom } from "../../../services/client/product";
import { IProduct } from "../../../types/client/products/products";

const ProductSkeleton = () => (
  <div className="shadow-md animate-pulse w-[200px] flex-shrink-0 mx-2">
    <div className="bg-gray-200 h-[150px] w-full"></div>
    <div className="mt-2 space-y-2">
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-4 w-4 bg-gray-200 rounded-full"></div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div className="h-5 bg-gray-200 rounded w-24"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  </div>
);

const NewestProducts = () => {
  const { data: product, isLoading } = useQuery({
    queryKey: ["NEWEST_PRODUCT"],
    queryFn: getProductsHomeCustom,
  });

  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const productsPerPage = 5;

  const handleNext = () => {
    if (product?.newProducts) {
      const nextIndex = currentIndex + productsPerPage;
      if (nextIndex < product.newProducts.length) {
        setCurrentIndex(nextIndex);
      } else {
        setCurrentIndex(0);
      }
    }
  };

  const handlePrev = () => {
    if (product?.newProducts) {
      const prevIndex = currentIndex - productsPerPage;
      if (prevIndex >= 0) {
        setCurrentIndex(prevIndex);
      } else {
        setCurrentIndex(product.newProducts.length - productsPerPage); // Quay lại cuối danh sách
      }
    }
  };

  return (
    <div className="container mx-auto my-22 px-4">
      <p className="text-4xl font-extrabold text-center text-gray-900 mb-6">
        Newest
      </p>
      <div className="relative">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500"
            style={{
              transform: `translateX(-${
                (currentIndex * 100) / productsPerPage
              }%)`,
            }}
          >
            {isLoading
              ? [...Array(productsPerPage)].map((_, index) => (
                  <ProductSkeleton key={index} />
                ))
              : product?.newProducts?.map((product: IProduct) => (
                  <div
                    key={product.id}
                    className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 w-[200px] flex-shrink-0 mx-2"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <div className="w-full h-[250px] relative">
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-full h-full object-cover transform transition-all duration-500 hover:scale-110"
                      />
                      <p className="absolute top-2 right-2 text-white bg-red-600 text-xs font-semibold px-2 py-1 rounded-full z-10">
                        News
                      </p>
                    </div>
                    <div className="p-4">
                      <p className="text-lg font-semibold text-gray-800 hover:text-blue-500 transition-colors truncate">
                        {product.name}
                      </p>

                      <div className="flex items-center gap-1 my-2 text-yellow-500">
                        {[
                          ...Array(Math.floor(Number(product.rating_count))),
                        ].map((_, i) => (
                          <IoStar key={i} />
                        ))}
                      </div>
                      <div className="flex items-baseline justify-between">
                        <p className="text-red-500 font-bold text-lg">
                          {Number(product.promotional_price).toLocaleString(
                            "vi-VN"
                          )}{" "}
                          ₫
                        </p>
                        <p className="text-gray-400 text-sm line-through">
                          {Number(product.price).toLocaleString("vi-VN")} ₫
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
        <button
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
          onClick={handlePrev}
        >
          <IoChevronBack size={20} />
        </button>
        <button
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
          onClick={handleNext}
        >
          <IoChevronForward size={20} />
        </button>
      </div>
    </div>
  );
};

export default NewestProducts;
