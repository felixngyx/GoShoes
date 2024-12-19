import React, { useEffect, useState } from "react";
import { FaSearch, FaStar, FaTh, FaBars } from "react-icons/fa";
import { Link } from "react-router-dom";
import Breadcrumb from "../../../components/client/Breadcrumb";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { getAllBrands } from "../../../services/client/brand";
import { Brand } from "../../../types/client/brands";
import Pagination from "../ProductList/Pagination";
import LoadingIcon from "../../../components/common/LoadingIcon";

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
    queryKey: ["BRAND_KEY", currrentPage, itemsToShow],
    queryFn: () => getAllBrands(itemsToShow, currrentPage),
  });

  const queryClient = new QueryClient();

  const brands = Array.isArray(brandsData?.brands) ? brandsData.brands : [];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortType(e.target.value);
  };

  const handleItemsToShow = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsToShow(Number(e.target.value));
    queryClient.invalidateQueries({ queryKey: ["BRAND_KEY"] });
  };

  const filteredBrands = brands.filter((brand: any) =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedBrands = filteredBrands.sort((a: any, b: any) => {
    if (sortType === "Tên (A-Z)") return a.name.localeCompare(b.name);
    if (sortType === "Tên (Z-A)") return b.name.localeCompare(a.name);
    if (sortType === "Đánh giá (Cao đến Thấp)")
      return b.average_rating - a.average_rating;
    if (sortType === "Đánh giá (Thấp đến Cao)")
      return a.average_rating - b.average_rating;
    return 0;
  });

  const totalPages = brandsData?.pagination.last_page || 1;

  if (isError) return <div>Lỗi khi tải dữ liệu!</div>;
  return (
    <>
      <Breadcrumb
        items={[
          { name: "Trang chủ", link: "" },
          { name: "Thương hiệu", link: "brand" },
        ]}
      />
      <div className="container mx-auto px-4 lg:px-16 py-8">
        {/* Header Controls */}
        <div className="flex flex-col lg:flex-row lg:justify-between items-center mb-6 space-y-4 lg:space-y-0">
          <div className="flex items-center gap-4">
            {/* <span className="w-19">{sortedBrands.length} Items</span> */}
            <select
              className="select select-sm lg:select-md select-bordered bg-white text-gray-800"
              value={sortType}
              onChange={handleSort}
            >
              <option disabled value="">
                Sắp xếp theo
              </option>
              <option>Tên (A-Z)</option>
              <option>Tên (Z-A)</option>
              <option>Đánh giá (Cao đến Thấp)</option>
              <option>Đánh giá (Thấp đến Cao)</option>
            </select>
            <select
              className="select select-sm lg:select-md select-bordered bg-white text-gray-800"
              value={itemsToShow}
              onChange={handleItemsToShow}
            >
              <option value={8}>Hiển thị 8</option>
              <option value={14}>Hiển thị 14</option>
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
          <label className="input input-sm lg:input-md input-bordered flex items-center">
            <input
              className="w-64"
              type="text"
              placeholder="Tìm kiếm"
              value={searchTerm}
              onChange={handleSearch}
            />
            <FaSearch size={20} className="cursor-pointer" color="#40BFFF" />
          </label>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-screen">
            <LoadingIcon size="lg" type="spinner" color="info" />
          </div>
        ) : (
          <>
            {/* Brand Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {sortedBrands.slice(0, itemsToShow).map((brand: Brand) => (
                <Link
                  to={`/brand/${brand.id}`}
                  key={brand.id}
                  className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow border border-gray-100"
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
                    <p>{brand.products_count} sản phẩm</p>
                    <div className="card-actions">
                      <button className="btn bg-[#40BFFF] hover:bg-[#3389cc] text-white border-none">
                        Xem sản phẩm
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
          </>
        )}
      </div>
    </>
  );
};

export default BrandPage;
