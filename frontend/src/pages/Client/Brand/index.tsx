import React, { useEffect, useState } from "react";
import { FaSearch, FaStar, FaTh, FaBars } from "react-icons/fa";
import { Link } from "react-router-dom";
import Breadcrumb from "../../../components/client/Breadcrumb";
import { useQuery } from "@tanstack/react-query";
import { getAllBrands } from "../../../services/client/brand";
import { Brand } from "../../../types/client/brands";
import Pagination from "../ProductList/Pagination";

const BrandPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("");
  const [itemsToShow, setItemsToShow] = useState(8);
  const [currrentPage, setCurrrentPage] = useState(1);
  const {
    data: brandsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["BRAND_KEY"],
    queryFn: () => getAllBrands(itemsToShow, currrentPage),
  });

  const brands = Array.isArray(brandsData?.brands) ? brandsData.brands : [];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortType(e.target.value);
  };

  const handleItemsToShow = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsToShow(Number(e.target.value));
  };

  const filteredBrands = brands.filter((brand: any) =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedBrands = filteredBrands.sort((a: any, b: any) => {
    if (sortType === "Name (A-Z)") return a.name.localeCompare(b.name);
    if (sortType === "Name (Z-A)") return b.name.localeCompare(a.name);
    if (sortType === "Rating (High to Low)")
      return b.average_rating - a.average_rating;
    if (sortType === "Rating (Low to High)")
      return a.average_rating - b.average_rating;
    return 0;
  });

  const totalPages = brandsData?.pagination.last_page || 1;

  useEffect(() => {
    refetch();
  }, [itemsToShow, currrentPage]);

  if (isLoading) return <div>Đang tải...</div>;

  if (isError) return <div>Lỗi khi tải dữ liệu!</div>;
  return (
    <>
      <Breadcrumb
        items={[
          { name: "Home", link: "/" },
          { name: "Brand", link: "/brand" },
        ]}
      />
      <div className="container mx-auto px-4 lg:px-16 py-8">
        {/* Header Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-6 space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <span className="w-19">{sortedBrands.length} Items</span>
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
            </select>
            <select
              className="select select-bordered bg-white text-gray-800"
              value={itemsToShow}
              onChange={handleItemsToShow}
            >
              <option value={8}>Show 8</option>
              <option value={14}>Show 14</option>
            </select>
          </div>

          {/* <div className="flex items-center space-x-2">
            <button className="btn btn-square bg-[#40BFFF] text-white">
              <FaTh />
            </button>
            <button className="btn btn-square bg-white text-gray-800 border border-gray-300">
              <FaBars />
            </button>
          </div> */}

          {/* Search Bar */}
          <div className="flex w-full justify-center mb-8 px-4">
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
        </div>

        {/* Brand Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {sortedBrands.slice(0, itemsToShow).map((brand: Brand) => (
            <Link
              to={`/brand/${brand.id}`}
              key={brand.id}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
            >
              <figure className="px-10 pt-10">
                <div className="w-full h-32 flex justify-center items-center">
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </figure>
              <div className="card-body items-center text-center">
                <h2 className="card-title">{brand.name}</h2>
                <div className="flex items-center justify-center">
                  <FaStar className="text-yellow-400 mr-1" />
                  <span>{brand.average_rating}</span>
                </div>
                <p>{brand.products_count} products</p>
                <div className="card-actions">
                  <button className="btn bg-[#40BFFF] hover:bg-[#3389cc] text-white border-none">
                    View Products
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Pagination
          currentPage={currrentPage}
          totalPages={totalPages}
          onPageChange={(newPage: number) => {
            setCurrrentPage(newPage);
            refetch();
          }}
        />
      </div>
    </>
  );
};

export default BrandPage;
