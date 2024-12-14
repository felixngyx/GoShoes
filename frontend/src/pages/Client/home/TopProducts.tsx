import { FC, useState } from "react";
import { IoStar, IoChevronBack, IoChevronForward } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

type Product = {
  id: string;
  name: string;
  thumbnail: string;
  rating_count: number;
  promotional_price: number;
  price: number;
};

type TopProductsProps = {
  isLoadingProducts: boolean;
  top_products: Product[];
};

const ProductSkeleton = () => (
  <div className="w-full sm:w-[25%] px-4 flex-shrink-0">
    <div className="bg-white shadow-md rounded-lg overflow-hidden animate-pulse">
      <div className="w-full h-[250px] bg-gray-200"></div>
      <div className="p-4 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="flex items-center gap-1 my-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 w-4 bg-gray-200 rounded-full"></div>
          ))}
        </div>
        <div className="h-5 bg-gray-200 rounded w-24"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  </div>
);

const TopProducts: FC<TopProductsProps> = ({
  isLoadingProducts,
  top_products,
}) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const productsPerPage = 4;

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev + productsPerPage >= top_products.length ? 0 : prev + productsPerPage
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev - productsPerPage < 0
        ? top_products.length - productsPerPage
        : prev - productsPerPage
    );
  };

  return (
    <div className="container mx-auto my-12 px-6">
      <p className="text-4xl font-extrabold text-center text-gray-900 mb-8">
        Sản Phẩm Hàng Đầu
      </p>

      {/* Mobile View: Scrollable */}
      <div className="flex sm:hidden gap-4 overflow-x-auto scroll-snap-x">
        {isLoadingProducts
          ? [...Array(4)].map((_, index) => (
            <div
              key={index}
              className="min-w-[80%] flex-shrink-0 scroll-snap-align-start"
            >
              <ProductSkeleton />
            </div>
          ))
          : top_products.map((product) => (
            <div
              key={product.id}
              className="min-w-[80%] flex-shrink-0 scroll-snap-align-start"
              onClick={() => navigate(`/products/${product.id}`)}
            >
              <div className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="w-[380px] h-[250px] relative">
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    className="w-full h-full object-cover transform transition-all duration-500 hover:scale-110"
                  />
                  <p className="absolute top-2 right-2 text-white bg-red-600 text-xs font-semibold px-2 py-1 rounded-full z-10">
                    Nóng
                  </p>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-lg font-semibold text-gray-800 hover:text-blue-500 transition-colors truncate">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-1 my-2 text-yellow-500">
                    {[...Array(Math.floor(Number(product.rating_count)))].map(
                      (_, i) => (
                        <IoStar key={i} />
                      )
                    )}
                  </div>
                  <div className="flex items-baseline justify-between">
                    {product.promotional_price ? (
                      <>
                        <p className="text-red-500 font-bold text-xl">
                          {Number(product.promotional_price).toLocaleString(
                            "vi-VN"
                          )}{" "}
                          ₫
                        </p>
                        <p className="text-gray-400 text-sm line-through">
                          {Number(product.price).toLocaleString("vi-VN")} ₫
                        </p>
                      </>
                    ) : (
                      <p className="text-red-500 font-bold text-xl">
                        {Number(product.price).toLocaleString("vi-VN")} ₫
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Desktop View: With Buttons */}
      <div className="hidden sm:block relative">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500"
            style={{
              transform: `translateX(-${(currentIndex / productsPerPage) * 100
                }%)`,
            }}
          >
            {isLoadingProducts
              ? [...Array(productsPerPage)].map((_, index) => (
                <ProductSkeleton key={index} />
              ))
              : top_products
                .slice(currentIndex, currentIndex + productsPerPage)
                .map((product) => (
                  <div
                    key={product.id}
                    className="w-full sm:w-[25%] px-4 flex-shrink-0"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                      <div className="w-full h-[250px] relative">
                        <img
                          src={product.thumbnail}
                          alt={product.name}
                          className="w-full h-full object-cover transform transition-all duration-500 hover:scale-110"
                        />
                        <p className="absolute top-2 right-2 text-white bg-red-600 text-xs font-semibold px-2 py-1 rounded-full z-10">
                          Nóng
                        </p>
                      </div>
                      <div className="p-4 space-y-3">
                        <p className="text-lg font-semibold text-gray-800 hover:text-blue-500 transition-colors truncate">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-1 my-2 text-yellow-500">
                          {[
                            ...Array(
                              Math.floor(Number(product.rating_count))
                            ),
                          ].map((_, i) => (
                            <IoStar key={i} />
                          ))}
                        </div>
                        <div className="flex items-baseline justify-between">
                          {product.promotional_price ? (
                            <>
                              <p className="text-red-500 font-bold text-xl">
                                {Number(
                                  product.promotional_price
                                ).toLocaleString("vi-VN")}{" "}
                                ₫
                              </p>
                              <p className="text-gray-400 text-sm line-through">
                                {Number(product.price).toLocaleString(
                                  "vi-VN"
                                )}{" "}
                                ₫
                              </p>
                            </>
                          ) : (
                            <p className="text-red-500 font-bold text-xl">
                              {Number(product.price).toLocaleString("vi-VN")}{" "}
                              ₫
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
        <button
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
          onClick={prevSlide}
        >
          <IoChevronBack size={24} />
        </button>
        <button
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
          onClick={nextSlide}
        >
          <IoChevronForward size={24} />
        </button>
      </div>
    </div>
  );
};

export default TopProducts;
