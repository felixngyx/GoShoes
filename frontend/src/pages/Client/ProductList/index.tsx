import Slider from "@mui/material/Slider";
import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useState } from "react";
import { BsGrid3X3GapFill } from "react-icons/bs";
import { FaListUl } from "react-icons/fa";
import Banner from "../../../components/client/Banner";
import Breadcrumb from "../../../components/client/Breadcrumb";
import useDebounce from "../../../hooks/client/useDebounce";
import { filterProduct } from "../../../services/client/filterPrice";
import { IProduct } from "../../../types/client/products/products";
import ProductCardList from "./ProductCardList";
import ProductItems from "./ProductItem";

const ProductList = () => {
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [showCount, setShowCount] = useState(9);

  const { data: products, refetch } = useQuery<IProduct[]>({
    queryKey: ["PRODUCT_KEY", priceRange, showCount],
    queryFn: () => filterProduct(priceRange[0], priceRange[1], showCount),
    staleTime: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const formatPrice = (price: number) => {
    if (price < 1000000) return (price / 1000).toFixed(0) + " K";
    return (price / 1000000).toFixed(1) + " M";
  };

  const handlePriceChange = (event: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      setPriceRange(newValue as [number, number]);
    }
  };
  const debouncedRefetch = useCallback(
    useDebounce(() => {
      refetch();
    }, 1000),
    [refetch]
  );

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
          <div className="flex flex-row gap-5 bg-[#F6F7F8] px-5 py-2 items-center">
            <p className="text-lg">Sort by</p>
            <select className="select select-sm select-bordered w-fit">
              <option defaultValue="Name">Name</option>
              <option>Price</option>
              <option>Rating</option>
            </select>
            <p className="text-lg">Show</p>
            <select
              className="select select-sm select-bordered w-fit"
              onChange={handleShowCountChange}
            >
              <option defaultValue={9}>9</option>
              <option>12</option>
              <option>15</option>
            </select>
            <button
              className="ms-auto btn btn-sm bg-inherit hover:bg-inherit"
              onClick={() => setLayout("grid")}
            >
              <BsGrid3X3GapFill
                size={20}
                color={layout === "grid" ? "#40BFFF" : "#C1C8CE"}
              />
            </button>
            <button
              className="btn btn-sm bg-inherit hover:bg-inherit"
              onClick={() => setLayout("list")}
            >
              <FaListUl
                size={20}
                color={layout === "list" ? "#40BFFF" : "#C1C8CE"}
              />
            </button>
          </div>

          {/* Product List */}
          <div
            className={`grid ${
              layout === "grid" ? "grid-cols-3" : "grid-cols-1"
            } gap-5`}
          >
            {products === undefined ? (
              // Hiển thị loader khi đang tải dữ liệu
              <span className="loading loading-spinner loading-lg"></span>
            ) : products.length > 0 ? (
              // Hiển thị danh sách sản phẩm nếu có
              products.map((product) =>
                layout === "grid" ? (
                  <ProductItems key={product.id} product={product} />
                ) : (
                  <ProductCardList key={product.id} />
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
