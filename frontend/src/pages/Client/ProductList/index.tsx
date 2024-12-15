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
import { Link } from "react-router-dom";

const ProductList = () => {
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [perPage, setPerPage] = useState(9);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>("newest");
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
      sortBy,
    ],
    queryFn: () =>
      filterProduct(
        priceRange[0],
        priceRange[1],
        page,
        perPage,
        selectedBrand,
        selectedSize,
        sortBy
      ),
    staleTime: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const parsePrice = (price: string | undefined) => {
    if (!price) return 0;
    return parseFloat(price.replace(/\./g, "").replace(",", "."));
  };

  const filteredProducts = useMemo(() => {
    let filteredData = [...(products?.data || [])];

    // Sort theo lựa chọn
    switch (sortBy) {
      case "newest":
        filteredData.sort((a, b) => b.id - a.id); // Sort theo ID giảm dần
        break;
      case "name-asc":
        filteredData.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filteredData.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        filteredData.sort(
          (a, b) =>
            parseFloat(a.promotional_price) - parseFloat(b.promotional_price)
        );
        break;
      case "price-desc":
        filteredData.sort(
          (a, b) =>
            parseFloat(b.promotional_price) - parseFloat(a.promotional_price)
        );
        break;
      case "rating-asc":
        filteredData.sort(
          (a, b) => parseFloat(b.rating_count) - parseFloat(a.rating_count)
        );
        break;
      case "rating-desc":
        filteredData.sort(
          (a, b) => parseFloat(a.rating_count) - parseFloat(b.rating_count)
        );
        break;
    }

    return filteredData;
  }, [products, sortBy]);

  useEffect(() => {
    refetch();
  }, [priceRange, products, selectedBrand, selectedSize, sortBy]);

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
    queryFn: () => getAllBrands(100, 1),
  });
  const brands = Array.isArray(brandsData?.brands) ? brandsData.brands : [];
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
          { name: "Trang chủ", link: "" },
          { name: "Sản phẩm", link: "products" },
        ]}
      />
      <div className="container max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 my-10 gap-10 px-5 md:px-10 lg:px-0">
        <div className="col-span-1 lg:col-span-3 flex flex-col gap-10">
          {/* Ưu đãi hot */}
          <div className="bg-[#F6F7F8] rounded-lg shadow-lg p-5 space-y-2">
            <h2 className="text-xl font-semibold capitalize">
              SẢN PHẨM BÁN CHẠY
            </h2>
            <ul className="flex flex-col gap-3">
              {products?.top_products?.map((product) => (
                <li
                  key={product.id}
                  className="flex justify-between hover:bg-gray-100 p-2 rounded-md"
                >
                  <Link
                    to={`/products/${product.id}`}
                    className="text-sm capitalize hover:text-blue-600 transition-colors flex-1"
                  >
                    {product.name}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {product.total_quantity}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Thanh trượt giá */}
          <div className="bg-[#F6F7F8] rounded-lg shadow-lg p-5 space-y-2">
            <h2 className="text-xl font-semibold capitalize">GIÁ</h2>
            <div className="flex flex-col gap-3">
              <span className="flex gap-8">
                <p className="text-[16px]">Khoảng giá:</p>
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

          {/* Kích cỡ */}
          <div className="bg-[#F6F7F8] rounded-lg shadow-lg p-5 space-y-2 relative">
            <h2 className="text-xl font-semibold capitalize">KÍCH CỠ</h2>
            <button
              onClick={() => handleSizeClick(0)} // Gọi hàm để reset kích cỡ
              className="absolute top-2 right-2 text-sm text-gray-500 hover:text-blue-600 transition-all"
            >
              Đặt lại
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

          {/* Thương hiệu */}
          <div className="bg-[#F6F7F8] rounded-lg shadow-lg p-5 space-y-2 relative">
            <h2 className="text-xl font-semibold capitalize">THƯƠNG HIỆU</h2>
            <button
              onClick={() => handleBrandClick(0)} // Gọi hàm để reset thương hiệu
              className="absolute top-2 right-2 text-sm text-gray-500 hover:text-blue-600 transition-all"
            >
              Đặt lại
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
                Xem thêm
              </button>
            )}
          </div>
        </div>

        <div className="col-span-1 lg:col-span-9 flex flex-col gap-8">
          <div className="hidden lg:block">
            <Banner />
          </div>

          {/* Bộ lọc */}
          <div className="flex gap-3">
            <div className="flex items-center gap-2">
              {/* <span>{filteredProducts.length} Sản phẩm</span> */}
              <select
                className="select select-sm lg:select-md select-bordered bg-white text-gray-800"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Mới nhất</option>
                <option value="name-asc">Tên A-Z</option>
                <option value="name-desc">Tên Z-A</option>
                <option value="price-asc">Giá từ thấp đến cao</option>
                <option value="price-desc">Giá từ cao đến thấp</option>
                <option value="rating-asc">Đánh giá từ cao đến thấp</option>
                <option value="rating-desc">Đánh giá từ thấp đến cao</option>
              </select>
            </div>

            {/* Hiển thị */}
            <div>
              <select
                className="select select-sm lg:select-md select-bordered bg-white text-gray-800"
                value={perPage}
                onChange={handleShowCountChange}
              >
                <option value={9}>Hiển thị 9</option>
                <option value={15}>Hiển thị 15</option>
              </select>
            </div>

            {/* Nút bố cục */}
            <div className="items-center space-x-2 ml-auto hidden lg:block">
              {/* Nút bố cục lưới */}
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

              {/* Nút bố cục danh sách */}
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

          {/* Danh sách sản phẩm */}
          <div
            className={`grid ${
              layout === "grid" ? "lg:grid-cols-3 grid-cols-2" : "grid-cols-1"
            } gap-2 md:gap-8`}
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
                <p>Không có sản phẩm nào</p>
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
