import Slider from "@mui/material/Slider";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import { BsGrid3X3GapFill } from "react-icons/bs";
import { FaListUl } from "react-icons/fa";
import Banner from "../../../components/client/Banner";
import Breadcrumb from "../../../components/client/Breadcrumb";
import { filterProduct } from "../../../services/client/filterPrice";
import { IProduct } from "../../../types/client/products/products";
import ProductCardList from "./ProductCardList";
import ProductItems from "./ProductItem";

const ProductList = () => {
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [showCount, setShowCount] = useState(9);
  const [sortByName, setSortByName] = useState<"asc" | "desc" | undefined>();
  const [sortByPrice, setSortByPrice] = useState<"asc" | "desc" | undefined>();
  const [sortByRating, setSortByRating] = useState<
    "asc" | "desc" | undefined
  >();

  const { data: products, refetch } = useQuery<IProduct[]>({
    queryKey: [
      "PRODUCT_KEY",
      priceRange,
      showCount,
      sortByName,
      sortByPrice,
      sortByRating,
    ],
    queryFn: () => filterProduct(priceRange[0], priceRange[1], showCount),
    staleTime: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const filteredProducts = useMemo(() => {
    let filteredData = [...(products || [])];

    // Lọc theo giá
    filteredData = filteredData.filter(
      (product) =>
        product.promotional_price >= priceRange[0] &&
        product.promotional_price <= priceRange[1]
    );

    // Sắp xếp theo tên
    if (sortByName) {
      filteredData.sort((a, b) =>
        sortByName === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      );
    }

    // Sắp xếp theo giá
    if (sortByPrice) {
      filteredData.sort((a, b) =>
        sortByPrice === "asc"
          ? a.promotional_price - b.promotional_price
          : b.promotional_price - a.promotional_price
      );
    }

    // Sắp xếp theo rating
    if (sortByRating) {
      filteredData.sort((a, b) =>
        sortByRating === "asc"
          ? b.rating_count - a.rating_count
          : a.rating_count - b.rating_count
      );
    }

    return filteredData;
  }, [products, priceRange, sortByName, sortByPrice, sortByRating]);

  useEffect(() => {
    refetch();
  }, [sortByName, sortByPrice, sortByRating]);

  const formatPrice = (price: number) => {
    if (price < 1000000) return (price / 1000).toFixed(0) + " K";
    return (price / 1000000).toFixed(1) + " M";
  };

  const handlePriceChange = (event: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      setPriceRange(newValue as [number, number]);
    }
  };

  const handlePriceChangeCommitted = () => {
    refetch();
  };

  const handleShowCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setShowCount(Number(e.target.value));
  };

  return (
    <>
      <Breadcrumb
        items={[
          { name: "Home", link: "" },
          { name: "Products", link: "products" },
        ]}
      />
      <div className="container max-w-7xl mx-auto grid grid-cols-12 my-10 gap-10 ">
        <div className="col-span-3 flex flex-col gap-10">
          {/* Hot Deals */}
          <div className="bg-[#F6F7F8] rounded-lg shadow-lg p-5 space-y-2">
            <h2 className="text-xl font-semibold capitalize">HOT DEALS</h2>
            <ul className="flex flex-col gap-3">
              {[
                "Air Jordan",
                "Nike Air Max",
                "Puma",
                "Air Force 1",
                "Converse",
                "Balenciaga",
              ].map((item) => (
                <li key={item} className="flex justify-between">
                  <p className="text-sm capitalize">{item}</p>
                  <p className="text-sm text-gray-500">30</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Price Slider */}
          <div className="bg-[#F6F7F8] rounded-lg shadow-lg p-5 space-y-2">
            <h2 className="text-xl font-semibold capitalize">PRICE</h2>
            <div className="flex flex-col gap-3">
              <span className="flex gap-8">
                <p className="text-[16px]">Range:</p>
                <p>
                  {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                </p>
              </span>
              <Slider
                value={priceRange}
                onChange={handlePriceChange}
                onChangeCommitted={handlePriceChangeCommitted}
                valueLabelDisplay="off"
                min={0}
                max={10000000}
                step={500000}
                sx={{
                  color: "#40BFFF",
                  height: 4,
                  "& .MuiSlider-thumb": {
                    height: 20,
                    width: 20,
                    backgroundColor: "white",
                    border: "2px solid #40BFFF",
                    "&:hover": {
                      boxShadow: "inherit",
                    },
                  },
                  "& .MuiSlider-track": {
                    border: "none",
                    height: 4,
                  },
                  "& .MuiSlider-rail": {
                    color: "#C1C8CE",
                    height: 4,
                  },
                }}
              />
            </div>
          </div>

          {/* Size */}
          <div className="bg-[#F6F7F8] rounded-lg shadow-lg p-5 space-y-2">
            <h2 className="text-xl font-semibold capitalize">SIZE</h2>
            <div className="flex flex-wrap gap-2">
              {[37, 38, 39, 40, 41, 42, 43].map((size) => (
                <button
                  key={size}
                  className="btn btn-sm text-black bg-white rounded-full capitalize"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Brand */}
          <div className="bg-[#F6F7F8] rounded-lg shadow-lg p-5 space-y-2">
            <h2 className="text-xl font-semibold capitalize">BRAND</h2>
            <ul className="flex flex-col gap-3">
              {["Nike", "Adidas", "Puma", "All Starts", "Air Jordan"].map(
                (brand) => (
                  <li key={brand} className="flex justify-between">
                    <p className="text-sm capitalize">{brand}</p>
                    <p className="text-sm text-gray-500">10</p>
                  </li>
                )
              )}
            </ul>
          </div>

          <button className="btn rounded-none text-md">More</button>
        </div>

        <div className="col-span-9 flex flex-col gap-10">
          <Banner />

          {/* Filter */}
          <div className="flex flex-wrap gap-5 bg-[#F6F7F8] px-5 py-2 items-center justify-start">
            <div className="flex items-center gap-2">
              <p className="text-lg">Sort By</p>

              <select
                className="select select-bordered select-sm w-fit"
                onChange={(e) => {
                  const [type, order] = e.target.value.split("-");
                  if (type === "name") {
                    setSortByName(order as "asc" | "desc");
                  } else if (type === "price") {
                    setSortByPrice(order as "asc" | "desc");
                  } else if (type === "rating") {
                    setSortByRating(order as "asc" | "desc");
                  }
                }}
              >
                <option value="">Sort By</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="price-asc">Price Low to High</option>
                <option value="price-desc">Price High to Low</option>
                <option value="rating-asc">Rating Highest to Lowest</option>
                <option value="rating-desc">Rating Lowest to Highest</option>
              </select>
            </div>

            {/* Show Select */}
            <div className="flex items-center gap-2">
              <p className="text-lg">Show</p>
              <select
                className="select select-bordered select-sm w-fit"
                onChange={handleShowCountChange}
              >
                <option defaultValue={9}>9</option>
                <option>12</option>
                <option>15</option>
              </select>
            </div>

            {/* Layout Buttons */}
            <div className="ml-auto flex gap-3">
              <button
                className="btn btn-sm btn-outline flex justify-center content-center"
                onClick={() => setLayout("grid")}
              >
                <BsGrid3X3GapFill
                  size={20}
                  color={layout === "grid" ? "#40BFFF" : "#C1C8CE"}
                />
              </button>
              <button
                className="btn btn-sm btn-outline flex justify-center content-center"
                onClick={() => setLayout("list")}
              >
                <FaListUl
                  size={20}
                  color={layout === "list" ? "#40BFFF" : "#C1C8CE"}
                />
              </button>
            </div>
          </div>

          {/* Product List */}
          <div
            className={`grid ${
              layout === "grid" ? "grid-cols-3" : "grid-cols-1"
            } gap-5`}
          >
            {products === undefined ? (
              // Hiển thị skeleton loading khi đang tải dữ liệu
              <>
                {Array(9)
                  .fill(null)
                  .map((_, index) =>
                    layout === "grid" ? (
                      <ProductItems
                        key={index}
                        product={null}
                        isLoading={true}
                      />
                    ) : (
                      <ProductCardList
                        key={index}
                        product={null}
                        isLoading={true}
                      />
                    )
                  )}
              </>
            ) : products.length > 0 ? (
              // Hiển thị danh sách sản phẩm nếu có
              filteredProducts.map((product) =>
                layout === "grid" ? (
                  <ProductItems
                    key={product.id}
                    product={product}
                    isLoading={false}
                  />
                ) : (
                  <ProductCardList
                    key={product.id}
                    product={product}
                    isLoading={false}
                  />
                )
              )
            ) : (
              // Hiển thị thông báo khi không có sản phẩm nào
              <p className="text-center text-gray-500">
                Không có sản phẩm nào phù hợp.
              </p>
            )}
          </div>

          <div className="join mx-auto">
            <button className="join-item btn">1</button>
            <button className="join-item btn">2</button>
            <button className="join-item btn btn-disabled">...</button>
            <button className="join-item btn">99</button>
            <button className="join-item btn">100</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductList;
