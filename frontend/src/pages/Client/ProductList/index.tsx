import Slider from "@mui/material/Slider";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import { FaArrowDown, FaBars, FaTh } from "react-icons/fa";
import Banner from "../../../components/client/Banner";
import Breadcrumb from "../../../components/client/Breadcrumb";
import { filterProduct } from "../../../services/client/filterPrice";
import { IProduct } from "../../../types/client/products/products";
import ProductCardList from "./ProductCardList";
import ProductItems from "./ProductItem";
import Pagination from "./Pagination";
import { getAllBrands } from "../../../services/client/brand";
import { getAllSizes } from "../../../services/client/product";

const ProductList = () => {
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [perPage, setPerPage] = useState(9);
  const [page, setPage] = useState(1);
  const [sortByName, setSortByName] = useState<"asc" | "desc" | undefined>();
  const [sortByPrice, setSortByPrice] = useState<"asc" | "desc" | undefined>();
  const [sortByRating, setSortByRating] = useState<
    "asc" | "desc" | undefined
  >();
  const [selectedSize, setSelectedSize] = useState<number | number>(0);
  const [selectedBrand, setSelectedBrand] = useState<number | number>(0);

  // api products
  const {
    data: products,
    isLoading,
    refetch,
  } = useQuery<IProduct[]>({
    queryKey: [
      "PRODUCT_KEY",
      priceRange,
      page,
      perPage,
      selectedBrand,
      selectedSize,
      sortByName,
      sortByPrice,
      sortByRating,
    ],
    queryFn: () =>
      filterProduct(
        priceRange[0],
        priceRange[1],
        page,
        perPage,
        selectedBrand,
        selectedSize,
        sortByName,
        sortByPrice,
        sortByRating
      ),
    staleTime: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  console.log("1", products);

  const parsePrice = (price: string | undefined) => {
    if (!price) return 0;
    return parseFloat(price.replace(/\./g, "").replace(",", "."));
  };

  const filteredProducts = useMemo(() => {
    let filteredData = [...(products?.data || [])];

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
      filteredData.sort((a: any, b: any) => {
        const priceA = parsePrice(a.promotional_price);
        const priceB = parsePrice(b.promotional_price);

        return sortByPrice === "asc" ? priceA - priceB : priceB - priceA;
      });
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
  }, [
    products,
    priceRange,
    sortByName,
    sortByPrice,
    sortByRating,
    selectedBrand,
    selectedSize,
  ]);

  useEffect(() => {
    refetch();
  }, [
    priceRange,
    products,
    selectedBrand,
    selectedSize,
    sortByName,
    sortByPrice,
    sortByRating,
  ]);

  const formatPrice = (price: number) => {
    if (price < 1000000) return (price / 1000).toFixed(0) + " K";
    return (price / 1000000).toFixed(1) + " M";
  };

  const handlePriceChange = (event: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      setPriceRange(newValue as [number, number]);
      setPage(0);
      setPage(1);
    }
  };

  // useEffect(() => {
  //   const loadData = async () => {
  //     setIsLoading(true);
  //     setIsLoading(false);
  //   };

  //   loadData();
  // }, [priceRange, products]);

  const handlePriceChangeCommitted = () => {
    refetch();
  };

  const handleShowCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPerPage(Number(e.target.value));
  };

  const totalPages = products?.total_pages || 1;

  const handleSizeClick = (sizeId: number) => {
    setSelectedSize(sizeId); // Set the selected size
    setPage(1);
  };

  const handleBrandClick = (brandId: number) => {
    setSelectedBrand(brandId); // Set the selected brand
    setPage(1);
  };

  // api brands
  const { data: brandsData } = useQuery({
    queryKey: ["BRAND_KEY"],
    queryFn: getAllBrands,
  });
  const brands = Array.isArray(brandsData) ? brandsData : [];
  const [isExpanded, setIsExpanded] = useState(false);

  // Hiển thị tối đa 6 thương hiệu đầu tiên
  const brandsToDisplay = isExpanded ? brands : brands.slice(0, 6);
  // api sizes
  const { data: sizesData } = useQuery({
    queryKey: ["SIZE_KEY"],
    queryFn: getAllSizes,
  });

  // Loại bỏ các giá trị trùng lặp và sắp xếp theo size tăng dần
  const uniqueSortedSizes = Array.from(
    new Set(sizesData?.map((size: any) => size.size))
  )
    .map((size) => {
      // Tìm object tương ứng với size duy nhất
      return sizesData.find((item: any) => item.size === size);
    })
    .sort((a, b) => a.size - b.size);

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
          <div className="bg-[#F6F7F8] rounded-lg shadow-lg p-5 space-y-2 relative">
            <h2 className="text-xl font-semibold capitalize">SIZE</h2>
            <button
              onClick={() => handleSizeClick(0)} // Gọi hàm để reset size
              className="absolute top-2 right-2 text-sm text-gray-500 hover:text-blue-600 transition-all"
            >
              Reset
            </button>
            <div className="flex flex-wrap gap-2">
              {uniqueSortedSizes?.map((size: any) => {
                const isSelected = size.id === selectedSize;
                return (
                  <button
                    key={size.id}
                    onClick={() => handleSizeClick(size.id)} // Gọi hàm khi click
                    className={`flex justify-center items-center p-4 w-14 border rounded-md cursor-pointer hover:bg-blue-100 hover:text-blue-600 transition-all ${
                      isSelected
                        ? "bg-blue-100 text-blue-600 border-blue-600"
                        : ""
                    }`}
                  >
                    <span className="text-sm capitalize">{size.size}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Brand */}
          <div className="bg-[#F6F7F8] rounded-lg shadow-lg p-5 space-y-2 relative">
            <h2 className="text-xl font-semibold capitalize">BRAND</h2>
            <button
              onClick={() => handleBrandClick(0)} // Gọi hàm để reset brand
              className="absolute top-2 right-2 text-sm text-gray-500 hover:text-blue-600 transition-all"
            >
              Reset
            </button>
            <ul className="flex flex-col gap-3">
              {brandsToDisplay.map((brand: any) => {
                const isSelected = brand.id === selectedBrand;
                return (
                  <li
                    key={brand.id}
                    onClick={() => handleBrandClick(brand.id)} // Gọi hàm khi click
                    className={`flex justify-between p-2 rounded-md cursor-pointer hover:bg-blue-100 hover:text-blue-600 transition-all ${
                      isSelected ? "bg-blue-100 text-blue-600" : ""
                    }`}
                  >
                    <p className="text-sm capitalize">{brand.name}</p>
                    <p className="text-sm text-gray-500">
                      {brand.products_count}
                    </p>
                  </li>
                );
              })}
            </ul>

            {!isExpanded && (
              <button
                onClick={() => setIsExpanded(true)}
                className="btn w-full text-[#449ef1aa]"
              >
                More
              </button>
            )}
          </div>
        </div>

        <div className="col-span-9 flex flex-col gap-10">
          <Banner />

          {/* Filter */}
          <div className="flex gap-3">
            <div className="flex items-center gap-2">
              <span>{filteredProducts.length} Items</span>
              <select
                className="select select-bordered bg-white text-gray-800"
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
                <option disabled value="">
                  Sort By
                </option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="price-asc">Price Low to High</option>
                <option value="price-desc">Price High to Low</option>
                <option value="rating-asc">Rating Highest to Lowest</option>
                <option value="rating-desc">Rating Lowest to Highest</option>
              </select>
            </div>

            {/* Show Select */}
            <div>
              <select
                className="select select-bordered bg-white text-gray-800"
                value={perPage}
                onChange={handleShowCountChange}
              >
                <option value={9}>Show 9</option>
                <option value={15}>Show 15</option>
              </select>
            </div>

            {/* Layout Buttons */}
            <div className="items-center space-x-2 ml-auto">
              {/* Button Grid Layout */}
              <button
                className={`btn btn-square ${
                  layout === "grid"
                    ? "bg-[#40BFFF] text-white"
                    : "bg-white text-gray-800 border border-gray-300"
                }`}
                onClick={() => setLayout("grid")}
              >
                <FaTh />
              </button>

              {/* Button List Layout */}
              <button
                className={`btn btn-square ${
                  layout === "list"
                    ? "bg-[#40BFFF] text-white"
                    : "bg-white text-gray-800 border border-gray-300"
                }`}
                onClick={() => setLayout("list")}
              >
                <FaBars />
              </button>
            </div>
          </div>

          {/* Product List */}
          <div
            className={`grid ${
              layout === "grid" ? "grid-cols-3" : "grid-cols-1"
            } gap-5`}
          >
            {isLoading ? (
              <>
                {Array(filteredProducts.length || 9) // Hoặc một giá trị cố định nếu muốn
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
            ) : filteredProducts.length > 0 ? (
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
              <div className="col-span-full text-center">
                <p>There are no products</p>
              </div>
            )}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage: number) => {
              setPage(newPage);
              refetch();
            }}
          />
        </div>
      </div>
    </>
  );
};

export default ProductList;
