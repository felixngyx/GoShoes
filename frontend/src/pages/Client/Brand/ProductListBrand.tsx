import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { FaBars, FaSearch, FaTh } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import { getProductByBrandId } from "../../../services/client/product";
import { IProduct } from "../../../types/client/products/products";
import ProductItems from "../ProductList/ProductItem";
import ProductCardList from "../ProductList/ProductCardList";
import { getAllBrands } from "../../../services/client/brand";

const ProductListBrand = () => {
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("");
  const [itemsToShow, setItemsToShow] = useState(12);
  // state cho giá tối đa
  const { id } = useParams<{ id: string }>();

  const { data: products = [] } = useQuery<IProduct[]>({
    queryKey: ["PRODUCT_BRAND_ID", id],
    queryFn: async () => await getProductByBrandId(Number(id)),
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["BRANDS_KEY"],
    queryFn: getAllBrands,
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortType(e.target.value);
  };

  const handleItemsToShow = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsToShow(Number(e.target.value));
  };

  // Filter products based on searchTerm and price range
  const filterProduct = products.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort filtered products based on sortType
  const sortedProducts = filterProduct.sort((a: any, b: any) => {
    if (sortType === "Name (A-Z)") return a.name.localeCompare(b.name);
    if (sortType === "Name (Z-A)") return b.name.localeCompare(a.name);
    if (sortType === "Rating (High to Low)")
      return b.rating_count - a.rating_count;
    if (sortType === "Rating (Low to High)")
      return a.rating_count - b.rating_count;
    if (sortType === "Price (Low to High)")
      return a.promotional_price - b.promotional_price;
    if (sortType === "Price (High to Low)")
      return b.promotional_price - a.promotional_price;
    return 0;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Brand List - New Section */}
      <div className="mb-10 ">
        <h2 className="text-2xl font-semibold text-gray-700 mb-5">Brand</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {brands.map((item: any) => (
            <Link to={`/brand/${item.id}`} key={item.id}>
              <div className="card relative shadow-md hover:shadow-lg transition-transform duration-300 cursor-pointer bg-blue-500 rounded-lg text-center py-4 group hover:scale-105">
                {/* Nội dung */}
                <p className="relative z-10 text-lg font-bold text-white group-hover:text-gray-100 transition-colors duration-300">
                  {item.name}
                </p>

                {/* Gradient nền */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-blue-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg z-0"></div>

                {/* Viền hover */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-600 rounded-lg transition-all duration-300 z-10"></div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-center mb-6 space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <span>{sortedProducts.length} Items</span>
          <select
            className="select select-bordered bg-white text-gray-800"
            value={sortType}
            onChange={handleSort}
          >
            <option disabled value="">
              Sort By
            </option>
            <option>Name (A-Z)</option>
            <option>Name (Z-A)</option>
            <option>Rating (High to Low)</option>
            <option>Rating (Low to High)</option>
            <option>Price (Low to High)</option>{" "}
            {/* Thêm sắp xếp theo giá tăng dần */}
            <option>Price (High to Low)</option>{" "}
            {/* Thêm sắp xếp theo giá giảm dần */}
          </select>
          <select
            className="select select-bordered bg-white text-gray-800"
            value={itemsToShow}
            onChange={handleItemsToShow}
          >
            <option value={12}>Show 12</option>
            <option value={24}>Show 24</option>
            <option value={36}>Show 36</option>
          </select>
        </div>

        {/* Search Bar */}
        <div className="w-180 flex justify-center mb-8 px-4">
          <div className="form-control w-full max-w-5xl">
            <div className="input-group flex items-center w-full bg-gray-100 rounded-full px-6 py-3">
              <input
                type="text"
                placeholder="Search brands..."
                className="input input-bordered w-full bg-transparent border-none text-black focus:outline-none focus:ring-0"
                value={searchTerm}
                onChange={handleSearch}
              />
              <button className="btn bg-transparent hover:bg-[#3389cc] text-[#40BFFF] border-none">
                <FaSearch />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="btn btn-square bg-[#40BFFF] text-white">
            <FaTh />
          </button>
          <button className="btn btn-square bg-white text-gray-800 border border-gray-300">
            <FaBars />
          </button>
        </div>
      </div>

      {/* Product List */}
      <div
        className={`grid ${
          layout === "grid" ? "grid-cols-3 gap-6" : "grid-cols-1 gap-8"
        }`}
      >
        {sortedProducts.length > 0 ? (
          sortedProducts.slice(0, itemsToShow).map((product) => {
            const ProductComponent =
              layout === "grid" ? ProductItems : ProductCardList;
            return (
              <ProductComponent
                key={product.id}
                product={product}
                isLoading={false}
              />
            );
          })
        ) : (
          <p className="col-span-full text-center text-gray-500">
            Không có sản phẩm nào phù hợp.
          </p>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-3 mt-10">
        <button className="btn btn-outline btn-sm">1</button>
        <button className="btn btn-outline btn-sm">2</button>
        <button className="btn btn-outline btn-sm">...</button>
        <button className="btn btn-outline btn-sm">99</button>
        <button className="btn btn-outline btn-sm">100</button>
      </div>
    </div>
  );
};

export default ProductListBrand;
